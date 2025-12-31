package com.apptracker.controller;

import com.apptracker.dto.OpenJob;
import com.apptracker.service.ScheduledTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for browsing open job postings
 * Provides endpoints to view available internship opportunities
 * scraped from GitHub repositories
 */
@RestController
@RequestMapping("/api/jobs")
public class JobBrowseController {

    private static final Logger logger = LoggerFactory.getLogger(JobBrowseController.class);
    private final ScheduledTaskService scheduledTaskService;

    public JobBrowseController(ScheduledTaskService scheduledTaskService) {
        this.scheduledTaskService = scheduledTaskService;
    }

    /**
     * Get all open internship postings from the cache with pagination
     * The cache is automatically refreshed every 12 hours
     * 
     * @param page Page number (0-indexed, default: 0)
     * @param size Page size (default: 20)
     * @return Paginated list of job postings
     */
    @GetMapping("/open-internships")
    public ResponseEntity<Page<OpenJob>> getOpenInternships(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<OpenJob> allJobs = scheduledTaskService.getCachedOpenJobs();

        // Calculate pagination boundaries
        int start = page * size;
        int end = Math.min(start + size, allJobs.size());

        // Return empty page if start index is beyond the list
        if (start >= allJobs.size()) {
            return ResponseEntity.ok(new PageImpl<>(List.of(), PageRequest.of(page, size), allJobs.size()));
        }

        // Get the sublist for this page
        List<OpenJob> pageContent = allJobs.subList(start, end);

        // Create a Page object
        Page<OpenJob> jobPage = new PageImpl<>(pageContent, PageRequest.of(page, size), allJobs.size());

        return ResponseEntity.ok(jobPage);
    }

    /**
     * Debug endpoint to manually refresh the job cache
     * Useful for testing without waiting for the scheduled task
     * 
     * @return Status message with number of jobs cached
     */
    @GetMapping("/refresh-cache")
    public ResponseEntity<Map<String, Object>> refreshCache() {
        try {
            scheduledTaskService.refreshOpenJobsCache();
            List<OpenJob> jobs = scheduledTaskService.getCachedOpenJobs();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cache refreshed successfully");
            response.put("jobCount", jobs.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error refreshing cache", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to refresh cache: " + e.getMessage());
            response.put("jobCount", 0);

            return ResponseEntity.status(500).body(response);
        }
    }
}
