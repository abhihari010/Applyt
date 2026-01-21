package com.apptracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.apptracker.dto.ForgotPasswordRequest;
import com.apptracker.dto.ResetPasswordRequest;
import com.apptracker.service.ForgotPasswordService;

import java.util.Map;

@RestController
@RequestMapping("/api/forgot-password")
@CrossOrigin(origins = "*")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "If an account exists with this email, a password reset link has been sent"));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        boolean isValid = forgotPasswordService.isValidToken(token);

        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Invalid or expired reset token"));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }
}
