package com.apptracker.controller;

import com.apptracker.dto.*;
import com.apptracker.model.Attachment;
import com.apptracker.model.User;
import com.apptracker.repository.AttachmentRepository;
import com.apptracker.repository.UserRepository;
import com.apptracker.security.JwtUtil;
import com.apptracker.service.R2StorageService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepo;
    private final AttachmentRepository attachmentRepo;
    private final R2StorageService r2StorageService;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder pwEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepo, AttachmentRepository attachmentRepo, 
                         R2StorageService r2StorageService, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.attachmentRepo = attachmentRepo;
        this.r2StorageService = r2StorageService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already taken"));
        }
        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPasswordHash(pwEncoder.encode(req.getPassword()));
        User saved = userRepo.save(u);

        String token = jwtUtil.generateToken(saved.getId());
        UserDTO userDTO = new UserDTO(saved.getId(), saved.getName(), saved.getEmail(),
                saved.isEmailNotifications(), saved.isAutoArchiveOldApps(), saved.isShowArchivedApps());

        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest req) {
        var opt = userRepo.findByEmail(req.getEmail());
        if (opt.isEmpty())
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));

        User u = opt.get();
        if (!pwEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(u.getId());
        UserDTO userDTO = new UserDTO(u.getId(), u.getName(), u.getEmail(),
                u.isEmailNotifications(), u.isAutoArchiveOldApps(), u.isShowArchivedApps());

        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getEmail(),
                user.isEmailNotifications(), user.isAutoArchiveOldApps(), user.isShowArchivedApps());
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/change-profile")
    public ResponseEntity<?> updateCurrentUser(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody UpdateUserRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed to one that already exists
        if (!user.getEmail().equals(req.getEmail())) {
            var existingUser = userRepo.findByEmail(req.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already taken"));
            }
        }

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        User updatedUser = userRepo.save(user);

        UserDTO userDTO = new UserDTO(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(),
                updatedUser.isEmailNotifications(), updatedUser.isAutoArchiveOldApps(),
                updatedUser.isShowArchivedApps());
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody ChangePasswordRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!pwEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        // Validate new password length
        if (req.getNewPassword() == null || req.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters long"));
        }

        user.setPasswordHash(pwEncoder.encode(req.getNewPassword()));
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updatePreferences(@AuthenticationPrincipal UUID userId,
            @Validated @RequestBody UpdatePreferencesRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getEmailNotifications() != null) {
            user.setEmailNotifications(req.getEmailNotifications());
        }
        if (req.getAutoArchiveOldApps() != null) {
            user.setAutoArchiveOldApps(req.getAutoArchiveOldApps());
        }
        if (req.getShowArchivedApps() != null) {
            user.setShowArchivedApps(req.getShowArchivedApps());
        }

        User updatedUser = userRepo.save(user);
        UserDTO userDTO = new UserDTO(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(),
                updatedUser.isEmailNotifications(), updatedUser.isAutoArchiveOldApps(),
                updatedUser.isShowArchivedApps());

        return ResponseEntity.ok(userDTO);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UUID userId) {
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Get all attachments for this user's applications
        List<Attachment> attachments = attachmentRepo.findAllByUserId(userId);
        
        // Delete all files from R2
        for (Attachment attachment : attachments) {
            try {
                r2StorageService.deleteObject(attachment.getObjectKey());
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Failed to delete R2 object: " + attachment.getObjectKey() + " - " + e.getMessage());
            }
        }
        
        // Delete user (cascades will handle database cleanup)
        userRepo.deleteById(userId);
        
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
