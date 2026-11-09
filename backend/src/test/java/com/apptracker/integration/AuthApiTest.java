package com.apptracker.integration;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Attachment;
import com.apptracker.model.EmailVerificationToken;
import com.apptracker.model.Note;
import com.apptracker.model.User;
import com.apptracker.repository.AttachmentRepository;
import com.apptracker.repository.NoteRepository;
import com.apptracker.repository.VerifyEmailTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

import java.time.OffsetDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthApiTest extends IntegrationTestBase {

    @Autowired VerifyEmailTokenRepository verificationTokens;
    @Autowired NoteRepository notes;
    @Autowired AttachmentRepository attachments;

    private ResultActions register(String name, String email, String password) throws Exception {
        return mvc.perform(withJson(post("/api/auth/register"),
                Map.of("name", name, "email", email, "password", password)).with(freshIp()));
    }

    private ResultActions verifyEmail(String token) throws Exception {
        return mvc.perform(post("/api/auth/verify-email").param("token", token));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mvc.perform(withJson(post("/api/auth/login"), Map.of("email", email, "password", password))
                .with(freshIp()));
    }

    // Registration

    @Test
    void registerStoresAHashedPasswordAndEmailsAVerificationLink() throws Exception {
        String email = uniqueEmail();

        register("New User", email, PASSWORD).andExpect(status().isOk());

        User saved = users.findByEmail(email).orElseThrow();
        assertThat(saved.isEmailVerified()).isFalse();
        assertThat(saved.getPasswordHash()).isNotEqualTo(PASSWORD);
        assertThat(new BCryptPasswordEncoder().matches(PASSWORD, saved.getPasswordHash())).isTrue();

        String token = verificationTokens.findByUserId(saved.getId()).getToken();
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq(email), eq("Verify Your Email"), body.capture());
        assertThat(body.getValue()).contains("verify-email?token=" + token);
    }

    @Test
    void registerRejectsADuplicateEmail() throws Exception {
        User existing = verifiedUser();
        register("New User", existing.getEmail(), PASSWORD)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already taken"));
    }

    @ParameterizedTest
    @CsvSource({
            "x, ok@example.com, Zx9vQm2LtR", // name too short
            "<b>Bad</b>, ok@example.com, Zx9vQm2LtR", // html in name
            "admin, ok@example.com, Zx9vQm2LtR", // reserved name
            "Valid Name, not-an-email, Zx9vQm2LtR", // bad email
            "Valid Name, ok@example.com, short1A", // short password
            "Valid Name, ok@example.com, nouppercase1", // weak password
            "Valid Name, ok@example.com, Password123" // common password
    })
    void registerRejectsInvalidInput(String name, String email, String password) throws Exception {
        register(name, email, password).andExpect(status().isBadRequest());
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    // Login

    @Test
    void loginReturnsTheUserAndNeverThePasswordHash() throws Exception {
        User user = verifiedUser();

        login(user.getEmail(), PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(user.getEmail()))
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString(user.getPasswordHash()))));
    }

    @Test
    void tokenFromLoginWorksAsABearerToken() throws Exception {
        User user = verifiedUser();
        String body = login(user.getEmail(), PASSWORD).andReturn().getResponse().getContentAsString();
        String token = json.readTree(body).get("token").asText();

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.getEmail()));
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameAnswer() throws Exception {
        login(verifiedUser().getEmail(), "Wrong1Password")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
        login(uniqueEmail(), PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void oauthUserWithoutAPasswordCannotLogInWithOne() throws Exception {
        User user = verifiedUser();
        user.setPasswordHash(null);
        users.save(user);

        login(user.getEmail(), PASSWORD).andExpect(status().isUnauthorized());
    }

    @Test
    void unverifiedUserIsRefusedAndSentANewLink() throws Exception {
        String email = uniqueEmail();
        register("New User", email, PASSWORD).andExpect(status().isOk());

        login(email, PASSWORD)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.email").value(email));

        // Once on registering and once on the login attempt.
        verify(emailService, org.mockito.Mockito.times(2)).sendEmail(eq(email), anyString(), anyString());
    }

    // Email verification

    @Test
    void verifyingEmailAllowsLogin() throws Exception {
        String email = uniqueEmail();
        register("New User", email, PASSWORD).andExpect(status().isOk());
        String token = verificationTokens.findByUserId(users.findByEmail(email).orElseThrow().getId()).getToken();

        verifyEmail(token).andExpect(status().isOk());

        login(email, PASSWORD).andExpect(status().isOk());
    }

    @Test
    void unknownVerificationTokenIsRejected() throws Exception {
        verifyEmail("nope")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid verification token"));
    }

    private EmailVerificationToken expireVerificationToken(String email) {
        User user = users.findByEmail(email).orElseThrow();
        EmailVerificationToken token = verificationTokens.findByUserId(user.getId());
        token.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        return verificationTokens.save(token);
    }

    @Test
    void expiredVerificationTokenIsRejected() throws Exception {
        String email = uniqueEmail();
        register("New User", email, PASSWORD).andExpect(status().isOk());
        EmailVerificationToken token = expireVerificationToken(email);

        verifyEmail(token.getToken())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Verification token has expired"));

        assertThat(users.findByEmail(email).orElseThrow().isEmailVerified()).isFalse();
    }

    @Test
    void resendReusesAStillValidTokenAndReplacesAnExpiredOne() throws Exception {
        String email = uniqueEmail();
        register("New User", email, PASSWORD).andExpect(status().isOk());
        User user = users.findByEmail(email).orElseThrow();
        EmailVerificationToken original = verificationTokens.findByUserId(user.getId());

        mvc.perform(withJson(post("/api/auth/resend-verification-email"), Map.of("email", email)).with(freshIp()))
                .andExpect(status().isOk());
        assertThat(verificationTokens.findByUserId(user.getId()).getToken()).isEqualTo(original.getToken());

        original.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        verificationTokens.save(original);
        mvc.perform(withJson(post("/api/auth/resend-verification-email"), Map.of("email", email)).with(freshIp()))
                .andExpect(status().isOk());
        assertThat(verificationTokens.findByUserId(user.getId()).getToken()).isNotEqualTo(original.getToken());
    }

    @Test
    void resendIsRefusedForAlreadyVerifiedOrBlankEmail() throws Exception {
        mvc.perform(withJson(post("/api/auth/resend-verification-email"), Map.of("email", verifiedUser().getEmail()))
                .with(freshIp())).andExpect(status().isBadRequest());
        mvc.perform(withJson(post("/api/auth/resend-verification-email"), Map.of("email", " "))
                .with(freshIp())).andExpect(status().isBadRequest());
    }

    // Passwords

    private ResultActions changePassword(User user, String current, String next) throws Exception {
        return mvc.perform(withJson(as(user, put("/api/auth/change-password")),
                Map.of("currentPassword", current, "newPassword", next)));
    }

    @Test
    void changePasswordReplacesTheOldOne() throws Exception {
        User user = verifiedUser();

        changePassword(user, PASSWORD, "Nw8pLk3XyT").andExpect(status().isOk());

        login(user.getEmail(), PASSWORD).andExpect(status().isUnauthorized());
        login(user.getEmail(), "Nw8pLk3XyT").andExpect(status().isOk());
    }

    @ParameterizedTest
    @CsvSource({
            "Wrong1Password, Nw8pLk3XyT, Current password is incorrect",
            "Zx9vQm2LtR, short, Password must be at least 8 characters long",
            "Zx9vQm2LtR, Zx9vQm2LtR, New password must be different from current password"
    })
    void changePasswordRejectsBadInput(String current, String next, String error) throws Exception {
        User user = verifiedUser();
        changePassword(user, current, next)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(error));
        login(user.getEmail(), PASSWORD).andExpect(status().isOk());
    }

    @Test
    void setPasswordLetsAnOAuthUserAddOne() throws Exception {
        User user = verifiedUser();
        user.setPasswordHash(null);
        users.save(user);

        mvc.perform(withJson(as(user, put("/api/auth/set-password")), Map.of("newPassword", "Nw8pLk3XyT")))
                .andExpect(status().isOk());

        login(user.getEmail(), "Nw8pLk3XyT").andExpect(status().isOk());
    }

    // Profile and preferences

    @Test
    void updateProfileChangesNameAndEmail() throws Exception {
        User user = verifiedUser();
        String email = uniqueEmail();

        mvc.perform(withJson(as(user, put("/api/auth/change-profile")), Map.of("name", "Renamed", "email", email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed"))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void updateProfileRejectsAnEmailOwnedBySomeoneElse() throws Exception {
        User user = verifiedUser();
        mvc.perform(withJson(as(user, put("/api/auth/change-profile")),
                Map.of("name", "Renamed", "email", verifiedUser().getEmail())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already taken"));
    }

    @Test
    void updatePreferencesOnlyChangesTheFieldsSent() throws Exception {
        User user = verifiedUser();

        mvc.perform(withJson(as(user, put("/api/auth/preferences")), Map.of("autoArchiveOldApps", true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autoArchiveOldApps").value(true))
                .andExpect(jsonPath("$.emailNotifications").value(true))
                .andExpect(jsonPath("$.showArchivedApps").value(false));
    }

    // Account deletion

    private Attachment attachmentOn(ApplicationEntity app, String key) {
        Attachment attachment = new Attachment();
        attachment.setApplicationId(app.getId());
        attachment.setObjectKey(key);
        attachment.setFileName("cv.pdf");
        attachment.setContentType("application/pdf");
        attachment.setSizeBytes(1L);
        return attachments.save(attachment);
    }

    @Test
    void deleteAccountRemovesFilesAndCascadesThroughTheDatabase() throws Exception {
        User user = verifiedUser();
        ApplicationEntity app = applicationOwnedBy(user);
        Note note = new Note();
        note.setApplicationId(app.getId());
        note.setContent("hello");
        notes.save(note);
        Attachment attachment = attachmentOn(app, "users/" + user.getId() + "/cv.pdf");

        User other = verifiedUser();
        ApplicationEntity otherApp = applicationOwnedBy(other);

        mvc.perform(as(user, delete("/api/auth/account"))).andExpect(status().isOk());

        assertThat(users.existsById(user.getId())).isFalse();
        assertThat(applications.existsById(app.getId())).isFalse();
        assertThat(notes.existsById(note.getId())).isFalse();
        assertThat(attachments.existsById(attachment.getId())).isFalse();
        verify(r2).deleteObject(attachment.getObjectKey());

        assertThat(users.existsById(other.getId())).isTrue();
        assertThat(applications.existsById(otherApp.getId())).isTrue();
    }

    @Test
    void deleteAccountStillSucceedsWhenFileStorageFails() throws Exception {
        User user = verifiedUser();
        attachmentOn(applicationOwnedBy(user), "key");
        doThrow(new RuntimeException("r2 down")).when(r2).deleteObject("key");

        mvc.perform(as(user, delete("/api/auth/account"))).andExpect(status().isOk());

        assertThat(users.existsById(user.getId())).isFalse();
    }

    @Test
    void tokenOfADeletedAccountNoLongerReturnsData() throws Exception {
        User user = verifiedUser();
        mvc.perform(as(user, delete("/api/auth/account")))
                .andExpect(status().isOk());

        mvc.perform(as(user, get("/api/auth/me")))
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString(user.getEmail()))));
    }
}
