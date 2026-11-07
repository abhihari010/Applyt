package com.apptracker.config;

import com.apptracker.security.CsrfHeaderFilter;
import com.apptracker.security.JwtAuthFilter;
import com.apptracker.security.OAuth2SuccessHandler;
import com.apptracker.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final CsrfHeaderFilter csrfHeaderFilter;
        private final OAuth2SuccessHandler oauth2SuccessHandler;
        private final OAuth2Service oauth2Service;
        private final RateLimitingFilter rateLimitingFilter;
        private final String frontendUrl;

        public SecurityConfig(JwtAuthFilter jwtAuthFilter, CsrfHeaderFilter csrfHeaderFilter,
                        OAuth2SuccessHandler oauth2SuccessHandler,
                        OAuth2Service oauth2Service, RateLimitingFilter rateLimitingFilter,
                        @Value("${app.frontend-url}") String frontendUrl) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.csrfHeaderFilter = csrfHeaderFilter;
                this.oauth2SuccessHandler = oauth2SuccessHandler;
                this.oauth2Service = oauth2Service;
                this.rateLimitingFilter = rateLimitingFilter;
                this.frontendUrl = frontendUrl;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // Spring's token-based CSRF is replaced by CsrfHeaderFilter and SameSite
                                // cookies.
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults()) // enable CORS properly
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(EndpointRequest.to(HealthEndpoint.class)).permitAll()
                                                .requestMatchers("/api/auth/login", "/api/auth/register",
                                                                "/api/auth/refresh", "/api/auth/logout",
                                                                "/api/auth/oauth2/exchange",
                                                                "/api/auth/verify-email",
                                                                "/api/auth/resend-verification-email",
                                                                "/api/forgot-password/**", "/oauth2/**",
                                                                "/login/oauth2/**", "/api/jobs/open-internships")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                // The frontend needs a 401 to know it should refresh
                                .exceptionHandling(errors -> errors
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(oauth2Service))
                                                .successHandler(oauth2SuccessHandler))
                                .addFilterBefore(csrfHeaderFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Allow the frontend dev server origin. Add more origins for other environments
                // as needed.
                configuration.setAllowedOrigins(
                                Arrays.asList("http://localhost:3000", frontendUrl));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Collections.singletonList("*"));
                configuration.setExposedHeaders(Arrays.asList("Authorization", "Location"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }
}
