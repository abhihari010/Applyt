package com.apptracker.service;

import com.apptracker.dto.OpenJob;
import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.ApplicationEntity.Status;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.UserRepository;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ScheduledTaskServiceTest {

    private final ApplicationRepository applications = mock(ApplicationRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    // The constructor makes no network call. Only the @PostConstruct does, and Spring isn't involved here.
    private final ScheduledTaskService service = new ScheduledTaskService(applications, users);

    private User userWithAutoArchive(boolean enabled) {
        User user = new User();
        user.setAutoArchiveOldApps(enabled);
        when(users.findAll()).thenReturn(List.of(user));
        return user;
    }

    private ApplicationEntity app(User owner, Status status, int daysSinceUpdate) {
        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(owner.getId());
        app.setStatus(status);
        app.setUpdatedAt(OffsetDateTime.now().minusDays(daysSinceUpdate));
        return app;
    }

    @Test
    void archivesRejectedApplicationsOlderThanThirtyDays() {
        User user = userWithAutoArchive(true);
        ApplicationEntity old = app(user, Status.REJECTED, 31);
        when(applications.findAll()).thenReturn(List.of(old));

        service.autoArchiveOldRejectedApplications();

        assertThat(old.isArchived()).isTrue();
        verify(applications).save(old);
    }

    @Test
    void leavesRecentOrActiveApplicationsAlone() {
        User user = userWithAutoArchive(true);
        ApplicationEntity recentRejection = app(user, Status.REJECTED, 29);
        ApplicationEntity oldButActive = app(user, Status.INTERVIEW, 90);
        when(applications.findAll()).thenReturn(List.of(recentRejection, oldButActive));

        service.autoArchiveOldRejectedApplications();

        assertThat(recentRejection.isArchived()).isFalse();
        assertThat(oldButActive.isArchived()).isFalse();
        verify(applications, never()).save(any());
    }

    @Test
    void doesNotArchiveForUsersWithThePreferenceOff() {
        User user = userWithAutoArchive(false);
        ApplicationEntity old = app(user, Status.REJECTED, 90);
        when(applications.findAll()).thenReturn(List.of(old));

        service.autoArchiveOldRejectedApplications();

        assertThat(old.isArchived()).isFalse();
    }

    @Test
    void removesOnlyUnverifiedUsersPastTheSevenDayCutoff() {
        List<User> stale = List.of(new User());
        when(users.findByEmailVerifiedFalseAndCreatedAtBefore(any())).thenAnswer(call -> {
            OffsetDateTime cutoff = call.getArgument(0);
            assertThat(cutoff).isBetween(OffsetDateTime.now().minusDays(7).minusMinutes(1),
                    OffsetDateTime.now().minusDays(7).plusMinutes(1));
            return stale;
        });

        service.removeUnverifiedUsers();

        verify(users).deleteAll(stale);
    }

    @Test
    void cachedJobsStartEmptyAndCannotBeMutatedByCallers() {
        assertThat(service.getCachedOpenJobs()).isEmpty();
        service.getCachedOpenJobs().add(new OpenJob());
        assertThat(service.getCachedOpenJobs()).isEmpty();
    }

    private List<OpenJob> parse(String markdown) {
        return ReflectionTestUtils.invokeMethod(service, "parseMarkdownTable", markdown);
    }

    private static String row(String company, String role, String location, String link, String date) {
        return String.format("| %s | %s | %s | %s | %s |", company, role, location, link, date);
    }

    @Test
    void parsesAnHtmlLinkRow() {
        List<OpenJob> jobs = parse(row("<strong>Acme</strong>", "SWE Intern", "NYC<br>Remote",
                "<a href=\"https://acme.test/apply\">Apply</a>", "Jan 5"));

        assertThat(jobs).hasSize(1);
        OpenJob job = jobs.get(0);
        assertThat(job.getCompany()).isEqualTo("Acme");
        assertThat(job.getRole()).isEqualTo("SWE Intern");
        assertThat(job.getLocation()).isEqualTo("NYC, Remote");
        assertThat(job.getJobUrl()).isEqualTo("https://acme.test/apply");
        assertThat(job.getDatePosted().getMonthValue()).isEqualTo(1);
        assertThat(job.getDatePosted().getDayOfMonth()).isEqualTo(5);
    }

    @Test
    void parsesAMarkdownLinkRow() {
        assertThat(parse(row("Acme", "SWE Intern", "NYC", "[Apply](https://acme.test/apply)", "Jan 5")).get(0).getJobUrl())
                .isEqualTo("https://acme.test/apply");
    }

    @Test
    void skipsHeaderSeparatorAndNonTableLines() {
        String markdown = """
                # Summer Internships
                | Company | Role | Location | Application | Date |
                | --- | --- | --- | --- | --- |
                Some prose.
                """;
        assertThat(parse(markdown)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "| Acme | SWE Intern | NYC | no link here | Jan 5 |", // no URL
            "| ↳ | SWE Intern | NYC | <a href=\"https://x.test\">Apply</a> | Jan 5 |", // continuation arrow, no name
            "| Acme | SWE Intern | **NYC** | <a href=\"https://x.test\">Apply</a> | Jan 5 |", // markdown artifact
            "| Acme | SWE Intern | 6 locations | <a href=\"https://x.test\">Apply</a> | Jan 5 |", // collapsed count
            "| Acme | SWE Intern | NYC |" // too few cells
    })
    void dropsRowsWithoutUsableData(String line) {
        assertThat(parse(line)).isEmpty();
    }

    @Test
    void unparseableDateStillKeepsTheJob() {
        List<OpenJob> jobs = parse(row("Acme", "SWE Intern", "NYC", "<a href=\"https://x.test\">Apply</a>", "Soon"));
        assertThat(jobs).hasSize(1);
        assertThat(jobs.get(0).getDatePosted()).isNull();
    }

    private static String monthName(int month) {
        return java.time.Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }

    @Test
    void dateInTheCurrentMonthIsThisYear() {
        OffsetDateTime now = OffsetDateTime.now();
        List<OpenJob> jobs = parse(row("Acme", "SWE Intern", "NYC", "<a href=\"https://x.test\">Apply</a>",
                monthName(now.getMonthValue()) + " 1"));
        assertThat(jobs.get(0).getDatePosted().getYear()).isEqualTo(now.getYear());
    }

    @Test
    void dateInALaterMonthIsLastYear() {
        OffsetDateTime now = OffsetDateTime.now();
        Assumptions.assumeTrue(now.getMonthValue() < 12, "No later month exists in December");
        List<OpenJob> jobs = parse(row("Acme", "SWE Intern", "NYC", "<a href=\"https://x.test\">Apply</a>",
                monthName(now.getMonthValue() + 1) + " 1"));
        assertThat(jobs.get(0).getDatePosted().getYear()).isEqualTo(now.getYear() - 1);
    }

    @Test
    void keepsPostingsWhoseTextContainsCompanyOrRole() {
        assertThat(parse(row("Ford Motor Company", "SWE Intern", "Detroit",
                "<a href=\"https://ford.test\">Apply</a>", "Jan 5"))).hasSize(1);
    }
}
