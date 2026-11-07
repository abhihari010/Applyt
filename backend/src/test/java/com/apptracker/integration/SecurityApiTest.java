package com.apptracker.integration;

import com.apptracker.model.User;
import com.apptracker.security.AuthCookies;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityApiTest extends IntegrationTestBase {

    @ParameterizedTest
    @CsvSource({
            "GET, /api/auth/me",
            "PUT, /api/auth/change-profile",
            "PUT, /api/auth/change-password",
            "PUT, /api/auth/set-password",
            "PUT, /api/auth/preferences",
            "DELETE, /api/auth/account",
            "GET, /api/apps",
            "POST, /api/apps",
            "POST, /api/apps/import",
            "GET, /api/analytics",
            "GET, /api/reminders/due",
            "GET, /api/reminders/all",
            "POST, /api/applications/import/csv",
            "GET, /api/jobs/refresh-cache"
    })
    void protectedEndpointsAnswer401ToAnonymousRequests(String method, String path) throws Exception {
        mvc.perform(browser(MockMvcRequestBuilders.request(HttpMethod.valueOf(method), path)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void perResourceEndpointsAnswer401ToAnonymousRequests() throws Exception {
        UUID id = UUID.randomUUID();
        for (String path : new String[] {
                "/api/apps/" + id, "/api/apps/" + id + "/notes", "/api/apps/" + id + "/contacts",
                "/api/apps/" + id + "/reminders", "/api/apps/" + id + "/attachments", "/api/apps/" + id + "/activity",
                "/api/attachments/" + id + "/download-url"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        }
    }

    @Test
    void validCookieIsAccepted() throws Exception {
        mvc.perform(as(verifiedUser(), get("/api/apps"))).andExpect(status().isOk());
    }

    private String signed(String subject, Instant expiry, String secret) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(Date.from(expiry))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Test
    void badTokensAreTreatedAsAnonymous() throws Exception {
        String subject = verifiedUser().getId().toString();
        Instant future = Instant.now().plusSeconds(600);
        String[] tokens = {
                "garbage",
                signed(subject, Instant.now().minusSeconds(60), JWT_SECRET), // expired
                signed(subject, future, JWT_SECRET + "-a-different-key"), // wrong key
                signed("not-a-uuid", future, JWT_SECRET), // malformed subject
                Jwts.builder().setSubject(subject).compact() // unsigned
        };
        for (String token : tokens) {
            mvc.perform(get("/api/apps").cookie(new Cookie(AuthCookies.ACCESS, token)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void tokensInTheAuthorizationHeaderAreNoLongerAccepted() throws Exception {
        User user = verifiedUser();
        mvc.perform(get("/api/apps").header("Authorization", "Bearer " + jwtUtil.generateToken(user.getId())))
                .andExpect(status().isUnauthorized());
    }

    // CSRF

    @Test
    void stateChangingRequestsWithoutTheCsrfHeaderAreRefused() throws Exception {
        User user = verifiedUser();
        var app = applicationOwnedBy(user);

        mvc.perform(delete("/api/apps/" + app.getId()).cookie(accessCookie(user)))
                .andExpect(status().isForbidden());

        org.assertj.core.api.Assertions.assertThat(applications.existsById(app.getId())).isTrue();
    }

    @Test
    void loginWithoutTheCsrfHeaderIsRefused() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"email\":\"a@example.com\",\"password\":\"x\"}").with(freshIp()))
                .andExpect(status().isForbidden());
    }

    @Test
    void readsDontNeedTheCsrfHeader() throws Exception {
        mvc.perform(get("/api/apps").cookie(accessCookie(verifiedUser()))).andExpect(status().isOk());
    }

    // Public endpoints

    @ParameterizedTest
    @ValueSource(strings = {"/actuator/health", "/api/jobs/open-internships"})
    void publicEndpointsNeedNoToken(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @Test
    void anonymousCallersCannotTriggerTheJobCacheRefresh() throws Exception {
        mvc.perform(get("/api/jobs/refresh-cache")).andExpect(status().isUnauthorized());
        verify(scheduledTasks, never()).refreshOpenJobsCache();
    }

    @Test
    void sensitiveActuatorEndpointsAreNotPublic() throws Exception {
        mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/beans")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginIsRateLimitedPerIp() throws Exception {
        Map<String, String> body = Map.of("email", uniqueEmail(), "password", "Wrong1Password");
        var ip = freshIp();
        for (int i = 0; i < 5; i++) {
            mvc.perform(withJson(post("/api/auth/login"), body).with(ip)).andExpect(status().isUnauthorized());
        }
        mvc.perform(withJson(post("/api/auth/login"), body).with(ip)).andExpect(status().isTooManyRequests());
        mvc.perform(withJson(post("/api/auth/login"), body).with(freshIp())).andExpect(status().isUnauthorized());
    }

    // CORS

    @Test
    void corsAllowsTheFrontendOriginsWithCredentials() throws Exception {
        for (String origin : new String[] {"http://localhost:3000", "http://frontend.test"}) {
            mvc.perform(options("/api/auth/login")
                    .header("Origin", origin)
                    .header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "x-requested-with,content-type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin))
                    .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }
    }

    @Test
    void corsRefusesOtherOriginsEverywhere() throws Exception {
        for (String path : new String[] {"/api/auth/login", "/api/apps", "/api/forgot-password/reset", "/api/analytics"}) {
            mvc.perform(options(path)
                    .header("Origin", "https://evil.example")
                    .header("Access-Control-Request-Method", "POST"))
                    .andExpect(status().isForbidden());
        }
    }
}
