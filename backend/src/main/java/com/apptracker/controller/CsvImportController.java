package com.apptracker.controller;

import com.apptracker.dto.CsvImportResult;
import com.apptracker.security.JwtUtil;
import com.apptracker.service.CsvImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications/import")
public class CsvImportController {

    private final CsvImportService csvImportService;
    private final JwtUtil jwtUtil;

    public CsvImportController(CsvImportService csvImportService, JwtUtil jwtUtil) {
        this.csvImportService = csvImportService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/csv")
    public ResponseEntity<?> importCsv(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Check file type
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only CSV files are supported"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds 5MB limit"));
            }

            // Get user ID from token
            String token = authHeader.substring(7);
            UUID userId = jwtUtil.validateAndGetUserId(token);

            // Import the CSV
            CsvImportResult result = csvImportService.importApplications(userId, file);

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("successCount", result.getSuccessCount());
            response.put("errorCount", result.getErrorCount());
            response.put("totalProcessed", result.getTotalProcessed());
            response.put("applications", result.getSuccessfulImports());
            response.put("errors", result.getErrors());

            if (result.getErrorCount() > 0 && result.getSuccessCount() == 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            } else if (result.getErrorCount() > 0) {
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
            } else {
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to import CSV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
