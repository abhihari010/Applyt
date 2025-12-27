package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.BadRequestException;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.*;
import com.apptracker.repository.*;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;
    PhoneNumberUtil phoneNumberUtl = PhoneNumberUtil.getInstance();

    public ContactService(ContactRepository contactRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository) {
        this.contactRepository = contactRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public Contact createContact(UUID userId, UUID appId, CreateContactRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            try {
                PhoneNumber phoneNumber = phoneNumberUtl.parse(request.getPhone(), "US");
                if (!phoneNumberUtl.isValidNumber(phoneNumber)) {
                    throw new BadRequestException("Invalid phone number");
                }
            } catch (Exception e) {
                throw new BadRequestException("Invalid phone number format");
            }
        }

        Contact contact = new Contact();
        contact.setApplicationId(appId);
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setLinkedinUrl(request.getLinkedinUrl());
        contact.setPhone(request.getPhone());
        contact.setNotes(request.getNotes());

        Contact saved = contactRepository.save(contact);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.CONTACT_ADDED);
        activity.setMessage("Contact added: " + request.getName());
        activityRepository.save(activity);

        return saved;
    }

    public List<Contact> getContacts(UUID userId, UUID appId) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        return contactRepository.findByApplicationIdOrderByCreatedAtDesc(appId);
    }

    public void deleteContact(UUID userId, UUID appId, UUID contactId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        contactRepository.delete(contact);
    }
}