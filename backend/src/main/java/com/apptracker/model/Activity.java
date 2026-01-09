package com.apptracker.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity")
public class Activity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "application_id", columnDefinition = "uuid", nullable = false)
    private UUID applicationId;

    @JsonProperty("activityType")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public enum ActivityType {
        CREATED,
        STATUS_CHANGED,
        NOTE_ADDED,
        CONTACT_ADDED,
        FILE_UPLOADED,
        FILE_DELETED,
        REMINDER_ADDED,
        UPDATED
    }

    public Activity() {
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

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
