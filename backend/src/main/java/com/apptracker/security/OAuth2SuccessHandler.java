package com.apptracker.security;

import com.apptracker.model.User;
import com.apptracker.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Handles successful OAuth2 authentication
 * Generates JWT token and redirects to frontend with token
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        final String[] email = { oauth2User.getAttribute("email") };

        // Get provider info from the authentication request
        String provider = request.getParameter("provider");
        if (provider == null) {
            // Extract from request URI: /login/oauth2/code/google or
            // /login/oauth2/code/github
            String requestUri = request.getRequestURI();
            if (requestUri.contains("/google")) {
                provider = "google";
            } else if (requestUri.contains("/github")) {
                provider = "github";
            }
        }

        // Apply same fallback logic as OAuth2Service for GitHub private emails
        if ("github".equals(provider) && email[0] == null) {
            String login = oauth2User.getAttribute("login");
            email[0] = login + "@users.noreply.github.com";
        }

        // Find user in database by email
        User user = userRepository.findByEmail(email[0])
                .orElseThrow(() -> {
                    logger.error("User not found after OAuth2 login. Email: {}", email[0]);
                    return new RuntimeException("User not found after OAuth2 login. Email: " + email[0]);
                });

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());

        // Redirect to frontend with token
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", token)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
