package com.apptracker.service;

import com.apptracker.dto.ApplicationDTO;
import com.apptracker.dto.CreateApplicationRequest;
import com.apptracker.dto.CsvImportResult;
import com.apptracker.model.ApplicationEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CsvImportServiceTest {

    private final UUID userId = UUID.randomUUID();
    private ApplicationService applicationService;
    private CsvImportService service;

    @BeforeEach
    void setUp() {
        applicationService = mock(ApplicationService.class);
        when(applicationService.createApplication(any(), any())).thenReturn(new ApplicationDTO());
        service = new CsvImportService(applicationService);
    }

    private CsvImportResult importCsv(String csv) {
        return service.importApplications(userId,
                new MockMultipartFile("file", "apps.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));
    }

    /** Imports a single row and returns the request handed to ApplicationService. */
    private CreateApplicationRequest importedRow(String csv) {
        assertThat(importCsv(csv).getErrors()).isEmpty();
        ArgumentCaptor<CreateApplicationRequest> captor = ArgumentCaptor.forClass(CreateApplicationRequest.class);
        verify(applicationService).createApplication(eq(userId), captor.capture());
        return captor.getValue();
    }

    @Test
    void importsAllFieldsForTheAuthenticatedUser() {
        CreateApplicationRequest request = importedRow("""
                company,role,location,job_url,date_applied,status,priority
                Acme,Engineer,Remote,https://acme.test/job,2024-03-15,interview,high
                """);

        assertThat(request.getCompany()).isEqualTo("Acme");
        assertThat(request.getRole()).isEqualTo("Engineer");
        assertThat(request.getLocation()).isEqualTo("Remote");
        assertThat(request.getJobUrl()).isEqualTo("https://acme.test/job");
        assertThat(request.getDateApplied()).isEqualTo(OffsetDateTime.of(2024, 3, 15, 0, 0, 0, 0, ZoneOffset.UTC));
        assertThat(request.getStatus()).isEqualTo("INTERVIEW");
        assertThat(request.getPriority()).isEqualTo("HIGH");
    }

    @Test
    void defaultsOptionalFields() {
        CreateApplicationRequest request = importedRow("company,role\nAcme,Engineer\n");

        assertThat(request.getStatus()).isEqualTo("APPLIED");
        assertThat(request.getPriority()).isEqualTo("MEDIUM");
        assertThat(request.getLocation()).isNull();
        assertThat(request.getDateApplied()).isCloseTo(OffsetDateTime.now(), within(1, java.time.temporal.ChronoUnit.MINUTES));
    }

    @ParameterizedTest
    @ValueSource(strings = {"role", "position", "job_title", "title", "ROLE"})
    void acceptsRoleHeaderAliasesInAnyCase(String header) {
        assertThat(importedRow("Company," + header + "\nAcme,Engineer\n").getRole()).isEqualTo("Engineer");
    }

    @Test
    void trimsWhitespaceAroundValues() {
        CreateApplicationRequest request = importedRow("company,role\n  Acme  ,  Engineer  \n");
        assertThat(request.getCompany()).isEqualTo("Acme");
        assertThat(request.getRole()).isEqualTo("Engineer");
    }

    @Test
    void handlesQuotedCommas() {
        assertThat(importedRow("company,role\n\"Acme, Inc\",Engineer\n").getCompany()).isEqualTo("Acme, Inc");
    }

    @ParameterizedTest
    @CsvSource({
            "2024-03-15, 2024, 3, 15",
            "03/15/2024, 2024, 3, 15",
            "15/03/2024, 2024, 3, 15", // day can't be a month, so falls through to dd/MM
            "01/02/2024, 2024, 1, 2", // ambiguous dates are read as US month-first
            "3/4/2024, 2024, 3, 4"
    })
    void parsesSupportedDateFormats(String date, int year, int month, int day) {
        OffsetDateTime parsed = importedRow("company,role,date\nAcme,Engineer," + date + "\n").getDateApplied();
        assertThat(parsed).isEqualTo(OffsetDateTime.of(year, month, day, 0, 0, 0, 0, ZoneOffset.UTC));
    }

    @Test
    void unparseableDateFallsBackToNow() {
        OffsetDateTime parsed = importedRow("company,role,date\nAcme,Engineer,not-a-date\n").getDateApplied();
        assertThat(parsed).isCloseTo(OffsetDateTime.now(), within(1, java.time.temporal.ChronoUnit.MINUTES));
    }

    @ParameterizedTest
    @CsvSource({
            "applied, APPLIED",
            "Application Submitted, APPLIED",
            "Phone Screen, INTERVIEW",
            "interviewing, INTERVIEW",
            "Offer Received, OFFER",
            "Not Selected, REJECTED",
            "declined, REJECTED",
            "saved, SAVED",
            "oa, OA",
            "something else, APPLIED"
    })
    void normalizesStatuses(String input, String expected) {
        assertThat(importedRow("company,role,status\nAcme,Engineer," + input + "\n").getStatus()).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({"accepted, ACCEPTED", "hired, ACCEPTED", "withdrawn, REJECTED", "cancelled, REJECTED"})
    void statusesWithNoExactMatchMapToTheClosestOne(String input, String expected) {
        String status = importedRow("company,role,status\nAcme,Engineer," + input + "\n").getStatus();
        assertThat(status).isEqualTo(expected);
        assertThatCode(() -> ApplicationEntity.Status.valueOf(status)).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @CsvSource({"l, LOW", "1, LOW", "med, MEDIUM", "2, MEDIUM", "H, HIGH", "3, HIGH", "urgent, MEDIUM"})
    void normalizesPriorities(String input, String expected) {
        assertThat(importedRow("company,role,priority\nAcme,Engineer," + input + "\n").getPriority()).isEqualTo(expected);
    }

    @Test
    void reportsBadRowsWithTheirFileLineAndKeepsImportingTheRest() {
        CsvImportResult result = importCsv("""
                company,role
                Acme,Engineer
                ,Engineer
                Acme,
                Globex,Analyst
                """);

        assertThat(result.getSuccessCount()).isEqualTo(2);
        assertThat(result.getErrorCount()).isEqualTo(2);
        assertThat(result.getTotalProcessed()).isEqualTo(4);
        assertThat(result.getErrors().get(0).getRowNumber()).isEqualTo(3);
        assertThat(result.getErrors().get(0).getMessage()).contains("Company");
        assertThat(result.getErrors().get(1).getRowNumber()).isEqualTo(4);
        assertThat(result.getErrors().get(1).getMessage()).contains("Role");
    }

    @Test
    void reportsMissingRequiredColumnOnEveryRow() {
        CsvImportResult result = importCsv("name,title\nAcme,Engineer\n");
        assertThat(result.getSuccessCount()).isZero();
        assertThat(result.getErrorCount()).isEqualTo(1);
        verify(applicationService, never()).createApplication(any(), any());
    }

    @Test
    void reportsServiceFailureAsARowError() {
        when(applicationService.createApplication(any(), any())).thenThrow(new IllegalStateException("db down"));
        CsvImportResult result = importCsv("company,role\nAcme,Engineer\n");
        assertThat(result.getSuccessCount()).isZero();
        assertThat(result.getErrors().get(0).getMessage()).isEqualTo("db down");
    }

    @Test
    void reportsUnparseableFileAsRowZero() {
        // An unterminated quote makes commons-csv fail part-way through the file.
        CsvImportResult result = importCsv("company,role\n\"Acme,Engineer\n");
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).getRowNumber()).isZero();
        assertThat(result.getErrors().get(0).getMessage()).startsWith("Failed to parse CSV file");
    }

    @Test
    void headerOnlyFileImportsNothing() {
        CsvImportResult result = importCsv("company,role\n");
        assertThat(result.getTotalProcessed()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"2024-03-15T10:30:00Z", "2024-03-15T10:30:00", "2024-03-15T12:30:00+02:00"})
    void keepsTheTimeOfFullTimestamps(String timestamp) {
        OffsetDateTime parsed = importedRow("company,role,date\nAcme,Engineer," + timestamp + "\n").getDateApplied();
        assertThat(parsed).isAtSameInstantAs(OffsetDateTime.of(2024, 3, 15, 10, 30, 0, 0, ZoneOffset.UTC));
    }

    @ParameterizedTest
    @ValueSource(strings = {"javascript:alert(1)", "data:text/html,x", "acme.test/jobs"})
    void rejectsRowsWithNonHttpJobUrls(String url) {
        CsvImportResult result = importCsv("company,role,job_url\nAcme,Engineer," + url + "\n");
        assertThat(result.getSuccessCount()).isZero();
        assertThat(result.getErrors().get(0).getMessage()).contains("Job URL");
    }
}
