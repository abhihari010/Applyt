package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.BadRequestException;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.*;
import com.apptracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;
    private final R2StorageService r2StorageService;

    public AttachmentService(AttachmentRepository attachmentRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository,
            R2StorageService r2StorageService) {
        this.attachmentRepository = attachmentRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
        this.r2StorageService = r2StorageService;
    }

    @Transactional
    public PresignResponse generatePresignedUrl(UUID userId, UUID appId, PresignRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        // Validate file
        if (!R2StorageService.isAllowedContentType(request.getContentType())) {
            throw new BadRequestException("File type not allowed. Allowed types: PDF, DOC, DOCX, TXT, images");
        }

        if (request.getSizeBytes() > R2StorageService.MAX_FILE_SIZE) {
            throw new BadRequestException("File too large. Maximum size is 10MB");
        }

        R2StorageService.PresignedUploadUrl presigned = r2StorageService.generatePresignedUploadUrl(
                userId, appId, request.getFileName(), request.getContentType());

        return new PresignResponse(presigned.getUploadUrl(), presigned.getObjectKey(), presigned.getExpiresAt());
    }

    @Transactional
    public Attachment confirmAttachment(UUID userId, UUID appId, ConfirmAttachmentRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        Attachment attachment = new Attachment();
        attachment.setApplicationId(appId);
        attachment.setObjectKey(request.getObjectKey());
        attachment.setFileName(request.getFileName());
        attachment.setContentType(request.getContentType());
        attachment.setSizeBytes(request.getSizeBytes());

        Attachment saved = attachmentRepository.save(attachment);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.FILE_UPLOADED);
        activity.setMessage("File uploaded: " + request.getFileName());
        activityRepository.save(activity);

        return saved;
    }

    public List<Attachment> getAttachments(UUID userId, UUID appId) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        return attachmentRepository.findByApplicationIdOrderByUploadedAtDesc(appId);
    }

    public String getDownloadUrl(UUID userId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        // Verify ownership
        applicationService.getApplicationEntityById(userId, attachment.getApplicationId());

        return r2StorageService.generatePresignedDownloadUrl(attachment.getObjectKey());
    }

    public void deleteAttachment(UUID userId, UUID appId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        
        // Delete from R2 first
        r2StorageService.deleteObject(attachment.getObjectKey());
        
        // Then delete from database
        attachmentRepository.delete(attachment);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.FILE_DELETED);
        activity.setMessage("File deleted: " + attachment.getFileName());
        activityRepository.save(activity);
    }
}