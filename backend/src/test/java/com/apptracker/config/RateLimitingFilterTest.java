package com.apptracker.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingFilterTest {

    private static MockHttpServletRequest request(String uri, String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", uri);
        request.setRemoteAddr(ip);
        return request;
    }

    private static MockHttpServletResponse send(RateLimitingFilter filter, MockHttpServletRequest request)
            throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        return response;
    }

    @ParameterizedTest
    @CsvSource({
            "/api/auth/login, 5",
            "/api/auth/register, 3",
            "/api/auth/resend-verification-email, 3",
            "/api/forgot-password/request, 3",
            "/api/forgot-password/reset, 3"
    })
    void allowsUpToTheLimitThenReturns429(String uri, int limit) throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(false);
        for (int i = 0; i < limit; i++) {
            assertThat(send(filter, request(uri, "1.1.1.1")).getStatus()).isEqualTo(200);
        }
        MockHttpServletResponse blocked = send(filter, request(uri, "1.1.1.1"));
        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getContentType()).isEqualTo("application/json");
        assertThat(blocked.getContentAsString()).contains("Too many requests");
    }

    @Test
    void blockedRequestNeverReachesTheChain() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(false);
        for (int i = 0; i < 5; i++) {
            send(filter, request("/api/auth/login", "1.1.1.1"));
        }
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request("/api/auth/login", "1.1.1.1"), new MockHttpServletResponse(), chain);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void doesNotLimitOtherEndpoints() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(false);
        for (int i = 0; i < 50; i++) {
            assertThat(send(filter, request("/api/apps", "1.1.1.1")).getStatus()).isEqualTo(200);
        }
    }

    @Test
    void countsEachIpAndEachEndpointSeparately() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(false);
        for (int i = 0; i < 6; i++) {
            send(filter, request("/api/auth/login", "1.1.1.1"));
        }
        assertThat(send(filter, request("/api/auth/login", "2.2.2.2")).getStatus()).isEqualTo(200);
        assertThat(send(filter, request("/api/auth/register", "1.1.1.1")).getStatus()).isEqualTo(200);
    }

    @Test
    void ignoresSpoofedForwardedHeadersWhenProxyIsNotTrusted() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(false);
        int lastStatus = 0;
        for (int i = 0; i < 6; i++) {
            MockHttpServletRequest request = request("/api/auth/login", "1.1.1.1");
            request.addHeader("X-Forwarded-For", "9.9.9." + i);
            lastStatus = send(filter, request).getStatus();
        }
        assertThat(lastStatus).isEqualTo(429);
    }

    @Test
    void usesFirstForwardedIpWhenProxyIsTrusted() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(true);
        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = request("/api/auth/login", "10.0.0.1");
            request.addHeader("X-Forwarded-For", "7.7.7.7, 10.0.0.1");
            send(filter, request);
        }
        MockHttpServletRequest sameClient = request("/api/auth/login", "10.0.0.2");
        sameClient.addHeader("X-Forwarded-For", "7.7.7.7");
        assertThat(send(filter, sameClient).getStatus()).isEqualTo(429);

        MockHttpServletRequest otherClient = request("/api/auth/login", "10.0.0.1");
        otherClient.addHeader("X-Forwarded-For", "8.8.8.8");
        assertThat(send(filter, otherClient).getStatus()).isEqualTo(200);
    }

    @Test
    void fallsBackToRealIpHeaderWhenProxyIsTrusted() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter(true);
        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = request("/api/auth/login", "10.0.0.1");
            request.addHeader("X-Forwarded-For", "unknown");
            request.addHeader("X-Real-IP", "7.7.7.7");
            send(filter, request);
        }
        MockHttpServletRequest sameClient = request("/api/auth/login", "10.0.0.1");
        sameClient.addHeader("X-Real-IP", "7.7.7.7");
        assertThat(send(filter, sameClient).getStatus()).isEqualTo(429);
    }
}
