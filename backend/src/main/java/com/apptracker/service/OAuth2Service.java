package com.apptracker.service;

import com.apptracker.model.User;
import com.apptracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service to handle OAuth2 user authentication and registration
 * Extends DefaultOAuth2UserService to customize user loading from Google/GitHub
 */
@Service
public class OAuth2Service extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Service.class);
    private final UserRepository userRepository;

    public OAuth2Service(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Called by Spring Security after successful OAuth2 authentication
     * This method loads or creates a user based on the OAuth2 provider's user info
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Get user info from OAuth2 provider (Google/GitHub)
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        logger.info("OAuth2 login attempt - Provider: {}", provider);

        // Extract the actual provider-specific user ID
        String providerId = extractProviderId(oauth2User, provider);

        // If GitHub, email might be private - use login@users.noreply.github.com format
        if ("github".equals(provider) && email == null) {
            String login = oauth2User.getAttribute("login");
            email = login + "@users.noreply.github.com";
        }

        // Use login as name fallback for GitHub
        if ("github".equals(provider) && name == null) {
            name = oauth2User.getAttribute("login");
        }

        // Find or create user (stored in database for later use)
        findOrCreateUser(email, name, provider, providerId);

        // Return OAuth2User (Spring Security will use this for authentication)
        return oauth2User;
    }

    /**
     * Extract the provider-specific unique user ID
     */
    private String extractProviderId(OAuth2User oauth2User, String provider) {
        switch (provider) {
            case "google":
                // Google uses "sub" (subject) as the unique identifier
                return oauth2User.getAttribute("sub");
            case "github":
                // GitHub uses "id" as the unique identifier
                Integer githubId = oauth2User.getAttribute("id");
                return githubId != null ? githubId.toString() : null;
            default:
                // Fallback to email if provider is unknown
                return oauth2User.getAttribute("email");
        }
    }

    /**
     * Find existing user by email or create new one
     */
    private User findOrCreateUser(String email, String name, String provider, String providerId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update OAuth info if user signed in with OAuth for first time
            if (user.getOauthProvider() == null) {
                user.setOauthProvider(provider);
                user.setOauthId(providerId);
                userRepository.save(user);
            }
            return user;
        }

        // Create new user (OAuth2 users don't have passwords)
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name != null ? name : email.split("@")[0]);
        newUser.setEmailVerified(true);
        newUser.setPasswordHash(null); // No password for OAuth2 users
        newUser.setOauthProvider(provider);
        newUser.setOauthId(providerId);

        return userRepository.save(newUser);
    }
}
