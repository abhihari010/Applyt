package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.exception.UnauthorizedException;
import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Activity;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.ActivityRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ActivityRepository activityRepository;

    public ApplicationService(ApplicationRepository applicationRepository, ActivityRepository activityRepository) {
        this.applicationRepository = applicationRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public ApplicationDTO createApplication(UUID userId, CreateApplicationRequest request) {
        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(userId);
        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setLocation(request.getLocation());
        app.setJobUrl(request.getJobUrl());
        app.setDateApplied(request.getDateApplied());

        if (request.getPriority() != null) {
            app.setPriority(ApplicationEntity.Priority.valueOf(request.getPriority()));
        }
        if (request.getStatus() != null) {
            app.setStatus(ApplicationEntity.Status.valueOf(request.getStatus()));
        }

        ApplicationEntity saved = applicationRepository.save(app);

        // Log activity
        logActivity(saved.getId(), Activity.ActivityType.CREATED,
                String.format("Application created for %s at %s", request.getRole(), request.getCompany()));

        return new ApplicationDTO(saved);
    }

    public Page<ApplicationDTO> getApplications(UUID userId, String status, String query,
            OffsetDateTime from, OffsetDateTime to,
            Pageable pageable) {
        Specification<ApplicationEntity> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("userId"), userId));
            predicates.add(cb.equal(root.get("archived"), false));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ApplicationEntity.Status.valueOf(status)));
            }

            if (query != null && !query.isEmpty()) {
                String likePattern = "%" + query.toLowerCase() + "%";
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), likePattern);
                Predicate roleMatch = cb.like(cb.lower(root.get("role")), likePattern);
                predicates.add(cb.or(companyMatch, roleMatch));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dateApplied"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dateApplied"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return applicationRepository.findAll(spec, pageable).map(ApplicationDTO::new);
    }

    public ApplicationDTO getApplicationById(UUID userId, UUID appId) {
        ApplicationEntity app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this application");
        }

        return new ApplicationDTO(app);
    }

    @Transactional
    public ApplicationDTO updateApplication(UUID userId, UUID appId, CreateApplicationRequest request) {
        ApplicationEntity app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to update this application");
        }

        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setLocation(request.getLocation());
        app.setJobUrl(request.getJobUrl());
        app.setDateApplied(request.getDateApplied());

        if (request.getPriority() != null) {
            app.setPriority(ApplicationEntity.Priority.valueOf(request.getPriority()));
        }

        ApplicationEntity saved = applicationRepository.save(app);

        logActivity(appId, Activity.ActivityType.UPDATED, "Application updated");

        return new ApplicationDTO(saved);
    }

    @Transactional
    public void deleteApplication(UUID userId, UUID appId) {
        ApplicationEntity app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this application");
        }

        applicationRepository.delete(app);
    }

    @Transactional
    public ApplicationDTO updateStatus(UUID userId, UUID appId, String newStatus) {
        ApplicationEntity app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to update this application");
        }

        ApplicationEntity.Status oldStatus = app.getStatus();
        ApplicationEntity.Status status = ApplicationEntity.Status.valueOf(newStatus);
        app.setStatus(status);

        ApplicationEntity saved = applicationRepository.save(app);

        logActivity(appId, Activity.ActivityType.STATUS_CHANGED,
                String.format("Status changed from %s to %s", oldStatus, status));

        return new ApplicationDTO(saved);
    }

    public void logActivity(UUID applicationId, Activity.ActivityType type, String message) {
        Activity activity = new Activity();
        activity.setApplicationId(applicationId);
        activity.setType(type);
        activity.setMessage(message);
        activityRepository.save(activity);
    }

    public ApplicationEntity getApplicationEntityById(UUID userId, UUID appId) {
        ApplicationEntity app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this application");
        }

        return app;
    }
}
