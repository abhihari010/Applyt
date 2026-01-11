package com.apptracker.controller;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(analyticsService.getAnalytics(userId));
    }

}
