package com.apptracker.service;

import com.apptracker.exception.BadRequestException;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.PasswordResetToken;
import com.apptracker.model.User;
import com.apptracker.repository.PasswordResetTokenRepository;
import com.apptracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;

@Service
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final long TOKEN_EXPIRY_HOURS = 1;

    @Value("${app.frontend-url}")
    private String frontendBaseUrl;

    public ForgotPasswordService(UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    public void requestPasswordReset(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }

        userRepository.findByEmail(email).ifPresent(user -> {
            String token = generateSecureToken();

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUserId(user.getId());
            resetToken.setTokenHash(hashToken(token));
            resetToken.setExpiresAt(OffsetDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
            tokenRepository.save(resetToken);

            sendPasswordResetEmail(user, token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            throw new BadRequestException("Token is required");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        // Find token
        String tokenHash = hashToken(token);
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token is expired
        if (resetToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        // Check if token is already used
        if (resetToken.isUsed()) {
            throw new BadRequestException("Reset token has already been used");
        }

        // Find user and update password
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the old password");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    public boolean isValidToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        return tokenRepository.findByTokenHash(hashToken(token))
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(OffsetDateTime.now()))
                .isPresent();
    }

    /**
     * Generate a secure random token for password reset
     */
    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) {
                    hex.append('0');
                }
                hex.append(h);
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /**
     * Send password reset email to user
     */
    private void sendPasswordResetEmail(User user, String token) {
        String resetLink = String.format("%s/reset-password#token=%s", frontendBaseUrl, token);
        String emailBody = buildPasswordResetEmail(user.getName(), resetLink);

        emailService.sendEmail(
                user.getEmail(),
                "Password Reset Request",
                emailBody);
    }

    /**
     * Build HTML email body for password reset
     */
    private String buildPasswordResetEmail(String userName, String resetLink) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                                .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
                                .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                                .warning { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 3px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Password Reset Request</h1>
                                </div>
                                <div class="content">
                                    <p>Hi %s,</p>
                                    <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                                    <p>Click the button below to reset your password:</p>
                                    <div style="text-align: center;">
                                        <a href="%s" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">Reset Password</a>                                            </div>
                                    </div>
                                    <p>Or copy and paste this link in your browser:</p>
                                    <p style="word-break: break-all; font-size: 12px; color: #666;">%s</p>
                                    <div class="warning">
                                        <strong>This link expires in 1 hour.</strong> After that, you'll need to request a new password reset.
                                    </div>
                                    <div class="footer">
                                        <p>If you have any questions, please contact our support team.</p>
                                        <p>&copy; 2024 AppTracker. All rights reserved.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                userName, resetLink, resetLink);
    }
}
