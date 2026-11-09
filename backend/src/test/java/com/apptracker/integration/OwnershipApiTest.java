package com.apptracker.integration;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Attachment;
import com.apptracker.model.Contact;
import com.apptracker.model.Note;
import com.apptracker.model.Reminder;
import com.apptracker.model.User;
import com.apptracker.repository.AttachmentRepository;
import com.apptracker.repository.ContactRepository;
import com.apptracker.repository.NoteRepository;
import com.apptracker.repository.ReminderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** One user must never be able to read or change another user's data. */
class OwnershipApiTest extends IntegrationTestBase {

    @Autowired NoteRepository notes;
    @Autowired ContactRepository contacts;
    @Autowired ReminderRepository reminders;
    @Autowired AttachmentRepository attachments;

    private User attacker;
    private ApplicationEntity attackerApp;
    private ApplicationEntity victimApp;
    private Note victimNote;
    private Contact victimContact;
    private Reminder victimReminder;
    private Attachment victimAttachment;

    @BeforeEach
    void setUp() {
        attacker = verifiedUser();
        attackerApp = applicationOwnedBy(attacker);
        User victim = verifiedUser();
        victimApp = applicationOwnedBy(victim);

        victimNote = new Note();
        victimNote.setApplicationId(victimApp.getId());
        victimNote.setContent("private note");
        notes.save(victimNote);

        victimContact = new Contact();
        victimContact.setApplicationId(victimApp.getId());
        victimContact.setName("Recruiter");
        contacts.save(victimContact);

        victimReminder = new Reminder();
        victimReminder.setApplicationId(victimApp.getId());
        victimReminder.setRemindAt(OffsetDateTime.now().plusDays(1));
        victimReminder.setMessage("private reminder");
        reminders.save(victimReminder);

        victimAttachment = new Attachment();
        victimAttachment.setApplicationId(victimApp.getId());
        victimAttachment.setObjectKey("users/" + victim.getId() + "/resume.pdf");
        victimAttachment.setFileName("resume.pdf");
        victimAttachment.setContentType("application/pdf");
        victimAttachment.setSizeBytes(1L);
        attachments.save(victimAttachment);
    }

    private Map<String, Object> validApplication() {
        return Map.of("company", "Hacked", "role", "Hacked", "status", "OFFER");
    }

    // Requests aimed directly at the victim's application

    @Test
    void cannotReadAnotherUsersApplicationOrItsChildren() throws Exception {
        String base = "/api/apps/" + victimApp.getId();
        for (String path : new String[] {base, base + "/notes", base + "/contacts", base + "/reminders",
                base + "/attachments", base + "/activity"}) {
            mvc.perform(as(attacker, get(path))).andExpect(status().isForbidden());
        }
    }

    @Test
    void cannotChangeAnotherUsersApplication() throws Exception {
        String base = "/api/apps/" + victimApp.getId();

        mvc.perform(withJson(as(attacker, put(base)), validApplication())).andExpect(status().isForbidden());
        mvc.perform(withJson(as(attacker, patch(base + "/status")), Map.of("status", "REJECTED")))
                .andExpect(status().isForbidden());
        mvc.perform(as(attacker, delete(base))).andExpect(status().isForbidden());

        ApplicationEntity unchanged = applications.findById(victimApp.getId()).orElseThrow();
        assertThat(unchanged.getCompany()).isEqualTo("Acme");
        assertThat(unchanged.getStatus()).isEqualTo(ApplicationEntity.Status.SAVED);
    }

    @Test
    void cannotAddChildrenToAnotherUsersApplication() throws Exception {
        String base = "/api/apps/" + victimApp.getId();
        long notesBefore = notes.count();
        long contactsBefore = contacts.count();
        long remindersBefore = reminders.count();
        long attachmentsBefore = attachments.count();

        mvc.perform(withJson(as(attacker, post(base + "/notes")), Map.of("content", "spam")))
                .andExpect(status().isForbidden());
        mvc.perform(withJson(as(attacker, post(base + "/contacts")), Map.of("name", "spam")))
                .andExpect(status().isForbidden());
        mvc.perform(withJson(as(attacker, post(base + "/reminders")),
                Map.of("remindAt", "2030-01-01T00:00:00Z", "message", "spam")))
                .andExpect(status().isForbidden());
        mvc.perform(withJson(as(attacker, post(base + "/attachments/presign")),
                Map.of("fileName", "a.pdf", "contentType", "application/pdf", "sizeBytes", 1)))
                .andExpect(status().isForbidden());
        mvc.perform(withJson(as(attacker, post(base + "/attachments/confirm")),
                Map.of("objectKey", "k", "fileName", "a.pdf", "contentType", "application/pdf", "sizeBytes", 1)))
                .andExpect(status().isForbidden());

        assertThat(notes.count()).isEqualTo(notesBefore);
        assertThat(contacts.count()).isEqualTo(contactsBefore);
        assertThat(reminders.count()).isEqualTo(remindersBefore);
        assertThat(attachments.count()).isEqualTo(attachmentsBefore);
        verify(r2, never()).generatePresignedUploadUrl(any(), any(), any(), any());
    }

