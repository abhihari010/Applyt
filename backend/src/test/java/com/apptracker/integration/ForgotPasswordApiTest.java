package com.apptracker.integration;

import com.apptracker.model.PasswordResetToken;
import com.apptracker.model.User;
import com.apptracker.repository.PasswordResetTokenRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.ResultActions;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ForgotPasswordApiTest extends IntegrationTestBase {

    private static final String NEW_PASSWORD = "Nw8pLk3XyT";

    @Autowired PasswordResetTokenRepository tokens;

    private ResultActions requestReset(String email) throws Exception {
        return mvc.perform(withJson(post("/api/forgot-password/request"), Map.of("email", email)).with(freshIp()));
    }

    private ResultActions reset(String token, String password) throws Exception {
        return mvc.perform(withJson(post("/api/forgot-password/reset"),
                Map.of("token", token, "newPassword", password)).with(freshIp()));
    }

    private ResultActions validate(String token) throws Exception {
        return mvc.perform(withJson(post("/api/forgot-password/validate"), Map.of("token", token)).with(freshIp()));
    }

    private ResultActions login(User user, String password) throws Exception {
        return mvc.perform(withJson(post("/api/auth/login"), Map.of("email", user.getEmail(), "password", password))
                .with(freshIp()));
    }

    /** Requests a reset and pulls the raw token out of the emailed link, the only place it should exist. */
    private String emailedToken(User user) throws Exception {
        requestReset(user.getEmail()).andExpect(status().isOk());
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq(user.getEmail()), eq("Password Reset Request"), body.capture());
        Matcher matcher = Pattern.compile("reset-password#token=([\\w-]+)").matcher(body.getValue());
        assertThat(matcher.find()).as("emailed link contains a token").isTrue();
        return matcher.group(1);
    }

    private PasswordResetToken storedToken(User user) {
        return tokens.findAll().stream().filter(t -> t.getUserId().equals(user.getId())).findFirst().orElseThrow();
    }

    @Test
    void fullResetFlowReplacesThePassword() throws Exception {
        User user = verifiedUser();
        String token = emailedToken(user);

        validate(token).andExpect(status().isOk()).andExpect(jsonPath("$.valid").value(true));
        reset(token, NEW_PASSWORD).andExpect(status().isOk());

        login(user, PASSWORD).andExpect(status().isUnauthorized());
        login(user, NEW_PASSWORD).andExpect(status().isOk());
    }

    @Test
    void onlyAHashOfTheTokenIsStored() throws Exception {
        User user = verifiedUser();
        String token = emailedToken(user);

        assertThat(storedToken(user).getTokenHash()).isNotEqualTo(token).hasSize(64);
    }

    @Test
    void unknownEmailGetsTheSameAnswerAndNoEmail() throws Exception {
        requestReset(uniqueEmail())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists with this email, a password reset link has been sent"));
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void blankEmailIsRejected() throws Exception {
        requestReset(" ").andExpect(status().isBadRequest());
    }

    @Test
    void tokenCannotBeUsedTwice() throws Exception {
        User user = verifiedUser();
        String token = emailedToken(user);
        reset(token, NEW_PASSWORD).andExpect(status().isOk());

        reset(token, "An0therPassw").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Reset token has already been used"));

        validate(token).andExpect(status().isBadRequest()).andExpect(jsonPath("$.valid").value(false));
        login(user, NEW_PASSWORD).andExpect(status().isOk());
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        User user = verifiedUser();
        String token = emailedToken(user);
        PasswordResetToken stored = storedToken(user);
        stored.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        tokens.save(stored);

        reset(token, NEW_PASSWORD).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Reset token has expired"));
        validate(token).andExpect(status().isBadRequest());
        login(user, PASSWORD).andExpect(status().isOk());
    }

    @Test
    void tokenExpiresInAboutAnHour() throws Exception {
        User user = verifiedUser();
        emailedToken(user);
        assertThat(storedToken(user).getExpiresAt()).isBetween(
                OffsetDateTime.now().plusMinutes(59), OffsetDateTime.now().plusMinutes(61));
    }

    @Test
    void unknownTokenIsRejected() throws Exception {
        reset("not-a-real-token", NEW_PASSWORD).andExpect(status().isBadRequest());
        validate("not-a-real-token").andExpect(status().isBadRequest());
    }

    @Test
    void shortPasswordIsRejectedAndTheTokenStaysUsable() throws Exception {
        String token = emailedToken(verifiedUser());

        reset(token, "short").andExpect(status().isBadRequest());

        validate(token).andExpect(status().isOk());
    }

    @Test
    void reusingTheCurrentPasswordIsRejected() throws Exception {
        String token = emailedToken(verifiedUser());

        reset(token, PASSWORD).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("New password must be different from the old password"));
    }
}
