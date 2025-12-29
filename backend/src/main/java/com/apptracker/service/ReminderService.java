package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.*;
import com.apptracker.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {

    private final ApplicationRepository applicationRepository;

    private final ReminderRepository reminderRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);

    public ReminderService(ReminderRepository reminderRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository, EmailService emailService, UserRepository userRepository,
            ApplicationRepository applicationRepository) {
        this.reminderRepository = reminderRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public Reminder createReminder(UUID userId, UUID appId, CreateReminderRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        Reminder reminder = new Reminder();
        reminder.setApplicationId(appId);
        reminder.setRemindAt(request.getRemindAt());
        reminder.setMessage(request.getMessage());

        Reminder saved = reminderRepository.save(reminder);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.REMINDER_ADDED);
        activity.setMessage("Reminder set for " + request.getRemindAt());
        activityRepository.save(activity);

        return saved;
    }

    public List<Reminder> getReminders(UUID userId, UUID appId) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        return reminderRepository.findByApplicationIdOrderByRemindAtAsc(appId);
    }

    public List<Reminder> getDueReminders(UUID userId, int days) {
        OffsetDateTime until = OffsetDateTime.now().plusDays(days);
        return reminderRepository.findDueRemindersByUser(userId, until);
    }

    public List<Reminder> getAllIncompleteReminders(UUID userId) {
        return reminderRepository.findAllIncompleteRemindersByUser(userId);
    }

    @Transactional
    public Reminder completeReminder(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));

        // Verify ownership through application
        applicationService.getApplicationEntityById(userId, reminder.getApplicationId());

        reminder.setCompleted(true);
        return reminderRepository.save(reminder);
    }

    @Transactional
    public void deleteReminder(UUID userId, UUID appId, UUID reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));

        // Verify ownership through application
        applicationService.getApplicationEntityById(userId, appId);

        reminderRepository.delete(reminder);
    }

    /**
     * Runs every hour to check for reminders that need to be sent
     * Only sends emails to users who have email notifications enabled
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminderNotifications() {
        logger.info("Checking for reminders to send");

        try {
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime oneHourFromNow = now.plusHours(1);

            // Get all incomplete reminders that are due within the next hour
            List<Reminder> dueReminders = reminderRepository.findAll().stream()
                    .filter(r -> !r.isCompleted())
                    .filter(r -> r.getRemindAt().isAfter(now) && r.getRemindAt().isBefore(oneHourFromNow))
                    .toList();

            if (dueReminders.isEmpty()) {
                logger.info("No reminders due within the next hour");
                return;
            }

            logger.info("Found {} reminders due within the next hour", dueReminders.size());

            for (Reminder reminder : dueReminders) {
                // Get the application for this reminder
                applicationRepository.findById(reminder.getApplicationId()).ifPresent(application -> {
                    // Get the user for this application
                    userRepository.findById(application.getUserId()).ifPresent(user -> {
                        if (user.isEmailNotifications()) {
                            sendReminderEmail(user, reminder, application);
                        } else {
                            logger.debug("Skipping email for user {} - notifications disabled", user.getEmail());
                        }
                    });
                });
            }

        } catch (Exception e) {
            logger.error("Error sending reminder notifications", e);
        }
    }

    /**
     * Sends reminder email to user about an upcoming application deadline
     */
    private void sendReminderEmail(User user, Reminder reminder, ApplicationEntity application) {
        try {
            String emailBody = buildReminderEmail(user.getName(), application, reminder);
            emailService.sendEmail(user.getEmail(),
                    "Reminder: " + application.getCompany() + " - " + application.getRole(),
                    emailBody);

            logger.info("Reminder email sent successfully to {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send reminder email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    private String buildReminderEmail(String userName, ApplicationEntity application, Reminder reminder) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                                .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
                                .info-box { background-color: white; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 3px; }
                                .label { font-weight: bold; color: #1f2937; }
                                .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Application Reminder</h1>
                                </div>
                                <div class="content">
                                    <p>Hi %s,</p>
                                    <p>This is a reminder about your application:</p>
                                    <div class="info-box">
                                        <p><span class="label">Company:</span> %s</p>
                                        <p><span class="label">Role:</span> %s</p>
                                        <p><span class="label">Status:</span> %s</p>
                                    </div>
                                    <div class="info-box">
                                        <p><span class="label">Reminder:</span> %s</p>
                                        <p><span class="label">Due at:</span> %s</p>
                                    </div>
                                    <p>Good luck with your application!</p>
                                    <div class="footer">
                                        <p>&copy; 2024 AppTracker. All rights reserved.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                userName,
                application.getCompany(),
                application.getRole(),
                application.getStatus(),
                reminder.getMessage(),
                reminder.getRemindAt().toString());
    }
}
