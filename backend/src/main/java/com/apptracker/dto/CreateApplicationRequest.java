package com.apptracker.dto;

import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;

import org.hibernate.validator.constraints.URL;

public class CreateApplicationRequest {
    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Job role is required")
    private String role;

    private String location;

    @URL(regexp = "^$|^https?://.*", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Job URL must be a valid http or https URL")
    private String jobUrl;

    @Pattern(regexp = "HIGH|MEDIUM|LOW", message = "Priority must be one of: HIGH, MEDIUM, LOW")
    private String priority;

    @Pattern(regexp = "SAVED|APPLIED|OA|INTERVIEW|OFFER|ACCEPTED|REJECTED", message = "Invalid status")
    private String status;

    private OffsetDateTime dateApplied;

    // Getters and Setters
    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public OffsetDateTime getDateApplied() {
        return dateApplied;
    }

    public void setDateApplied(OffsetDateTime dateApplied) {
        this.dateApplied = dateApplied;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
