package com.apptracker.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Singleton logger utility for consistent logging across the application.
 * Usage: AppLogger.info("message"), AppLogger.error("message", exception)
 */
public class AppLogger {
    private static final Logger LOGGER = LoggerFactory.getLogger("AppTracker");

    private AppLogger() {
        // Private constructor to prevent instantiation
    }

    public static void debug(String message) {
        LOGGER.debug(message);
    }

    public static void debug(String message, Throwable throwable) {
        LOGGER.debug(message, throwable);
    }

    public static void info(String message) {
        LOGGER.info(message);
    }

    public static void info(String message, Object... args) {
        LOGGER.info(message, args);
    }

    public static void warn(String message) {
        LOGGER.warn(message);
    }

    public static void warn(String message, Throwable throwable) {
        LOGGER.warn(message, throwable);
    }

    public static void error(String message) {
        LOGGER.error(message);
    }

    public static void error(String message, Throwable throwable) {
        LOGGER.error(message, throwable);
    }

    public static void error(String message, Object... args) {
        LOGGER.error(message, args);
    }
}
