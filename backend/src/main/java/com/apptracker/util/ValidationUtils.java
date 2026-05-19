package com.apptracker.util;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Utility class for input validation and sanitization
 */
public class ValidationUtils {

    private static final Set<String> RESERVED_NAMES = Set.of(
            "admin", "administrator", "root", "superuser", "sysadmin",
            "system", "support", "moderator", "mod", "owner", "webmaster",
            "postmaster", "hostmaster", "abuse", "security", "noreply",
            "no-reply", "service", "api", "bot", "help", "info"
    );

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[^>]*>.*?</script>");
    private static final int MAX_NAME_LENGTH = 50;
    private static final int MIN_NAME_LENGTH = 2;

    /**
     * Validates and sanitizes a user's name
     *
     * @param name The name to validate
     * @throws IllegalArgumentException if name is invalid
     */
    public static void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        String trimmedName = name.trim();

        // Check length
        if (trimmedName.length() < MIN_NAME_LENGTH) {
            throw new IllegalArgumentException("Name must be at least " + MIN_NAME_LENGTH + " characters");
        }
        if (trimmedName.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("Name must not exceed " + MAX_NAME_LENGTH + " characters");
        }

        // Check for reserved names (case-insensitive)
        if (RESERVED_NAMES.contains(trimmedName.toLowerCase())) {
            throw new IllegalArgumentException("This name is reserved and cannot be used");
        }

        // Check for HTML/script tags (XSS prevention)
        if (containsHtmlOrScript(trimmedName)) {
            throw new IllegalArgumentException("Name contains invalid characters");
        }

        // Check for SQL injection patterns
        if (containsSqlInjectionPatterns(trimmedName)) {
            throw new IllegalArgumentException("Name contains invalid characters");
        }
    }

    /**
     * Sanitizes a string by removing HTML tags and potentially dangerous content
     *
     * @param input The string to sanitize
     * @return Sanitized string
     */
    public static String sanitizeString(String input) {
        if (input == null) {
            return null;
        }

        // Remove script tags
        String sanitized = SCRIPT_PATTERN.matcher(input).replaceAll("");

        // Remove HTML tags
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");

        // Trim whitespace
        return sanitized.trim();
    }

    /**
     * Checks if string contains HTML or script tags
     */
    private static boolean containsHtmlOrScript(String input) {
        return HTML_TAG_PATTERN.matcher(input).find() ||
               SCRIPT_PATTERN.matcher(input).find();
    }

    /**
     * Checks for common SQL injection patterns
     */
    private static boolean containsSqlInjectionPatterns(String input) {
        String lowerInput = input.toLowerCase();
        String[] sqlKeywords = {
            "select ", "insert ", "update ", "delete ", "drop ", "union ",
            "--", "/*", "*/", "';", "\";", "xp_", "exec ", "execute "
        };

        for (String keyword : sqlKeywords) {
            if (lowerInput.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validates password strength
     * Note: This is called in addition to the @Pattern validation in RegisterRequest
     *
     * @param password The password to validate
     * @throws IllegalArgumentException if password is weak
     */
    public static void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        if (password.length() > 128) {
            throw new IllegalArgumentException("Password must not exceed 128 characters");
        }

        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        if (!hasUpperCase || !hasLowerCase || !hasDigit) {
            throw new IllegalArgumentException(
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            );
        }

        // Check for common weak passwords
        String[] commonPasswords = {
            "password", "12345678", "qwerty123", "abc12345", "password123",
            "welcome123", "admin123", "user1234", "test1234"
        };

        for (String common : commonPasswords) {
            if (password.toLowerCase().contains(common)) {
                throw new IllegalArgumentException("Password is too common. Please choose a stronger password");
            }
        }
    }

    /**
     * Checks if a name is reserved
     */
    public static boolean isReservedName(String name) {
        return name != null && RESERVED_NAMES.contains(name.toLowerCase().trim());
    }
}
