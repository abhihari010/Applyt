package com.apptracker.service;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.ApplicationEntity.Status;
import com.apptracker.repository.ApplicationRepository;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnalyticsServiceTest {

    private final UUID userId = UUID.randomUUID();
    private final ApplicationRepository repository = mock(ApplicationRepository.class);
    private final AnalyticsService service = new AnalyticsService(repository);

    private ApplicationEntity app(UUID owner, Status status, OffsetDateTime dateApplied) {
        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(owner);
        app.setStatus(status);
        app.setDateApplied(dateApplied);
        return app;
    }

    private List<ApplicationEntity> apps(Status status, int count) {
        return new ArrayList<>(Collections.nCopies(count, app(userId, status, null)));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Long> statusCounts(Map<String, Object> analytics) {
        return (Map<String, Long>) analytics.get("statusCounts");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> rates(Map<String, Object> analytics) {
        return (Map<String, Double>) analytics.get("conversionRates");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Long> weeks(Map<String, Object> analytics) {
        return (Map<String, Long>) analytics.get("appsPerWeek");
    }

    @Test
    void onlyCountsTheRequestingUsersApplications() {
        when(repository.findAll()).thenReturn(List.of(
                app(userId, Status.APPLIED, null),
                app(UUID.randomUUID(), Status.APPLIED, null),
                app(UUID.randomUUID(), Status.OFFER, null)));

        Map<String, Long> counts = statusCounts(service.getAnalytics(userId));

        assertThat(counts).containsOnlyKeys("APPLIED");
        assertThat(counts.get("APPLIED")).isEqualTo(1);
    }

    @Test
    void noApplicationsGivesZeroRatesWithoutDividingByZero() {
        when(repository.findAll()).thenReturn(List.of());

        Map<String, Double> rates = rates(service.getAnalytics(userId));

        assertThat(rates.get("appliedToInterview")).isZero();
        assertThat(rates.get("interviewToOffer")).isZero();
        assertThat(rates.get("appliedToOffer")).isZero();
    }

    @Test
    void calculatesConversionRatesAcrossActiveStatuses() {
        List<ApplicationEntity> all = apps(Status.APPLIED, 5);
        all.addAll(apps(Status.OA, 1));
        all.addAll(apps(Status.INTERVIEW, 3));
        all.addAll(apps(Status.OFFER, 1));
        when(repository.findAll()).thenReturn(all);

        Map<String, Double> rates = rates(service.getAnalytics(userId));

        assertThat(rates.get("appliedToInterview")).isCloseTo(40.0, within(0.001));
        assertThat(rates.get("interviewToOffer")).isCloseTo(25.0, within(0.001));
        assertThat(rates.get("appliedToOffer")).isCloseTo(10.0, within(0.001));
    }

    @Test
    void savedApplicationsAreNotCountedAsApplied() {
        List<ApplicationEntity> all = apps(Status.SAVED, 5);
        all.addAll(apps(Status.OFFER, 1));
        when(repository.findAll()).thenReturn(all);

        assertThat(rates(service.getAnalytics(userId)).get("appliedToOffer")).isCloseTo(100.0, within(0.001));
    }

    @Test
    void returnsTwelveWeeklyBuckets() {
        when(repository.findAll()).thenReturn(List.of());
        assertThat(weeks(service.getAnalytics(userId))).hasSize(12);
    }

    @Test
    void countsApplicationsInsideTheWindowAndIgnoresOthers() {
        when(repository.findAll()).thenReturn(List.of(
                app(userId, Status.APPLIED, OffsetDateTime.now().minusWeeks(3)),
                app(userId, Status.APPLIED, OffsetDateTime.now().minusWeeks(30)),
                app(userId, Status.SAVED, null)));

        long total = weeks(service.getAnalytics(userId)).values().stream().mapToLong(Long::longValue).sum();

        assertThat(total).isEqualTo(1);
    }
}
