package com.apptracker.service;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Reminder;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.ReminderRepository;
import com.apptracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final ReminderRepository reminderRepo;
    private final UserRepository userRepo;
    private final ApplicationRepository applicationRepo;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String supportEmail;

    public EmailNotificationService(ReminderRepository reminderRepo, UserRepository userRepo,
            ApplicationRepository applicationRepo, JavaMailSender mailSender) {
        this.reminderRepo = reminderRepo;
        this.userRepo = userRepo;
        this.applicationRepo = applicationRepo;
        this.mailSender = mailSender;
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
            List<Reminder> dueReminders = reminderRepo.findAll().stream()
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
                applicationRepo.findById(reminder.getApplicationId()).ifPresent(application -> {
                    // Get the user for this application
                    userRepo.findById(application.getUserId()).ifPresent(user -> {
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(supportEmail);
            message.setTo(user.getEmail());
            message.setSubject("Reminder: " + application.getCompany() + " - " + application.getRole());

            // Create a nicely formatted email body
            String emailBody = String.format(
                    "Hi %s,\n\n" +
                            "This is a reminder about your application:\n\n" +
                            "Company: %s\n" +
                            "Role: %s\n" +
                            "Status: %s\n\n" +
                            "Reminder: %s\n\n" +
                            "Due at: %s\n\n" +
                            "Good luck!\n\n" +
                            "Best regards,\n" +
                            "AppTracker Team",
                    user.getName(),
                    application.getCompany(),
                    application.getRole(),
                    application.getStatus(),
                    reminder.getMessage(),
                    reminder.getRemindAt().toString());

            message.setText(emailBody);

            mailSender.send(message);
            logger.info("Reminder email sent successfully to {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send reminder email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }
}
