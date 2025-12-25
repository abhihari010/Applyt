package com.apptracker.dto;

import java.time.OffsetDateTime;

public class CreateApplicationRequest {
    private String company;
    private String role;
    private String location;
    private String jobUrl;
    private String priority;
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
