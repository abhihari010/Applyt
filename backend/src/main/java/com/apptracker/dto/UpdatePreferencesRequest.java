package com.apptracker.dto;

public class UpdatePreferencesRequest {
    private Boolean emailNotifications;
    private Boolean autoArchiveOldApps;
    private Boolean showArchivedApps;

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getAutoArchiveOldApps() {
        return autoArchiveOldApps;
    }

    public void setAutoArchiveOldApps(Boolean autoArchiveOldApps) {
        this.autoArchiveOldApps = autoArchiveOldApps;
    }

    public Boolean getShowArchivedApps() {
        return showArchivedApps;
    }

    public void setShowArchivedApps(Boolean showArchivedApps) {
        this.showArchivedApps = showArchivedApps;
    }
}
