package com.apptracker.service;

import com.apptracker.dto.AuthResponse;
import com.apptracker.dto.RegisterResponse;
import com.apptracker.dto.UserDTO;
import com.apptracker.exception.UnverifiedEmailException;
import com.apptracker.model.Attachment;
import com.apptracker.model.EmailVerificationToken;
import com.apptracker.model.User;
import com.apptracker.repository.AttachmentRepository;
import com.apptracker.repository.UserRepository;
import com.apptracker.repository.VerifyEmailTokenRepository;
import com.apptracker.security.JwtUtil;
import com.apptracker.util.AppLogger;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepo;
    private final AttachmentRepository attachmentRepo;
    private final EmailService emailService;
    private final R2StorageService r2StorageService;
    private final JwtUtil jwtUtil;
    private final VerifyEmailTokenRepository emailVerificationTokenRepository;
    private final BCryptPasswordEncoder pwEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepo, AttachmentRepository attachmentRepo,
            EmailService emailService, R2StorageService r2StorageService,
            JwtUtil jwtUtil, VerifyEmailTokenRepository emailVerificationTokenRepository) {
        this.userRepo = userRepo;
        this.attachmentRepo = attachmentRepo;
        this.emailService = emailService;
        this.r2StorageService = r2StorageService;
        this.jwtUtil = jwtUtil;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
    }

    /**
     * Register a new user and send verification email
     */
    public RegisterResponse register(String name, String email, String password) {
        if (userRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already taken");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(pwEncoder.encode(password));
        user.setEmailVerified(false);
        User saved = userRepo.save(user);

        // Create and save verification token (15 minute expiration)
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setId(UUID.randomUUID());
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setUserId(saved.getId());
        verificationToken.setCreatedAt(OffsetDateTime.now());
        verificationToken.setExpiresAt(OffsetDateTime.now().plus(15, java.time.temporal.ChronoUnit.MINUTES));
        emailVerificationTokenRepository.save(verificationToken);

        // Send verification email
        sendVerificationEmail(saved.getEmail(), verificationToken.getToken());

        return new RegisterResponse("Registration successful. Please check your email to verify your account.");

    }

    /**
     * Authenticate user by email and password
     */
    public AuthResponse login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!pwEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.isEmailVerified()) {
            // Auto-resend verification token when user tries to login
            try {
                generateNewVerificationToken(email);
            } catch (Exception e) {
                // Log error but don't fail - let the exception be thrown
                AppLogger.error("Failed to auto-resend verification email", e);
            }
            throw new UnverifiedEmailException(
                    "Email not verified. A new verification link has been sent to your email.",
                    email);
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, buildUserDTO(user));
    }

    /**
     * Get current user details
     */
    public UserDTO getCurrentUser(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildUserDTO(user);
    }

    /**
     * Update user profile (name and email)
     */
    public UserDTO updateProfile(UUID userId, String name, String email) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed to one that already exists
        if (!user.getEmail().equals(email)) {
            if (userRepo.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("Email already taken");
            }
        }

        user.setName(name);
        user.setEmail(email);
        user.setUpdatedAt(OffsetDateTime.now());
        User updated = userRepo.save(user);

        return buildUserDTO(updated);
    }

    /**
     * Change password for authenticated user
     */
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!pwEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        user.setPasswordHash(pwEncoder.encode(newPassword));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepo.save(user);
    }

    /**
     * Set password for OAuth users
     */
    public void setPassword(UUID userId, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        user.setPasswordHash(pwEncoder.encode(newPassword));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepo.save(user);
    }

    /**
     * Update user preferences
     */
    public UserDTO updatePreferences(UUID userId, Boolean emailNotifications,
            Boolean autoArchiveOldApps, Boolean showArchivedApps) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (emailNotifications != null) {
            user.setEmailNotifications(emailNotifications);
        }
        if (autoArchiveOldApps != null) {
            user.setAutoArchiveOldApps(autoArchiveOldApps);
        }
        if (showArchivedApps != null) {
            user.setShowArchivedApps(showArchivedApps);
        }

        user.setUpdatedAt(OffsetDateTime.now());
        User updated = userRepo.save(user);
        return buildUserDTO(updated);
    }

    /**
     * Delete user account and all associated files
     */
    public void deleteAccount(UUID userId) {
        if (!userRepo.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        // Get all attachments for this user's applications
        List<Attachment> attachments = attachmentRepo.findAllByUserId(userId);

        // Delete all files from R2
        for (Attachment attachment : attachments) {
            try {
                r2StorageService.deleteObject(attachment.getObjectKey());
            } catch (Exception e) {
                AppLogger.error("Failed to delete R2 object: " + attachment.getObjectKey(), e);
                // Continue with deletion even if R2 deletion fails
            }
        }

        // Delete user (cascades will handle database cleanup)
        userRepo.deleteById(userId);
    }

    /**
     * Verify email using token
     */
    public void verifyEmail(String token) {
        AppLogger.info("verifyEmail called with token: " + token);
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token);
        if (verificationToken == null) {
            AppLogger.error("Token not found in database: " + token);
            throw new IllegalArgumentException("Invalid verification token");
        }

        AppLogger.info("Token found. User ID: " + verificationToken.getUserId() + ", Expires at: "
                + verificationToken.getExpiresAt());

        // Check if token has expired
        if (OffsetDateTime.now().isAfter(verificationToken.getExpiresAt())) {
            AppLogger.error("Token has expired: " + token);
            emailVerificationTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = userRepo.findById(verificationToken.getUserId())
                .orElseThrow(() -> {
                    AppLogger.error("User not found for ID: " + verificationToken.getUserId());
                    return new RuntimeException("User not found");
                });

        AppLogger.info("User found: " + user.getEmail() + ", currently verified: " + user.isEmailVerified());

        user.setEmailVerified(true);
        user.setUpdatedAt(OffsetDateTime.now());
        userRepo.save(user);
        AppLogger.info("User email verified and updated: " + user.getEmail() + " " + user.isEmailVerified());

        // Mark token as verified for audit trail
        verificationToken.setVerifiedAt(OffsetDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);
        AppLogger.info("Verification token marked as verified");

    }

    /**
     * Generate a new verification token for a user (for resending email)
     * If user has a valid (non-expired) token, resend that one
     * If token is expired, create a new one
     */
    public void generateNewVerificationToken(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        // Check if user has an existing, non-expired token
        EmailVerificationToken existingToken = emailVerificationTokenRepository.findByUserId(user.getId());

        if (existingToken != null && OffsetDateTime.now().isBefore(existingToken.getExpiresAt())) {
            // Token is still valid, just resend the email with the existing token
            sendVerificationEmail(user.getEmail(), existingToken.getToken());
            return;
        }

        // Token is expired or doesn't exist, create a new one
        if (existingToken != null) {
            emailVerificationTokenRepository.delete(existingToken);
        }

        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setId(UUID.randomUUID());
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setUserId(user.getId());
        verificationToken.setCreatedAt(OffsetDateTime.now());
        verificationToken.setExpiresAt(OffsetDateTime.now().plus(15, java.time.temporal.ChronoUnit.MINUTES));
        emailVerificationTokenRepository.save(verificationToken);

        // Send verification email
        sendVerificationEmail(user.getEmail(), verificationToken.getToken());
    }

    /**
     * Helper method to send verification email
     */
    private void sendVerificationEmail(String email, String token) {
        String verificationUrl = System.getenv("FRONTEND_URL") != null
                ? System.getenv("FRONTEND_URL") + "/verify-email?token=" + token
                : "http://localhost:3000/verify-email?token=" + token;

        emailService.sendEmail(
                email,
                "Verify Your Email",
                "<a href='" + verificationUrl + "'>Click here to verify your email</a>");
    }

    /**
     * Helper method to build UserDTO from User entity
     */
    private UserDTO buildUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEmailNotifications(),
                user.isAutoArchiveOldApps(),
                user.isShowArchivedApps(),
                user.getPasswordHash() != null,
                user.getOauthProvider());
    }
}
