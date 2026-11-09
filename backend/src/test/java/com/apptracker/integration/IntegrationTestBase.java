package com.apptracker.integration;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.UserRepository;
import com.apptracker.security.JwtUtil;
import com.apptracker.service.EmailService;
import com.apptracker.service.R2StorageService;
import com.apptracker.service.ScheduledTaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Boots the full app, security filters included, on a throwaway local Postgres using the real Flyway migrations
 * and ddl-auto=validate, as in production. Email, R2 and the GitHub job fetch are mocked.
 *
 * Inline and dynamic test properties outrank environment variables, so DATABASE_URL or SPRING_DATASOURCE_URL in
 * the developer's shell can't point this suite at a real database.
 */
@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.mail.host=localhost",
        "spring.mail.username=test@example.com",
        "spring.mail.password=unused",
        "management.health.mail.enabled=false",
        "spring.security.oauth2.client.registration.google.client-id=test",
        "spring.security.oauth2.client.registration.google.client-secret=test",
        "spring.security.oauth2.client.registration.github.client-id=test",
        "spring.security.oauth2.client.registration.github.client-secret=test",
        "jwt.secret=" + IntegrationTestBase.JWT_SECRET,
        "r2.account-id=test",
        "r2.access-key-id=test",
        "r2.secret-access-key=test",
        "r2.bucket=test",
        "r2.endpoint=http://localhost:1",
        "app.frontend-url=http://frontend.test",
        "app.security.trust-proxy-headers=false"
})
@AutoConfigureMockMvc
abstract class IntegrationTestBase {

    static final String JWT_SECRET = "integration-test-secret-integration-test-secret-0123456789";
    static final String PASSWORD = "Zx9vQm2LtR";

    static final EmbeddedPostgres POSTGRES = startPostgres();

    private static final AtomicInteger IP_COUNTER = new AtomicInteger();
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(4);

    private static EmbeddedPostgres startPostgres() {
        try {
            return EmbeddedPostgres.builder().start();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not start embedded Postgres", e);
        }
    }

    static String jdbcUrl() {
        return POSTGRES.getJdbcUrl("postgres", "postgres");
    }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", IntegrationTestBase::jdbcUrl);
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired ApplicationRepository applications;
    @Autowired JwtUtil jwtUtil;

    @MockBean EmailService emailService;
    @MockBean R2StorageService r2;
    // Mocked because its @PostConstruct fetches a README from GitHub.
    @MockBean ScheduledTaskService scheduledTasks;

    User verifiedUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail(uniqueEmail());
        user.setPasswordHash(ENCODER.encode(PASSWORD));
        user.setEmailVerified(true);
        return users.save(user);
    }

    static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    ApplicationEntity applicationOwnedBy(User owner) {
        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(owner.getId());
        app.setCompany("Acme");
        app.setRole("Engineer");
        return applications.save(app);
    }

    /** What the frontend sends on every request: the JWT as a Bearer token. */
    MockHttpServletRequestBuilder as(User user, MockHttpServletRequestBuilder request) {
        return request.header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtUtil.generateToken(user.getId()));
    }

    MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder request, Object body) throws Exception {
        return request.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    }

    /** The rate limiter's buckets live for the whole shared context, so each caller gets its own IP. */
    static RequestPostProcessor freshIp() {
        int n = IP_COUNTER.incrementAndGet();
        return request -> {
            request.setRemoteAddr("198.18." + (n >> 8 & 255) + "." + (n & 255));
            return request;
        };
    }
}
