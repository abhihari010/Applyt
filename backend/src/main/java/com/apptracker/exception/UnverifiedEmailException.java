package com.apptracker.exception;

public class UnverifiedEmailException extends RuntimeException {
    private final String email;

    public UnverifiedEmailException(String message, String email) {
        super(message);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
