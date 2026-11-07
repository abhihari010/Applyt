package com.apptracker.integration;

import com.apptracker.model.PasswordResetToken;
import com.apptracker.model.RefreshToken;
import com.apptracker.model.User;
import com.apptracker.repository.PasswordResetTokenRepository;
import com.apptracker.repository.RefreshTokenRepository;
import com.apptracker.security.AuthCookies;
import com.apptracker.service.RefreshTokenService;
import com.apptracker.util.TokenUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.ResultActions;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionApiTest extends IntegrationTestBase {

    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired RefreshTokenService refreshTokenService;
    @Autowired PasswordResetTokenRepository resetTokens;

    private MockHttpServletResponse login(User user) throws Exception {
        return mvc.perform(withJson(post("/api/auth/login"), Map.of("email", user.getEmail(), "password", PASSWORD))
                .with(freshIp()))
                .andExpect(status().isOk())
                .andReturn().getResponse();
    }

    private static Cookie refreshCookie(MockHttpServletResponse response) {
        return response.getCookie(AuthCookies.REFRESH);
    }

    private ResultActions refresh(Cookie refreshCookie) throws Exception {
        return mvc.perform(browser(post("/api/auth/refresh")).cookie(refreshCookie));
    }

    /** Puts a token past the grace period, so that presenting it counts as reuse rather than a tab race. */
    private void ageRotation(Cookie cookie) {
        RefreshToken token = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getTokenHash().equals(TokenUtils.sha256Hex(cookie.getValue())))
                .findFirst().orElseThrow();
        token.setRotatedAt(OffsetDateTime.now().minusMinutes(1));
        refreshTokenRepository.save(token);
    }

    // Cookies

    @Test
    void loginSetsHttpOnlyCookiesAndKeepsTokensOutOfTheBody() throws Exception {
        MockHttpServletResponse response = login(verifiedUser());

        Cookie access = response.getCookie(AuthCookies.ACCESS);
        Cookie refresh = refreshCookie(response);
        for (Cookie cookie : new Cookie[] {access, refresh}) {
            assertThat(cookie.isHttpOnly()).isTrue();
            assertThat(cookie.getSecure()).isTrue();
            assertThat(cookie.getAttribute("SameSite")).isEqualTo("Lax");
        }
        assertThat(access.getPath()).isEqualTo("/");
        assertThat(access.getMaxAge()).isEqualTo(15 * 60);
        assertThat(refresh.getPath()).isEqualTo("/api/auth");
        assertThat(refresh.getMaxAge()).isEqualTo(30 * 24 * 60 * 60);

        String body = response.getContentAsString();
        assertThat(json.readTree(body).has("token")).isFalse();
        assertThat(body).doesNotContain(access.getValue()).doesNotContain(refresh.getValue());
    }

    @Test
    void accessCookieAuthenticatesRequests() throws Exception {
        User user = verifiedUser();
        Cookie access = login(user).getCookie(AuthCookies.ACCESS);

        mvc.perform(get("/api/auth/me").cookie(access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()));
    }

    @Test
    void refreshTokenIsOnlyStoredAsAHash() throws Exception {
        Cookie refresh = refreshCookie(login(verifiedUser()));

        assertThat(refreshTokenRepository.findAll())
                .noneMatch(t -> t.getTokenHash().equals(refresh.getValue()));
    }

    // Refresh

    @Test
    void refreshIssuesNewCookiesThatWork() throws Exception {
        User user = verifiedUser();
        Cookie original = refreshCookie(login(user));

        MockHttpServletResponse response = refresh(original)
                .andExpect(status().isNoContent())
                .andReturn().getResponse();

        assertThat(refreshCookie(response).getValue()).isNotEqualTo(original.getValue());
        mvc.perform(get("/api/auth/me").cookie(response.getCookie(AuthCookies.ACCESS)))
                .andExpect(jsonPath("$.id").value(user.getId().toString()));
        refresh(refreshCookie(response)).andExpect(status().isNoContent());
    }

    @Test
    void refreshWithoutACookieIsUnauthorized() throws Exception {
        mvc.perform(browser(post("/api/auth/refresh"))).andExpect(status().isUnauthorized());
    }

    @Test
    void unknownRefreshTokenIsUnauthorizedAndClearsCookies() throws Exception {
        MockHttpServletResponse response = refresh(new Cookie(AuthCookies.REFRESH, "not-a-token"))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse();

        assertThat(response.getCookie(AuthCookies.ACCESS).getMaxAge()).isZero();
        assertThat(refreshCookie(response).getMaxAge()).isZero();
    }

    @Test
    void expiredRefreshTokenIsUnauthorized() throws Exception {
        Cookie cookie = refreshCookie(login(verifiedUser()));
        RefreshToken token = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getTokenHash().equals(TokenUtils.sha256Hex(cookie.getValue())))
                .findFirst().orElseThrow();
        token.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        refreshTokenRepository.save(token);

        refresh(cookie).andExpect(status().isUnauthorized());
    }

    @Test
    void concurrentRefreshInsideTheGracePeriodKeepsTheSessionAlive() throws Exception {
        User user = verifiedUser();
        Cookie shared = refreshCookie(login(user));
        Cookie winner = refreshCookie(refresh(shared).andReturn().getResponse());

        MockHttpServletResponse loser = refresh(shared).andExpect(status().isNoContent()).andReturn().getResponse();

        assertThat(loser.getCookie(AuthCookies.ACCESS)).isNotNull();
        assertThat(refreshCookie(loser)).as("must not overwrite the winner's cookie").isNull();
        refresh(winner).andExpect(status().isNoContent());
    }

    @Test
    void reusingAnOldTokenRevokesTheWholeSession() throws Exception {
        Cookie stolen = refreshCookie(login(verifiedUser()));
        Cookie current = refreshCookie(refresh(stolen).andReturn().getResponse());
        ageRotation(stolen);

        refresh(stolen).andExpect(status().isUnauthorized());

        refresh(current).andExpect(status().isUnauthorized());
    }

    @Test
    void reuseOnlyRevokesThatLoginAndNotOtherDevices() throws Exception {
        User user = verifiedUser();
        Cookie stolen = refreshCookie(login(user));
        Cookie otherDevice = refreshCookie(login(user));
        refresh(stolen);
        ageRotation(stolen);

        refresh(stolen).andExpect(status().isUnauthorized());

        refresh(otherDevice).andExpect(status().isNoContent());
    }

    // Logout

    @Test
    void logoutRevokesTheSessionAndClearsCookies() throws Exception {
        Cookie cookie = refreshCookie(login(verifiedUser()));

        MockHttpServletResponse response = mvc.perform(browser(post("/api/auth/logout")).cookie(cookie))
                .andExpect(status().isNoContent())
                .andReturn().getResponse();

        assertThat(response.getCookie(AuthCookies.ACCESS).getMaxAge()).isZero();
        assertThat(refreshCookie(response).getMaxAge()).isZero();
        refresh(cookie).andExpect(status().isUnauthorized());
    }

    @Test
    void logoutWithoutACookieStillSucceeds() throws Exception {
        mvc.perform(browser(post("/api/auth/logout"))).andExpect(status().isNoContent());
    }

    // Password changes end other sessions

    @Test
    void changingPasswordSignsOutOtherDevicesButKeepsThisOne() throws Exception {
        User user = verifiedUser();
        Cookie otherDevice = refreshCookie(login(user));

        MockHttpServletResponse response = mvc.perform(withJson(as(user, put("/api/auth/change-password")),
                Map.of("currentPassword", PASSWORD, "newPassword", "Nw8pLk3XyT")))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        refresh(otherDevice).andExpect(status().isUnauthorized());
        refresh(refreshCookie(response)).andExpect(status().isNoContent());
    }

    @Test
    void failedPasswordChangeLeavesSessionsAlone() throws Exception {
        User user = verifiedUser();
        Cookie session = refreshCookie(login(user));

        mvc.perform(withJson(as(user, put("/api/auth/change-password")),
                Map.of("currentPassword", "Wrong1Password", "newPassword", "Nw8pLk3XyT")))
                .andExpect(status().isBadRequest());

        refresh(session).andExpect(status().isNoContent());
    }

    @Test
    void resettingPasswordSignsOutEveryDevice() throws Exception {
        User user = verifiedUser();
        Cookie session = refreshCookie(login(user));
        String rawToken = TokenUtils.randomToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(TokenUtils.sha256Hex(rawToken));
        resetToken.setExpiresAt(OffsetDateTime.now().plusHours(1));
        resetTokens.save(resetToken);

        mvc.perform(withJson(post("/api/forgot-password/reset"), Map.of("token", rawToken, "newPassword", "Nw8pLk3XyT"))
                .with(freshIp()))
                .andExpect(status().isOk());

        refresh(session).andExpect(status().isUnauthorized());
    }

    // OAuth code exchange

    private ResultActions exchange(String code) throws Exception {
        return mvc.perform(withJson(post("/api/auth/oauth2/exchange"), Map.of("code", code)));
    }

    @Test
    void oauthCodeExchangesForASession() throws Exception {
        User user = verifiedUser();
        String code = refreshTokenService.issueOAuthCode(user.getId());

        MockHttpServletResponse response = exchange(code)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(user.getEmail()))
                .andReturn().getResponse();

        mvc.perform(get("/api/auth/me").cookie(response.getCookie(AuthCookies.ACCESS))).andExpect(status().isOk());
        refresh(refreshCookie(response)).andExpect(status().isNoContent());
    }

    @Test
    void oauthCodeIsStrictlySingleUse() throws Exception {
        String code = refreshTokenService.issueOAuthCode(verifiedUser().getId());
        exchange(code).andExpect(status().isOk());

        exchange(code).andExpect(status().isUnauthorized());
    }

    @Test
    void replayingAnOauthCodeRevokesTheSessionItStarted() throws Exception {
        String code = refreshTokenService.issueOAuthCode(verifiedUser().getId());
        Cookie session = refreshCookie(exchange(code).andReturn().getResponse());

        exchange(code).andExpect(status().isUnauthorized());

        refresh(session).andExpect(status().isUnauthorized());
    }

    @Test
    void oauthCodeLivesAboutAMinute() {
        UUID userId = verifiedUser().getId();
        String code = refreshTokenService.issueOAuthCode(userId);

        RefreshToken token = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getTokenHash().equals(TokenUtils.sha256Hex(code)))
                .findFirst().orElseThrow();
        assertThat(token.getExpiresAt()).isBefore(OffsetDateTime.now().plusSeconds(61));
    }

    @Test
    void invalidOrBlankOauthCodeIsUnauthorized() throws Exception {
        exchange("not-a-code").andExpect(status().isUnauthorized());
        exchange(" ").andExpect(status().isUnauthorized());
    }

    // Cleanup

    @Test
    void deleteExpiredRemovesOnlyExpiredTokens() throws Exception {
        Cookie live = refreshCookie(login(verifiedUser()));
        Cookie dead = refreshCookie(login(verifiedUser()));
        RefreshToken token = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getTokenHash().equals(TokenUtils.sha256Hex(dead.getValue())))
                .findFirst().orElseThrow();
        token.setExpiresAt(OffsetDateTime.now().minusDays(1));
        refreshTokenRepository.save(token);

        refreshTokenService.deleteExpired();

        assertThat(refreshTokenRepository.existsById(token.getId())).isFalse();
        refresh(live).andExpect(status().isNoContent());
    }
}