    @Test
    void cannotDeleteChildrenThroughTheVictimsApplicationPath() throws Exception {
        String base = "/api/apps/" + victimApp.getId();

        mvc.perform(as(attacker, delete(base + "/notes/" + victimNote.getId()))).andExpect(status().isForbidden());
        mvc.perform(as(attacker, delete(base + "/contacts/" + victimContact.getId()))).andExpect(status().isForbidden());
        mvc.perform(as(attacker, delete(base + "/reminders/" + victimReminder.getId()))).andExpect(status().isForbidden());
        mvc.perform(as(attacker, delete(base + "/attachments/" + victimAttachment.getId()))).andExpect(status().isForbidden());

        assertThat(notes.existsById(victimNote.getId())).isTrue();
        assertThat(contacts.existsById(victimContact.getId())).isTrue();
        assertThat(reminders.existsById(victimReminder.getId())).isTrue();
        assertThat(attachments.existsById(victimAttachment.getId())).isTrue();
    }

    @Test
    void cannotDownloadOrCompleteAnotherUsersItems() throws Exception {
        mvc.perform(as(attacker, get("/api/attachments/" + victimAttachment.getId() + "/download-url")))
                .andExpect(status().isForbidden());
        verify(r2, never()).generatePresignedDownloadUrl(any());

        mvc.perform(as(attacker, patch("/api/reminders/" + victimReminder.getId() + "/complete")))
                .andExpect(status().isForbidden());
        assertThat(reminders.findById(victimReminder.getId()).orElseThrow().isCompleted()).isFalse();
    }

    // Lists scoped to the caller

    @Test
    void listsOnlyContainTheCallersOwnData() throws Exception {
        mvc.perform(as(attacker, get("/api/apps")))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(attackerApp.getId().toString()));
        mvc.perform(as(attacker, get("/api/reminders/all"))).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(as(attacker, get("/api/reminders/due"))).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void analyticsOnlyCountTheCallersApplications() throws Exception {
        mvc.perform(as(attacker, get("/api/analytics")))
                .andExpect(jsonPath("$.statusCounts.SAVED").value(1));
    }

    @Test
    void unknownIdsGiveNotFoundRatherThanForbidden() throws Exception {
        mvc.perform(as(attacker, get("/api/apps/" + UUID.randomUUID()))).andExpect(status().isNotFound());
    }

    // Requests that pass the ownership check using the attacker's own application

    @Test
    void cannotDeleteAnotherUsersNoteThroughOwnApplication() throws Exception {
        mvc.perform(as(attacker, delete("/api/apps/" + attackerApp.getId() + "/notes/" + victimNote.getId())))
                .andExpect(status().isNotFound());
        assertThat(notes.existsById(victimNote.getId())).isTrue();
    }

    @Test
    void cannotDeleteAnotherUsersContactThroughOwnApplication() throws Exception {
        mvc.perform(as(attacker, delete("/api/apps/" + attackerApp.getId() + "/contacts/" + victimContact.getId())))
                .andExpect(status().isNotFound());
        assertThat(contacts.existsById(victimContact.getId())).isTrue();
    }

    @Test
    void cannotDeleteAnotherUsersReminderThroughOwnApplication() throws Exception {
        mvc.perform(as(attacker, delete("/api/apps/" + attackerApp.getId() + "/reminders/" + victimReminder.getId())))
                .andExpect(status().isNotFound());
        assertThat(reminders.existsById(victimReminder.getId())).isTrue();
    }

    @Test
    void cannotDeleteAnotherUsersAttachmentThroughOwnApplication() throws Exception {
        mvc.perform(as(attacker, delete("/api/apps/" + attackerApp.getId() + "/attachments/" + victimAttachment.getId())))
                .andExpect(status().isNotFound());
        assertThat(attachments.existsById(victimAttachment.getId())).isTrue();
        verify(r2, never()).deleteObject(any());
    }

    @Test
    void cannotAttachAnObjectKeyFromAnotherUsersFolder() throws Exception {
        mvc.perform(withJson(as(attacker, post("/api/apps/" + attackerApp.getId() + "/attachments/confirm")),
                Map.of("objectKey", victimAttachment.getObjectKey(), "fileName", "stolen.pdf",
                        "contentType", "application/pdf", "sizeBytes", 1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cannotEscapeTheApplicationFolderWithPathTraversal() throws Exception {
        String ownPrefix = "users/" + attacker.getId() + "/apps/" + attackerApp.getId() + "/";
        mvc.perform(withJson(as(attacker, post("/api/apps/" + attackerApp.getId() + "/attachments/confirm")),
                Map.of("objectKey", ownPrefix + "../../../" + victimAttachment.getObjectKey(), "fileName", "stolen.pdf",
                        "contentType", "application/pdf", "sizeBytes", 1)))
                .andExpect(status().isBadRequest());
    }
}
