package com.apptracker.security;

import com.apptracker.model.User;
import com.apptracker.repository.UserRepository;
import com.apptracker.service.OAuth2Service;
import com.apptracker.service.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** loadUser itself calls the provider over HTTP, so this covers the account logic and the redirect after it. */
class OAuth2LoginTest {

    private final UserRepository users = mock(UserRepository.class);
    private final RefreshTokenService refreshTokens = mock(RefreshTokenService.class);

    private void findOrCreate(String email, String name, String provider, String providerId) {
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
        ReflectionTestUtils.invokeMethod(new OAuth2Service(users), "findOrCreateUser", email, name, provider, providerId);
    }

    @Test
    void firstLoginCreatesVerifiedUserWithoutPassword() {
        when(users.findByEmail("new@example.com")).thenReturn(Optional.empty());

        findOrCreate("new@example.com", "New User", "google", "sub-1");

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().isEmailVerified()).isTrue();
        assertThat(saved.getValue().getPasswordHash()).isNull();
        assertThat(saved.getValue().getOauthProvider()).isEqualTo("google");
        assertThat(saved.getValue().getOauthId()).isEqualTo("sub-1");
    }

    @Test
    void missingNameFallsBackToTheEmailPrefix() {
        when(users.findByEmail("new@example.com")).thenReturn(Optional.empty());

        findOrCreate("new@example.com", null, "github", "42");

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getName()).isEqualTo("new");
    }

    @Test
    void existingPasswordUserIsLinkedOnFirstOAuthLogin() {
        User existing = new User();
        existing.setPasswordHash("hash");
        when(users.findByEmail("a@example.com")).thenReturn(Optional.of(existing));

        findOrCreate("a@example.com", "A", "github", "42");

        assertThat(existing.getOauthProvider()).isEqualTo("github");
        assertThat(existing.getOauthId()).isEqualTo("42");
        assertThat(existing.getPasswordHash()).isEqualTo("hash");
    }

    @Test
    void existingLinkIsNotOverwrittenByAnotherProvider() {
        User existing = new User();
        existing.setOauthProvider("google");
        existing.setOauthId("sub-1");
        when(users.findByEmail("a@example.com")).thenReturn(Optional.of(existing));

        findOrCreate("a@example.com", "A", "github", "42");

        assertThat(existing.getOauthProvider()).isEqualTo("google");
        verify(users, never()).save(any());
    }

    private OAuth2SuccessHandler handler() {
        when(refreshTokens.issueOAuthCode(any())).thenReturn("one-time-code");
        OAuth2SuccessHandler handler = new OAuth2SuccessHandler(users, refreshTokens);
        ReflectionTestUtils.setField(handler, "frontendUrl", "http://frontend.test");
        return handler;
    }

    private static TestingAuthenticationToken authenticated(OAuth2User principal) {
        return new TestingAuthenticationToken(principal, null);
    }

    @Test
    void successRedirectsWithAOneTimeCodeInsteadOfAToken() throws Exception {
        User user = new User();
        when(users.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        OAuth2User principal = mock(OAuth2User.class);
        when(principal.getAttribute("email")).thenReturn("a@example.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        OAuth2SuccessHandler handler = handler();

        handler.onAuthenticationSuccess(
                new MockHttpServletRequest("GET", "/login/oauth2/code/google"), response, authenticated(principal));

        assertThat(response.getRedirectedUrl()).isEqualTo("http://frontend.test/oauth2/redirect?code=one-time-code");
        verify(refreshTokens).issueOAuthCode(user.getId());
    }

    @Test
    void githubPrivateEmailUsesTheSameNoreplyAddressAsSignup() throws Exception {
        when(users.findByEmail("octocat@users.noreply.github.com")).thenReturn(Optional.of(new User()));
        OAuth2User principal = mock(OAuth2User.class);
        when(principal.getAttribute("login")).thenReturn("octocat");
        MockHttpServletResponse response = new MockHttpServletResponse();
        OAuth2SuccessHandler handler = handler();

        handler.onAuthenticationSuccess(
                new MockHttpServletRequest("GET", "/login/oauth2/code/github"), response, authenticated(principal));

        assertThat(response.getRedirectedUrl()).contains("code=");
    }

    @Test
    void failsWithoutRedirectingWhenTheUserRecordIsMissing() {
        when(users.findByEmail("ghost@example.com")).thenReturn(Optional.empty());
        OAuth2User principal = mock(OAuth2User.class);
        when(principal.getAttribute("email")).thenReturn("ghost@example.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2SuccessHandler handler = handler();

        assertThatThrownBy(() -> handler.onAuthenticationSuccess(
                new MockHttpServletRequest("GET", "/login/oauth2/code/google"), response, authenticated(principal)))
                .isInstanceOf(RuntimeException.class);
        assertThat(response.getRedirectedUrl()).isNull();
    }
}
