package com.apptracker.dto;

import java.time.OffsetDateTime;

public class OpenJob {
    private String role;
    private String company;
    private String jobUrl;
    private String location;
    private OffsetDateTime datePosted;

    // Getters and Setters
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public OffsetDateTime getDatePosted() {
        return datePosted;
    }

    public void setDatePosted(OffsetDateTime datePosted) {
        this.datePosted = datePosted;
    }
}
