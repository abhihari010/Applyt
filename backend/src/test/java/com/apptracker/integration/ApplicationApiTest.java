package com.apptracker.integration;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Reminder;
import com.apptracker.model.User;
import com.apptracker.repository.NoteRepository;
import com.apptracker.repository.ReminderRepository;
import com.apptracker.service.R2StorageService;
import com.apptracker.dto.OpenJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApplicationApiTest extends IntegrationTestBase {

    @Autowired ReminderRepository reminders;
    @Autowired NoteRepository notes;

    private User user;

    @BeforeEach
    void setUp() {
        user = verifiedUser();
    }

    private String base(ApplicationEntity app) {
        return "/api/apps/" + app.getId();
    }

    private ApplicationEntity app(String company, String role, ApplicationEntity.Status status) {
        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(user.getId());
        app.setCompany(company);
        app.setRole(role);
        app.setStatus(status);
        return applications.save(app);
    }

    // Create, read, update, delete

    @Test
    void createAppliesDefaultsAndLogsActivity() throws Exception {
        String response = mvc.perform(withJson(as(user, post("/api/apps")), Map.of("company", "Acme", "role", "Engineer")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Acme"))
                .andExpect(jsonPath("$.status").value("SAVED"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"))
                .andReturn().getResponse().getContentAsString();

        UUID id = UUID.fromString(json.readTree(response).get("id").asText());
        assertThat(applications.findById(id).orElseThrow().getUserId()).isEqualTo(user.getId());
        mvc.perform(as(user, get("/api/apps/" + id + "/activity")))
                .andExpect(jsonPath("$[0].activityType").value("CREATED"))
                .andExpect(jsonPath("$[0].message").value(containsString("Engineer at Acme")));
    }

    @Test
    void createIgnoresAnyOwnerSentByTheClient() throws Exception {
        UUID someoneElse = verifiedUser().getId();
        String response = mvc.perform(withJson(as(user, post("/api/apps")),
                Map.of("company", "Acme", "role", "Engineer", "userId", someoneElse.toString())))
                .andReturn().getResponse().getContentAsString();

        UUID id = UUID.fromString(json.readTree(response).get("id").asText());
        assertThat(applications.findById(id).orElseThrow().getUserId()).isEqualTo(user.getId());
    }

    @Test
    void createWithoutRequiredFieldsIsRejected() throws Exception {
        mvc.perform(withJson(as(user, post("/api/apps")), Map.of("role", "Engineer")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithUnknownStatusIsABadRequest() throws Exception {
        mvc.perform(withJson(as(user, post("/api/apps")), Map.of("company", "A", "role", "B", "status", "NOPE")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"javascript:alert(1)", "data:text/html,x", "file:///etc/passwd", "ftp://example.com/a"})
    void createRejectsNonHttpJobUrls(String jobUrl) throws Exception {
        mvc.perform(withJson(as(user, post("/api/apps")), Map.of("company", "A", "role", "B", "jobUrl", jobUrl)))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"https://acme.test/jobs/1", "http://acme.test", ""})
    void createAcceptsHttpOrEmptyJobUrls(String jobUrl) throws Exception {
        mvc.perform(withJson(as(user, post("/api/apps")), Map.of("company", "A", "role", "B", "jobUrl", jobUrl)))
                .andExpect(status().isOk());
    }

    @Test
    void getReturnsTheApplication() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(as(user, get(base(app))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(app.getId().toString()))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void updateReplacesFieldsAndLogsActivity() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        mvc.perform(withJson(as(user, put(base(app))), Map.of(
                "company", "Globex", "role", "Lead", "location", "Remote", "status", "OA", "priority", "HIGH")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Globex"))
                .andExpect(jsonPath("$.role").value("Lead"))
                .andExpect(jsonPath("$.location").value("Remote"))
                .andExpect(jsonPath("$.status").value("OA"))
                .andExpect(jsonPath("$.priority").value("HIGH"));

        mvc.perform(as(user, get(base(app) + "/activity"))).andExpect(jsonPath("$[0].activityType").value("UPDATED"));
    }

    @Test
    void statusChangeIsSavedAndRecordsOldAndNewValues() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        mvc.perform(withJson(as(user, patch(base(app) + "/status")), Map.of("status", "INTERVIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        mvc.perform(as(user, get(base(app) + "/activity")))
                .andExpect(jsonPath("$[0].activityType").value("STATUS_CHANGED"))
                .andExpect(jsonPath("$[0].message").value("Status changed from APPLIED to INTERVIEW"));
    }

    @Test
    void deleteRemovesTheApplicationAndItsChildren() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        String noteResponse = mvc.perform(withJson(as(user, post(base(app) + "/notes")), Map.of("content", "hi")))
                .andReturn().getResponse().getContentAsString();
        UUID noteId = UUID.fromString(json.readTree(noteResponse).get("id").asText());

        mvc.perform(as(user, delete(base(app)))).andExpect(status().isNoContent());

        mvc.perform(as(user, get(base(app)))).andExpect(status().isNotFound());
        assertThat(notes.existsById(noteId)).isFalse();
    }

    // Listing

    private ResultActions list(String query) throws Exception {
        return mvc.perform(as(user, get("/api/apps" + query)));
    }

    @Test
    void listFiltersByStatus() throws Exception {
        app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        app("Globex", "Analyst", ApplicationEntity.Status.OFFER);

        list("?status=OFFER")
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].company").value("Globex"));
    }

    @Test
    void listSearchesCompanyAndRoleIgnoringCase() throws Exception {
        app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        app("Globex", "Analyst", ApplicationEntity.Status.APPLIED);

        list("?q=ACM").andExpect(jsonPath("$.totalElements").value(1));
        list("?q=analy").andExpect(jsonPath("$.content[0].company").value("Globex"));
        list("?q=nothing").andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void listFiltersByDateRange() throws Exception {
        ApplicationEntity january = app("January", "Engineer", ApplicationEntity.Status.APPLIED);
        january.setDateApplied(OffsetDateTime.parse("2024-01-15T00:00:00Z"));
        applications.save(january);
        ApplicationEntity march = app("March", "Engineer", ApplicationEntity.Status.APPLIED);
        march.setDateApplied(OffsetDateTime.parse("2024-03-15T00:00:00Z"));
        applications.save(march);

        list("?from=2024-02-01T00:00:00Z").andExpect(jsonPath("$.content[0].company").value("March"))
                .andExpect(jsonPath("$.totalElements").value(1));
        list("?to=2024-02-01T00:00:00Z").andExpect(jsonPath("$.content[0].company").value("January"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void listHidesArchivedApplications() throws Exception {
        ApplicationEntity archived = app("Old", "Engineer", ApplicationEntity.Status.REJECTED);
        archived.setArchived(true);
        applications.save(archived);

        list("").andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void listPaginates() throws Exception {
        for (int i = 0; i < 3; i++) {
            app("Company " + i, "Engineer", ApplicationEntity.Status.APPLIED);
        }

        list("?size=2&page=0")
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));
        list("?size=2&page=1").andExpect(jsonPath("$.content.length()").value(1));
    }

    // Notes

    @Test
    void notesCanBeAddedListedAndDeleted() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        String created = mvc.perform(withJson(as(user, post(base(app) + "/notes")), Map.of("content", "Spoke to recruiter")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Spoke to recruiter"))
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(created).get("id").asText();

        mvc.perform(as(user, get(base(app) + "/notes"))).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(as(user, get(base(app) + "/activity"))).andExpect(jsonPath("$[0].activityType").value("NOTE_ADDED"));

        mvc.perform(as(user, delete(base(app) + "/notes/" + id))).andExpect(status().isNoContent());
        mvc.perform(as(user, get(base(app) + "/notes"))).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deletingAMissingNoteIsNotFound() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(as(user, delete(base(app) + "/notes/" + UUID.randomUUID()))).andExpect(status().isNotFound());
    }

    // Contacts

    @Test
    void contactsCanBeAddedListedAndDeleted() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        String created = mvc.perform(withJson(as(user, post(base(app) + "/contacts")),
                Map.of("name", "Riley", "email", "riley@acme.test", "phone", "+1 650-253-0000")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Riley"))
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(created).get("id").asText();

        mvc.perform(as(user, get(base(app) + "/contacts"))).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(as(user, delete(base(app) + "/contacts/" + id))).andExpect(status().isNoContent());
        mvc.perform(as(user, get(base(app) + "/contacts"))).andExpect(jsonPath("$.length()").value(0));
    }

    @ParameterizedTest
    @ValueSource(strings = {"123", "not a phone", "+1 000-000-0000"})
    void contactWithAnInvalidPhoneIsRejected(String phone) throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, post(base(app) + "/contacts")), Map.of("name", "Riley", "phone", phone)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void contactWithoutAPhoneIsAccepted() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, post(base(app) + "/contacts")), Map.of("name", "Riley")))
                .andExpect(status().isOk());
    }

    // Reminders

    @Test
    void remindersCanBeAddedCompletedAndDeleted() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        String created = mvc.perform(withJson(as(user, post(base(app) + "/reminders")),
                Map.of("remindAt", "2030-01-01T09:00:00Z", "message", "Follow up")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(false))
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(created).get("id").asText();

        mvc.perform(as(user, get("/api/reminders/all"))).andExpect(jsonPath("$.length()").value(1));

        mvc.perform(as(user, patch("/api/reminders/" + id + "/complete")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
        mvc.perform(as(user, get("/api/reminders/all"))).andExpect(jsonPath("$.length()").value(0));

        mvc.perform(as(user, delete(base(app) + "/reminders/" + id))).andExpect(status().isNoContent());
        mvc.perform(as(user, get(base(app) + "/reminders"))).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void reminderWithoutADateIsRejected() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, post(base(app) + "/reminders")), Map.of("message", "Follow up")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Reminder date is required")));
    }

    @Test
    void dueRemindersRespectTheDaysWindow() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        Reminder soon = new Reminder();
        soon.setApplicationId(app.getId());
        soon.setRemindAt(OffsetDateTime.now().plusDays(2));
        soon.setMessage("soon");
        reminders.save(soon);
        Reminder later = new Reminder();
        later.setApplicationId(app.getId());
        later.setRemindAt(OffsetDateTime.now().plusDays(30));
        later.setMessage("later");
        reminders.save(later);

        mvc.perform(as(user, get("/api/reminders/due")))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].message").value("soon"));
        mvc.perform(as(user, get("/api/reminders/due").param("days", "60")))
                .andExpect(jsonPath("$.length()").value(2));
    }

    // Attachments

    private Map<String, Object> presignBody(String contentType, long size) {
        return Map.of("fileName", "cv.pdf", "contentType", contentType, "sizeBytes", size);
    }

    @Test
    void presignReturnsTheUploadUrlForAnAllowedFile() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        when(r2.generatePresignedUploadUrl(eq(user.getId()), eq(app.getId()), eq("cv.pdf"), eq("application/pdf")))
                .thenReturn(new R2StorageService.PresignedUploadUrl("https://r2.test/upload", "key", 123L));

        mvc.perform(withJson(as(user, post(base(app) + "/attachments/presign")), presignBody("application/pdf", 1024)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadUrl").value("https://r2.test/upload"))
                .andExpect(jsonPath("$.objectKey").value("key"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"application/x-msdownload", "text/html", "image/svg+xml"})
    void presignRejectsDisallowedFileTypes(String contentType) throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, post(base(app) + "/attachments/presign")), presignBody(contentType, 1024)))
                .andExpect(status().isBadRequest());
        verify(r2, never()).generatePresignedUploadUrl(any(), any(), any(), any());
    }

    @Test
    void presignEnforcesTheSizeLimitBoundary() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        when(r2.generatePresignedUploadUrl(any(), any(), any(), any()))
                .thenReturn(new R2StorageService.PresignedUploadUrl("u", "k", 1L));

        mvc.perform(withJson(as(user, post(base(app) + "/attachments/presign")),
                presignBody("application/pdf", R2StorageService.MAX_FILE_SIZE)))
                .andExpect(status().isOk());
        mvc.perform(withJson(as(user, post(base(app) + "/attachments/presign")),
                presignBody("application/pdf", R2StorageService.MAX_FILE_SIZE + 1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void attachmentCanBeConfirmedDownloadedAndDeleted() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);

        String key = "users/" + user.getId() + "/apps/" + app.getId() + "/abc_cv.pdf";
        String created = mvc.perform(withJson(as(user, post(base(app) + "/attachments/confirm")), Map.of(
                "objectKey", key, "fileName", "cv.pdf",
                "contentType", "application/pdf", "sizeBytes", 1024)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(created).get("id").asText();

        mvc.perform(as(user, get(base(app) + "/attachments"))).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(as(user, get(base(app) + "/activity"))).andExpect(jsonPath("$[0].activityType").value("FILE_UPLOADED"));

        when(r2.generatePresignedDownloadUrl(key)).thenReturn("https://r2.test/download");
        mvc.perform(as(user, get("/api/attachments/" + id + "/download-url")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.downloadUrl").value("https://r2.test/download"));

        mvc.perform(as(user, delete(base(app) + "/attachments/" + id))).andExpect(status().isNoContent());
        verify(r2).deleteObject(key);
        mvc.perform(as(user, get(base(app) + "/attachments"))).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(as(user, get(base(app) + "/activity"))).andExpect(jsonPath("$[0].activityType").value("FILE_DELETED"));
    }

    // URL import

    @Test
    void importWithAnUnsafeUrlReturnsAWarning() throws Exception {
        mvc.perform(withJson(as(user, post("/api/apps/import")), Map.of("externalSource", "http://localhost/admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warnings[0]").value("Invalid or unsafe URL"));
    }

    // CSV import

    private ResultActions uploadCsv(String filename, String content) throws Exception {
        return mvc.perform(as(user, multipart("/api/applications/import/csv")
                .file(new MockMultipartFile("file", filename, "text/csv", content.getBytes(StandardCharsets.UTF_8)))));
    }

    @Test
    void csvImportAcceptsTheStatusesThatUsedToFail() throws Exception {
        uploadCsv("apps.csv", "company,role,status\nAcme,Engineer,Hired\nGlobex,Analyst,Withdrawn\n")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successCount").value(2));
    }

    @Test
    void csvImportCreatesApplicationsForTheCaller() throws Exception {
        uploadCsv("apps.csv", "company,role,status\nAcme,Engineer,applied\nGlobex,Analyst,offer\n")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successCount").value(2))
                .andExpect(jsonPath("$.errorCount").value(0));

        list("").andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void csvImportWithSomeBadRowsIsPartialContent() throws Exception {
        uploadCsv("apps.csv", "company,role\nAcme,Engineer\n,Missing\n")
                .andExpect(status().isPartialContent())
                .andExpect(jsonPath("$.successCount").value(1))
                .andExpect(jsonPath("$.errors[0].rowNumber").value(3));
    }

    @Test
    void csvImportWithOnlyBadRowsIsABadRequest() throws Exception {
        uploadCsv("apps.csv", "company,role\n,Missing\n").andExpect(status().isBadRequest());
    }

    @Test
    void csvImportRejectsEmptyOrNonCsvFiles() throws Exception {
        uploadCsv("apps.csv", "").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("File is empty"));
        uploadCsv("apps.exe", "company,role\n").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Only CSV files are supported"));
    }

    @Test
    void csvImportRejectsFilesOverFiveMegabytes() throws Exception {
        char[] filler = new char[5 * 1024 * 1024 + 1];
        java.util.Arrays.fill(filler, 'x');
        uploadCsv("apps.csv", new String(filler)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("File size exceeds 5MB limit"));
    }

    // Public job board

    private List<OpenJob> jobs(int count) {
        return Collections.nCopies(count, new OpenJob());
    }

    @Test
    void openInternshipsPaginateTheCache() throws Exception {
        when(scheduledTasks.getCachedOpenJobs()).thenReturn(jobs(5));

        mvc.perform(get("/api/jobs/open-internships").param("size", "2").param("page", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(5));
    }

    @Test
    void openInternshipsPastTheLastPageAreEmpty() throws Exception {
        when(scheduledTasks.getCachedOpenJobs()).thenReturn(jobs(1));

        mvc.perform(get("/api/jobs/open-internships").param("page", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    // Analytics end to end

    @Test
    void analyticsEndpointReturnsAllSections() throws Exception {
        app("Acme", "Engineer", ApplicationEntity.Status.INTERVIEW);

        mvc.perform(as(user, get("/api/analytics")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCounts.INTERVIEW").value(1))
                .andExpect(jsonPath("$.conversionRates.appliedToInterview").value(100.0))
                .andExpect(jsonPath("$.appsPerWeek").isMap());
    }

    @Test
    void updateWithoutAStatusKeepsTheCurrentOne() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, put(base(app))), Map.of("company", "Acme", "role", "Engineer")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void statusUpdateRejectsUnknownValues() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, patch(base(app) + "/status")), Map.of("status", "NOPE")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listWithAnUnknownStatusFilterIsABadRequest() throws Exception {
        list("?status=NOPE").andExpect(status().isBadRequest());
    }

    @Test
    void notesAndContactsAreValidated() throws Exception {
        ApplicationEntity app = app("Acme", "Engineer", ApplicationEntity.Status.APPLIED);
        mvc.perform(withJson(as(user, post(base(app) + "/notes")), Map.of("content", " ")))
                .andExpect(status().isBadRequest());
        mvc.perform(withJson(as(user, post(base(app) + "/contacts")), Map.of("name", "Riley", "email", "not-an-email")))
                .andExpect(status().isBadRequest());
    }
}
