package com.apptracker.service;

import com.apptracker.dto.ApplicationDTO;
import com.apptracker.dto.CreateApplicationRequest;
import com.apptracker.model.ApplicationEntity;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;
import com.apptracker.dto.CsvImportResult;

@Service
public class CsvImportService {

    private final ApplicationService applicationService;

    public CsvImportService(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    public CsvImportResult importApplications(UUID userId, MultipartFile file) {
        CsvImportResult result = new CsvImportResult();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CSVParser csvParser = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .get()
                    .parse(reader);

            int rowNumber = 1; // Start at 1 (header is row 0)

            for (CSVRecord record : csvParser) {
                rowNumber++;
                try {
                    ApplicationDTO app = processRecord(userId, record);
                    result.addSuccess(app);
                } catch (Exception e) {
                    result.addError(rowNumber, e.getMessage());
                }
            }

        } catch (Exception e) {
            result.addError(0, "Failed to parse CSV file: " + e.getMessage());
        }

        return result;
    }

    private ApplicationDTO processRecord(UUID userId, CSVRecord record) throws Exception {
        CreateApplicationRequest request = new CreateApplicationRequest();

        // Required fields
        String company = getField(record, "company");
        String role = getField(record, "role", "position", "job_title", "title");

        if (company == null || company.trim().isEmpty()) {
            throw new IllegalArgumentException("Company is required");
        }
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role/Position is required");
        }

        request.setCompany(company.trim());
        request.setRole(role.trim());

        // Optional fields
        request.setLocation(getField(record, "location", "city", "loc"));
        request.setJobUrl(getField(record, "job_url", "url", "link", "job_link"));

        // Date applied - try multiple formats
        String dateStr = getField(record, "date_applied", "applied_date", "date", "applied");
        if (dateStr != null && !dateStr.trim().isEmpty()) {
            request.setDateApplied(parseDate(dateStr));
        } else {
            request.setDateApplied(OffsetDateTime.now());
        }

        // Status
        String status = getField(record, "status");
        if (status != null && !status.trim().isEmpty()) {
            request.setStatus(normalizeStatus(status.trim()));
        } else {
            request.setStatus("APPLIED");
        }

        // Priority
        String priority = getField(record, "priority");
        if (priority != null && !priority.trim().isEmpty()) {
            request.setPriority(normalizePriority(priority.trim()));
        } else {
            request.setPriority("MEDIUM");
        }

        return applicationService.createApplication(userId, request);
    }

    private String getField(CSVRecord record, String... possibleHeaders) {
        for (String header : possibleHeaders) {
            try {
                if (record.isMapped(header)) {
                    String value = record.get(header);
                    if (value != null && !value.trim().isEmpty()) {
                        return value;
                    }
                }
            } catch (IllegalArgumentException e) {
                // Header not found, try next
            }
        }
        return null;
    }

    private OffsetDateTime parseDate(String dateStr) {
        DateTimeFormatter[] formatters = {
                DateTimeFormatter.ISO_OFFSET_DATE_TIME,
                DateTimeFormatter.ISO_LOCAL_DATE_TIME,
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("d/M/yyyy")
        };

        for (DateTimeFormatter formatter : formatters) {
            try {
                if (formatter.toString().contains("DATE_TIME")) {
                    return OffsetDateTime.parse(dateStr, formatter);
                } else {
                    LocalDate localDate = LocalDate.parse(dateStr, formatter);
                    return localDate.atStartOfDay().atOffset(ZoneOffset.UTC);
                }
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }

        // If all else fails, use current date
        return OffsetDateTime.now();
    }

    private String normalizeStatus(String status) {
        String upper = status.toUpperCase().replace(" ", "_");

        // Map common variations to valid statuses
        switch (upper) {
            case "APPLIED":
            case "SUBMITTED":
            case "APPLICATION_SUBMITTED":
                return "APPLIED";
            case "INTERVIEW":
            case "INTERVIEWING":
            case "PHONE_SCREEN":
            case "SCREENING":
                return "INTERVIEW";
            case "OFFER":
            case "OFFERED":
            case "OFFER_RECEIVED":
                return "OFFER";
            case "ACCEPTED":
            case "HIRED":
                return "ACCEPTED";
            case "REJECTED":
            case "DECLINED":
            case "NOT_SELECTED":
                return "REJECTED";
            case "WITHDRAWN":
            case "CANCELLED":
                return "WITHDRAWN";
            default:
                // If it matches a valid status exactly, use it
                try {
                    ApplicationEntity.Status.valueOf(upper);
                    return upper;
                } catch (IllegalArgumentException e) {
                    // Default to APPLIED if unknown
                    return "APPLIED";
                }
        }
    }

    private String normalizePriority(String priority) {
        String upper = priority.toUpperCase();

        switch (upper) {
            case "LOW":
            case "L":
            case "1":
                return "LOW";
            case "MEDIUM":
            case "MED":
            case "M":
            case "2":
                return "MEDIUM";
            case "HIGH":
            case "H":
            case "3":
                return "HIGH";
            default:
                try {
                    ApplicationEntity.Priority.valueOf(upper);
                    return upper;
                } catch (IllegalArgumentException e) {
                    return "MEDIUM";
                }
        }
    }

}
