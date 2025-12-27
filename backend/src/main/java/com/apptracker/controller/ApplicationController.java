package com.apptracker.controller;

import com.apptracker.dto.*;
import com.apptracker.service.*;
import com.apptracker.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/apps")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);

    private final ApplicationService applicationService;
    private final ImportService importService;
    private final NoteService noteService;
    private final ContactService contactService;
    private final ReminderService reminderService;
    private final AttachmentService attachmentService;
    private final ActivityService activityService;

    public ApplicationController(ApplicationService applicationService,
            NoteService noteService,
            ContactService contactService,
            ReminderService reminderService,
            AttachmentService attachmentService,
            ActivityService activityService,
            ImportService importService) {
        this.applicationService = applicationService;
        this.noteService = noteService;
        this.contactService = contactService;
        this.reminderService = reminderService;
        this.attachmentService = attachmentService;
        this.activityService = activityService;
        this.importService = importService;
    }

    @GetMapping
    public ResponseEntity<Page<ApplicationDTO>> getApplications(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ApplicationDTO> apps = applicationService.getApplications(userId, status, q, from, to, pageRequest);
        return ResponseEntity.ok(apps);
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> createApplication(
            @AuthenticationPrincipal UUID userId,
            @RequestBody CreateApplicationRequest request) {

        logger.info("=== CREATE APPLICATION REQUEST ===");
        logger.info("UserId from @AuthenticationPrincipal: {}", userId);
        logger.info(
                "Request body - Company: {}, Role: {}, Priority: {}, Status: {}, Location: {}, JobUrl: {}, DateApplied: {}",
                request.getCompany(),
                request.getRole(),
                request.getPriority(),
                request.getStatus(),
                request.getLocation(),
                request.getJobUrl(),
                request.getDateApplied());

        ApplicationDTO app = applicationService.createApplication(userId, request);
        logger.info("Application created successfully with ID: {}", app.getId());
        return ResponseEntity.ok(app);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getApplication(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        ApplicationDTO app = applicationService.getApplicationById(userId, id);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> updateApplication(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody CreateApplicationRequest request) {

        ApplicationDTO app = applicationService.updateApplication(userId, id, request);
        return ResponseEntity.ok(app);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        applicationService.deleteApplication(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationDTO> updateStatus(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request) {

        ApplicationDTO app = applicationService.updateStatus(userId, id, request.getStatus());
        return ResponseEntity.ok(app);
    }

    // Notes endpoints
    @GetMapping("/{id}/notes")
    public ResponseEntity<List<Note>> getNotes(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        List<Note> notes = noteService.getNotes(userId, id);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<Note> createNote(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody CreateNoteRequest request) {

        Note note = noteService.createNote(userId, id, request);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{appId}/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID appId,
            @PathVariable UUID noteId) {
        noteService.deleteNote(userId, appId, noteId);
        return ResponseEntity.noContent().build();
    }

    // Contacts endpoints
    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<Contact>> getContacts(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        List<Contact> contacts = contactService.getContacts(userId, id);
        return ResponseEntity.ok(contacts);
    }

    @PostMapping("/{id}/contacts")
    public ResponseEntity<Contact> createContact(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody CreateContactRequest request) {

        Contact contact = contactService.createContact(userId, id, request);
        return ResponseEntity.ok(contact);
    }

    @DeleteMapping("/{appId}/contacts/{contactId}")
    public ResponseEntity<Void> deleteContact(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID appId,
            @PathVariable UUID contactId) {
        contactService.deleteContact(userId, appId, contactId);
        return ResponseEntity.noContent().build();
    }

    // Reminders endpoints
    @GetMapping("/{id}/reminders")
    public ResponseEntity<List<Reminder>> getReminders(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        List<Reminder> reminders = reminderService.getReminders(userId, id);
        return ResponseEntity.ok(reminders);
    }

    @PostMapping("/{id}/reminders")
    public ResponseEntity<Reminder> createReminder(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody CreateReminderRequest request) {

        Reminder reminder = reminderService.createReminder(userId, id, request);
        return ResponseEntity.ok(reminder);
    }

    @DeleteMapping("/{appId}/reminders/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID appId,
            @PathVariable UUID reminderId) {
        reminderService.deleteReminder(userId, appId, reminderId);
        return ResponseEntity.noContent().build();
    }

    // Attachments endpoints
    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<Attachment>> getAttachments(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        List<Attachment> attachments = attachmentService.getAttachments(userId, id);
        return ResponseEntity.ok(attachments);
    }

    @PostMapping("/{id}/attachments/presign")
    public ResponseEntity<PresignResponse> presignUpload(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody PresignRequest request) {

        PresignResponse response = attachmentService.generatePresignedUrl(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/attachments/confirm")
    public ResponseEntity<Attachment> confirmAttachment(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody ConfirmAttachmentRequest request) {

        Attachment attachment = attachmentService.confirmAttachment(userId, id, request);
        return ResponseEntity.ok(attachment);
    }

    @DeleteMapping("/{appId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID appId,
            @PathVariable UUID attachmentId) {
        attachmentService.deleteAttachment(userId, appId, attachmentId);
        return ResponseEntity.noContent().build();
    }

    // Activity endpoints
    @GetMapping("/{id}/activity")
    public ResponseEntity<List<Activity>> getActivity(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {

        List<Activity> activity = activityService.getActivity(userId, id);
        return ResponseEntity.ok(activity);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResponse> importApplication(
            @AuthenticationPrincipal UUID userId,
            @RequestBody ImportRequest request) {

        ImportResponse result = importService.importApplication(userId, request);
        return ResponseEntity.ok(result);
    }
}
