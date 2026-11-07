package com.apptracker.security;

import com.apptracker.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

/** Session cookies are httpOnly, so page scripts, and any XSS in them, can't read the tokens. */
@Component
public class AuthCookies {

    public static final String ACCESS = "access_token";
    public static final String REFRESH = "refresh_token";
    // The refresh token is only ever sent to the endpoints that use it.
    private static final String REFRESH_PATH = "/api/auth";

    private final JwtUtil jwtUtil;
    private final boolean secure;
    private final String sameSite;

    public AuthCookies(JwtUtil jwtUtil,
            @Value("${app.auth.cookie-secure:true}") boolean secure,
            @Value("${app.auth.cookie-same-site:Lax}") String sameSite) {
        this.jwtUtil = jwtUtil;
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void writeSession(HttpServletResponse response, UUID userId, String refreshToken) {
        writeAccess(response, userId);
        add(response, REFRESH, refreshToken, REFRESH_PATH, RefreshTokenService.REFRESH_TTL);
    }

    public void writeAccess(HttpServletResponse response, UUID userId) {
        add(response, ACCESS, jwtUtil.generateToken(userId), "/", JwtUtil.ACCESS_TTL);
    }

    public void clear(HttpServletResponse response) {
        add(response, ACCESS, "", "/", Duration.ZERO);
        add(response, REFRESH, "", REFRESH_PATH, Duration.ZERO);
    }

    private void add(HttpServletResponse response, String name, String value, String path, Duration maxAge) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path)
                .maxAge(maxAge)
                .build()
                .toString());
    }
}
