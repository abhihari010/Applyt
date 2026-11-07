package com.apptracker.service;

import com.apptracker.model.RefreshToken;
import com.apptracker.repository.RefreshTokenRepository;
import com.apptracker.util.TokenUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Rotating refresh tokens: each use replaces the token, and reusing a replaced token revokes the whole login.
 * Failures return an empty result instead of throwing, because an exception would roll back that revocation.
 */
@Service
public class RefreshTokenService {

    public static final Duration REFRESH_TTL = Duration.ofDays(30);
    static final Duration OAUTH_CODE_TTL = Duration.ofSeconds(60);
    // Two browser tabs can refresh at once with the same cookie. The loser shouldn't log the user out.
    static final Duration ROTATION_GRACE = Duration.ofSeconds(10);

    private final RefreshTokenRepository tokens;

    public RefreshTokenService(RefreshTokenRepository tokens) {
        this.tokens = tokens;
    }

    /** {@code newToken} is null when a concurrent refresh already rotated: keep the cookie the browser has. */
    public record Rotation(UUID userId, String newToken) {
    }

    @Transactional
    public String issue(UUID userId) {
        return create(userId, UUID.randomUUID(), REFRESH_TTL);
    }

    /** A short-lived token handed over in the OAuth redirect URL and exchanged once for a real session. */
    @Transactional
    public String issueOAuthCode(UUID userId) {
        return create(userId, UUID.randomUUID(), OAUTH_CODE_TTL);
    }

    @Transactional
    public Optional<Rotation> rotate(String rawToken) {
        return rotate(rawToken, ROTATION_GRACE);
    }

    /** OAuth codes get no grace period: they are strictly single-use. */
    @Transactional
    public Optional<Rotation> redeemOAuthCode(String code) {
        return rotate(code, Duration.ZERO);
    }

    private Optional<Rotation> rotate(String rawToken, Duration grace) {
        Optional<RefreshToken> found = tokens.findByTokenHash(TokenUtils.sha256Hex(rawToken));
        if (found.isEmpty()) {
            return Optional.empty();
        }
        RefreshToken token = found.get();
        OffsetDateTime now = OffsetDateTime.now();

        // Checked first: the grace period below must never revive a session that was deliberately ended.
        if (token.getRevokedAt() != null || token.getExpiresAt().isBefore(now)) {
            return Optional.empty();
        }
        if (token.getRotatedAt() != null) {
            if (token.getRotatedAt().plus(grace).isAfter(now)) {
                return Optional.of(new Rotation(token.getUserId(), null));
            }
            tokens.revokeFamily(token.getFamilyId(), now);
            return Optional.empty();
        }

        token.setRotatedAt(now);
        tokens.save(token);
        return Optional.of(new Rotation(token.getUserId(), create(token.getUserId(), token.getFamilyId(), REFRESH_TTL)));
    }

    @Transactional
    public void revoke(String rawToken) {
        tokens.findByTokenHash(TokenUtils.sha256Hex(rawToken))
                .ifPresent(token -> tokens.revokeFamily(token.getFamilyId(), OffsetDateTime.now()));
    }

    @Transactional
    public void revokeAll(UUID userId) {
        tokens.revokeAllForUser(userId, OffsetDateTime.now());
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void deleteExpired() {
        tokens.deleteExpired(OffsetDateTime.now());
    }

    private String create(UUID userId, UUID familyId, Duration ttl) {
        String raw = TokenUtils.randomToken();
        tokens.save(new RefreshToken(userId, familyId, TokenUtils.sha256Hex(raw), OffsetDateTime.now().plus(ttl)));
        return raw;
    }
}
