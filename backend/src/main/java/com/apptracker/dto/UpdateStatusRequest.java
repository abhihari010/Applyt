package com.apptracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateStatusRequest {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "SAVED|APPLIED|OA|INTERVIEW|OFFER|REJECTED", message = "Invalid status")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
