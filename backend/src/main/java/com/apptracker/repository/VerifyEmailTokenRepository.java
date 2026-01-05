package com.apptracker.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apptracker.model.EmailVerificationToken;

public interface VerifyEmailTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    EmailVerificationToken findByToken(String token);
    EmailVerificationToken findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
