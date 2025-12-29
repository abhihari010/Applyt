package com.apptracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AppTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppTrackerApplication.class, args);
    }
}
