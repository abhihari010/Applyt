package com.apptracker.service;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final ApplicationRepository applicationRepo;
    private final UserRepository userRepo;

    public ScheduledTaskService(ApplicationRepository applicationRepo, UserRepository userRepo) {
        this.applicationRepo = applicationRepo;
        this.userRepo = userRepo;
    }

    /**
     * Runs daily at 2 AM to auto-archive rejected applications older than 30 days
     * for users who have enabled the auto-archive preference
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void autoArchiveOldRejectedApplications() {
        logger.info("Running scheduled task: auto-archive old rejected applications");

        try {
            // Get all users who have auto-archive enabled
            List<User> usersWithAutoArchive = userRepo.findAll().stream()
                    .filter(User::isAutoArchiveOldApps)
                    .toList();

            logger.info("Found {} users with auto-archive enabled", usersWithAutoArchive.size());

            int totalArchived = 0;

            for (User user : usersWithAutoArchive) {
                // Calculate the cutoff date (30 days ago)
                OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(30);

                // Find all rejected, non-archived applications for this user that are older
                // than 30 days
                List<ApplicationEntity> applicationsToArchive = applicationRepo.findAll().stream()
                        .filter(app -> app.getUserId().equals(user.getId()))
                        .filter(app -> "REJECTED".equals(app.getStatus()))
                        .filter(app -> !app.isArchived())
                        .filter(app -> app.getUpdatedAt() != null && app.getUpdatedAt().isBefore(cutoffDate))
                        .toList();

                // Archive them
                for (ApplicationEntity app : applicationsToArchive) {
                    app.setArchived(true);
                    applicationRepo.save(app);
                    totalArchived++;
                    logger.debug("Archived application {} for user {}", app.getId(), user.getEmail());
                }
            }

            logger.info("Auto-archive task completed. Archived {} applications", totalArchived);

        } catch (Exception e) {
            logger.error("Error during auto-archive task", e);
        }
    }
}
