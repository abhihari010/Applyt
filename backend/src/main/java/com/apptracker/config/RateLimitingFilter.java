package com.apptracker.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter using token bucket algorithm
 * Protects authentication endpoints from brute force attacks
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Store buckets per IP address
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final boolean trustProxyHeaders;

    public RateLimitingFilter(
            @Value("${app.security.trust-proxy-headers:false}") boolean trustProxyHeaders) {
        this.trustProxyHeaders = trustProxyHeaders;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Apply rate limiting only to sensitive endpoints
        if (shouldRateLimit(uri)) {
            String clientIp = getClientIp(request);
            Bucket bucket = resolveBucket(clientIp, uri);

            if (bucket.tryConsume(1)) {
                // Request allowed
                filterChain.doFilter(request, response);
            } else {
                // Rate limit exceeded
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"error\":\"Too many requests. Please try again later.\"}");
            }
        } else {
            // No rate limiting for this endpoint
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Determine if the endpoint should be rate limited
     */
    private boolean shouldRateLimit(String uri) {
        return uri.startsWith("/api/auth/login") ||
                uri.startsWith("/api/auth/register") ||
                uri.startsWith("/api/auth/resend-verification-email") ||
                uri.startsWith("/api/forgot-password");
    }

    /**
     * Get or create a bucket for the client IP
     */
    private Bucket resolveBucket(String clientIp, String uri) {
        String key = clientIp + ":" + uri;
        return buckets.computeIfAbsent(key, k -> createBucket(uri));
    }

    /**
     * Create a new bucket with appropriate limits based on endpoint
     */
    private Bucket createBucket(String uri) {
        Bandwidth limit;

        if (uri.startsWith("/api/auth/login")) {
            // Login: 5 attempts per minute
            limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        } else if (uri.startsWith("/api/auth/register")) {
            // Registration: 3 attempts per hour
            limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1)));
        } else if (uri.startsWith("/api/auth/resend-verification-email")) {
            // Resend verification: 3 attempts per 15 minutes
            limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(15)));
        } else if (uri.startsWith("/api/forgot-password")) {
            // Password reset: 3 attempts per hour
            limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1)));
        } else {
            // Default: 10 requests per minute
            limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
        }

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        if (trustProxyHeaders) {
            String forwardedIp = request.getHeader("X-Forwarded-For");
            if (isBlankOrUnknown(forwardedIp)) {
                forwardedIp = request.getHeader("X-Real-IP");
            }
            if (!isBlankOrUnknown(forwardedIp)) {
                ip = forwardedIp;
            }
        }

        // X-Forwarded-For can contain multiple IPs, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip != null ? ip : "unknown";
    }

    private boolean isBlankOrUnknown(String ip) {
        return ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip);
    }
}
