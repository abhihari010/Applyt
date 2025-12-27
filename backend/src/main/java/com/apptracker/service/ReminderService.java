package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.*;
import com.apptracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;

    public ReminderService(ReminderRepository reminderRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository) {
        this.reminderRepository = reminderRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
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
}
