package com.apptracker.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String name;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private OffsetDateTime createdAt;

    @Column(name = "email_notifications")
    private boolean emailNotifications = true;

    @Column(name = "auto_archive_old_apps")
    private boolean autoArchiveOldApps = false;

    @Column(name = "show_archived_apps")
    private boolean showArchivedApps = false;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public User() {
        this.id = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
        this.emailNotifications = true;
        this.autoArchiveOldApps = false;
        this.showArchivedApps = false;
    }

    // getters / setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isAutoArchiveOldApps() {
        return autoArchiveOldApps;
    }

    public void setAutoArchiveOldApps(boolean autoArchiveOldApps) {
        this.autoArchiveOldApps = autoArchiveOldApps;
    }

    public boolean isShowArchivedApps() {
        return showArchivedApps;
    }

    public void setShowArchivedApps(boolean showArchivedApps) {
        this.showArchivedApps = showArchivedApps;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

}
