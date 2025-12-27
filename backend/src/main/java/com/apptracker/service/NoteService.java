package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.exception.ResourceNotFoundException;
import com.apptracker.model.Note;
import com.apptracker.model.Activity;
import com.apptracker.repository.NoteRepository;
import com.apptracker.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;

    public NoteService(NoteRepository noteRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository) {
        this.noteRepository = noteRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public Note createNote(UUID userId, UUID appId, CreateNoteRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        Note note = new Note();
        note.setApplicationId(appId);
        note.setContent(request.getContent());

        Note saved = noteRepository.save(note);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.NOTE_ADDED);
        activity.setMessage("Note added");
        activityRepository.save(activity);

        return saved;
    }

    public List<Note> getNotes(UUID userId, UUID appId) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        return noteRepository.findByApplicationIdOrderByCreatedAtDesc(appId);
    }

    public void deleteNote(UUID userId, UUID appId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        noteRepository.delete(note);
    }
}
