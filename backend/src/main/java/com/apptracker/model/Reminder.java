package com.apptracker.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reminders")
public class Reminder {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "application_id", columnDefinition = "uuid", nullable = false)
    private UUID applicationId;

    @Column(name = "remind_at", nullable = false)
    private OffsetDateTime remindAt;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Reminder() {
        this.id = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public OffsetDateTime getRemindAt() {
        return remindAt;
    }

    public void setRemindAt(OffsetDateTime remindAt) {
        this.remindAt = remindAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
