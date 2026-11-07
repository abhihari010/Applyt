package com.apptracker.controller;

import com.apptracker.dto.*;
import com.apptracker.security.AuthCookies;
import com.apptracker.service.AuthService;
import com.apptracker.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokens;
    private final AuthCookies cookies;

    public AuthController(AuthService authService, RefreshTokenService refreshTokens, AuthCookies cookies) {
        this.authService = authService;
        this.refreshTokens = refreshTokens;
        this.cookies = cookies;
    }

    private void startSession(UUID userId, HttpServletResponse response) {
        cookies.writeSession(response, userId, refreshTokens.issue(userId));
    }

    /** Writes cookies for a rotation. Returns false, after clearing cookies, when there was nothing valid to rotate. */
    private boolean applyRotation(Optional<RefreshTokenService.Rotation> rotation, HttpServletResponse response) {
        if (rotation.isEmpty()) {
            cookies.clear(response);
            return false;
        }
        String newToken = rotation.get().newToken();
        if (newToken == null) {
            cookies.writeAccess(response, rotation.get().userId());
        } else {
            cookies.writeSession(response, rotation.get().userId(), newToken);
        }
        return true;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest req) {
        try {
            RegisterResponse response = authService.register(req.getName(), req.getEmail(), req.getPassword());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            UserDTO user = authService.login(req.getEmail(), req.getPassword());
            startSession(user.getId(), response);
            return ResponseEntity.ok(Map.of("user", user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
        // UnverifiedEmailException is handled by GlobalExceptionHandler
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = AuthCookies.REFRESH, required = false) String refreshToken,
            HttpServletResponse response) {
        Optional<RefreshTokenService.Rotation> rotation = refreshToken == null
                ? Optional.empty()
                : refreshTokens.rotate(refreshToken);
        if (!applyRotation(rotation, response)) {
            return ResponseEntity.status(401).body(Map.of("error", "Session expired"));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/oauth2/exchange")
    public ResponseEntity<?> exchangeOAuthCode(@RequestBody Map<String, String> request,
            HttpServletResponse response) {
        String code = request.get("code");
        Optional<RefreshTokenService.Rotation> rotation = code == null || code.isBlank()
                ? Optional.empty()
                : refreshTokens.redeemOAuthCode(code);
        if (!applyRotation(rotation, response)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired sign-in code"));
        }
        return ResponseEntity.ok(Map.of("user", authService.getCurrentUser(rotation.get().userId())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = AuthCookies.REFRESH, required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken != null) {
            refreshTokens.revoke(refreshToken);
        }
        cookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UUID userId) {
        UserDTO user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/change-profile")
    public ResponseEntity<?> updateCurrentUser(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody UpdateUserRequest req) {
        try {
            UserDTO user = authService.updateProfile(userId, req.getName(), req.getEmail());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Signs out every other device, and keeps this one signed in with a fresh session. */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody ChangePasswordRequest req, HttpServletResponse response) {
        try {
            authService.changePassword(userId, req.getCurrentPassword(), req.getNewPassword());
            refreshTokens.revokeAll(userId);
            startSession(userId, response);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/set-password")
    public ResponseEntity<?> setPassword(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody SetPasswordRequest req, HttpServletResponse response) {
        try {
            authService.setPassword(userId, req.getNewPassword());
            refreshTokens.revokeAll(userId);
            startSession(userId, response);
            return ResponseEntity.ok(Map.of("message", "Password set successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updatePreferences(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody UpdatePreferencesRequest req) {
        UserDTO user = authService.updatePreferences(userId, req.getEmailNotifications(),
                req.getAutoArchiveOldApps(), req.getShowArchivedApps());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UUID userId, HttpServletResponse response) {
        try {
            authService.deleteAccount(userId);
            cookies.clear(response);
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam(required = true) String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<?> resendVerificationEmail(@Validated @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            authService.generateNewVerificationToken(email);
            return ResponseEntity.ok(Map.of("message", "Verification email sent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

}
