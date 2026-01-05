package com.apptracker.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateNoteRequest {
    @NotBlank(message = "Note content is required")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
