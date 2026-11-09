package com.apptracker.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ValidationUtilsTest {

    @ParameterizedTest
    @ValueSource(strings = {"Jo", "Mary Jane", "Anne-Marie O.", "user_42", "  Padded Name  "})
    void validateNameAcceptsOrdinaryNames(String name) {
        assertThatCode(() -> ValidationUtils.validateName(name)).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "x"})
    void validateNameRejectsEmptyOrTooShortNames(String name) {
        assertThatThrownBy(() -> ValidationUtils.validateName(name)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validateNameEnforcesMaxLengthBoundary() {
        assertThatCode(() -> ValidationUtils.validateName("a".repeat(50))).doesNotThrowAnyException();
        assertThatThrownBy(() -> ValidationUtils.validateName("a".repeat(51)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"admin", "ADMIN", " Root ", "no-reply", "Support"})
    void validateNameRejectsReservedNamesInAnyCase(String name) {
        assertThatThrownBy(() -> ValidationUtils.validateName(name))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reserved");
    }

    @ParameterizedTest
    @ValueSource(strings = {"<b>bold</b>", "<script>alert(1)</script>", "x<img src=y>"})
    void validateNameRejectsHtml(String name) {
        assertThatThrownBy(() -> ValidationUtils.validateName(name)).isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"a'; DROP TABLE users", "x -- comment", "SELECT * from users", "a /* b"})
    void validateNameRejectsSqlLikeInput(String name) {
        assertThatThrownBy(() -> ValidationUtils.validateName(name)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void sanitizeStringStripsScriptsAndTagsAndTrims() {
        assertThat(ValidationUtils.sanitizeString("  <script>alert(1)</script>Hello <b>World</b> "))
                .isEqualTo("Hello World");
        assertThat(ValidationUtils.sanitizeString(null)).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Zx9vQm2LtR", "aB3defgh"})
    void validatePasswordStrengthAcceptsStrongPasswords(String password) {
        assertThatCode(() -> ValidationUtils.validatePasswordStrength(password)).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {
            "aB3defg", // too short
            "alllowercase1", // no uppercase
            "ALLUPPERCASE1", // no lowercase
            "NoDigitsHere", // no digit
            "Password123", // common
            "xxAdmin123xx" // contains a common password
    })
    void validatePasswordStrengthRejectsWeakPasswords(String password) {
        assertThatThrownBy(() -> ValidationUtils.validatePasswordStrength(password))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validatePasswordStrengthEnforcesMaxLengthBoundary() {
        String atLimit = "aB3" + "x".repeat(125);
        assertThatCode(() -> ValidationUtils.validatePasswordStrength(atLimit)).doesNotThrowAnyException();
        assertThatThrownBy(() -> ValidationUtils.validatePasswordStrength(atLimit + "x"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void isReservedNameIsCaseInsensitiveAndNullSafe() {
        assertThat(ValidationUtils.isReservedName(" Admin ")).isTrue();
        assertThat(ValidationUtils.isReservedName("Alice")).isFalse();
        assertThat(ValidationUtils.isReservedName(null)).isFalse();
    }
}
