package com.apptracker.controller;

import com.apptracker.model.Reminder;
import com.apptracker.service.ReminderService;
import com.apptracker.service.AttachmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UtilityController {

    private final ReminderService reminderService;
    private final AttachmentService attachmentService;

    public UtilityController(ReminderService reminderService, AttachmentService attachmentService) {
        this.reminderService = reminderService;
        this.attachmentService = attachmentService;
    }

    @GetMapping("/reminders/due")
    public ResponseEntity<List<Reminder>> getDueReminders(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "7") int days) {

        List<Reminder> reminders = reminderService.getDueReminders(userId, days);
        return ResponseEntity.ok(reminders);
    }

    @GetMapping("/reminders/all")
    public ResponseEntity<List<Reminder>> getAllIncompleteReminders(
            @AuthenticationPrincipal UUID userId) {

        List<Reminder> reminders = reminderService.getAllIncompleteReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    @PatchMapping("/reminders/{id}/complete")
    public ResponseEntity<Reminder> completeReminder(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        Reminder reminder = reminderService.completeReminder(userId, id);
        return ResponseEntity.ok(reminder);
    }

    @GetMapping("/attachments/{id}/download-url")
    public ResponseEntity<Map<String, String>> getDownloadUrl(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        String url = attachmentService.getDownloadUrl(userId, id);
        return ResponseEntity.ok(Map.of("downloadUrl", url));
    }
}
