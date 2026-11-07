package com.apptracker.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private static final String SECRET = "unit-test-secret-unit-test-secret-unit-test-secret-0123456789";

    private static JwtUtil jwtUtil(String secret) {
        JwtUtil util = new JwtUtil();
        ReflectionTestUtils.setField(util, "secret", secret);
        util.init();
        return util;
    }

    @Test
    void generatedTokenRoundTripsToTheSameUserId() {
        UUID userId = UUID.randomUUID();
        JwtUtil util = jwtUtil(SECRET);
        assertThat(util.validateAndGetUserId(util.generateToken(userId))).isEqualTo(userId);
    }

    @Test
    void accessTokenIsShortLived() {
        String token = jwtUtil(SECRET).generateToken(UUID.randomUUID());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET.getBytes(StandardCharsets.UTF_8))
                .build()
                .parseClaimsJws(token)
                .getBody();
        assertThat(Duration.between(claims.getIssuedAt().toInstant(), claims.getExpiration().toInstant()))
                .isEqualTo(Duration.ofMinutes(15));
    }

    @Test
    void rejectsTokenSignedWithADifferentSecret() {
        String foreign = jwtUtil(SECRET + "-other").generateToken(UUID.randomUUID());
        assertThatThrownBy(() -> jwtUtil(SECRET).validateAndGetUserId(foreign)).isInstanceOf(JwtException.class);
    }

    @Test
    void rejectsTamperedPayload() {
        JwtUtil util = jwtUtil(SECRET);
        String[] victim = util.generateToken(UUID.randomUUID()).split("\\.");
        String[] attacker = util.generateToken(UUID.randomUUID()).split("\\.");
        String forged = victim[0] + "." + attacker[1] + "." + victim[2];
        assertThatThrownBy(() -> util.validateAndGetUserId(forged)).isInstanceOf(JwtException.class);
    }

    @Test
    void rejectsExpiredToken() {
        String expired = Jwts.builder()
                .setSubject(UUID.randomUUID().toString())
                .setExpiration(Date.from(Instant.now().minusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        assertThatThrownBy(() -> jwtUtil(SECRET).validateAndGetUserId(expired)).isInstanceOf(JwtException.class);
    }

    @Test
    void rejectsUnsignedToken() {
        String unsigned = Jwts.builder().setSubject(UUID.randomUUID().toString()).compact();
        assertThatThrownBy(() -> jwtUtil(SECRET).validateAndGetUserId(unsigned)).isInstanceOf(JwtException.class);
    }

    @Test
    void refusesToStartWithTheDefaultPlaceholderSecret() {
        assertThatThrownBy(() -> jwtUtil("change-me-in-env")).isInstanceOf(WeakKeyException.class);
    }
}
