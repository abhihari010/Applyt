package com.apptracker.dto;

import java.util.UUID;

public class UserDTO {
    private UUID id;
    private String name;
    private String email;
    private boolean emailNotifications;
    private boolean autoArchiveOldApps;
    private boolean showArchivedApps;

    public UserDTO() {
    }

    public UserDTO(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public UserDTO(UUID id, String name, String email, boolean emailNotifications, 
                   boolean autoArchiveOldApps, boolean showArchivedApps) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.emailNotifications = emailNotifications;
        this.autoArchiveOldApps = autoArchiveOldApps;
        this.showArchivedApps = showArchivedApps;
    }

    // Getters and Setters
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
}
