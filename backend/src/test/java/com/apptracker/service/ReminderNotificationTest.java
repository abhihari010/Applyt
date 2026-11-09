package com.apptracker.service;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Reminder;
import com.apptracker.model.User;
import com.apptracker.repository.ActivityRepository;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.ReminderRepository;
import com.apptracker.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReminderNotificationTest {

    private final ReminderRepository reminders = mock(ReminderRepository.class);
    private final ApplicationRepository applications = mock(ApplicationRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final EmailService email = mock(EmailService.class);
    private final ReminderService service = new ReminderService(reminders, mock(ApplicationService.class),
            mock(ActivityRepository.class), email, users, applications);

    private Reminder reminderFor(boolean notificationsEnabled, String address, OffsetDateTime remindAt) {
        User user = new User();
        user.setName("Sam");
        user.setEmail(address);
        user.setEmailNotifications(notificationsEnabled);
        when(users.findById(user.getId())).thenReturn(Optional.of(user));

        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(user.getId());
        app.setCompany("Acme");
        app.setRole("Engineer");
        when(applications.findById(app.getId())).thenReturn(Optional.of(app));

        Reminder reminder = new Reminder();
        reminder.setApplicationId(app.getId());
        reminder.setRemindAt(remindAt);
        reminder.setMessage("Follow up with recruiter");
        return reminder;
    }

    private static OffsetDateTime inThirtyMinutes() {
        return OffsetDateTime.now().plusMinutes(30);
    }

    @Test
    void emailsReminderDueWithinTheNextHour() {
        Reminder reminder = reminderFor(true, "sam@example.com", inThirtyMinutes());
        when(reminders.findAll()).thenReturn(List.of(reminder));

        service.sendReminderNotifications();

        verify(email).sendEmail(eq("sam@example.com"), eq("Reminder: Acme - Engineer"),
                contains("Follow up with recruiter"));
    }

    @Test
    void escapesUserTextInTheEmailBody() {
        Reminder reminder = reminderFor(true, "sam@example.com", inThirtyMinutes());
        reminder.setMessage("<img src=x onerror=alert(1)>");
        when(reminders.findAll()).thenReturn(List.of(reminder));

        service.sendReminderNotifications();

        verify(email).sendEmail(eq("sam@example.com"), any(), contains("&lt;img src=x onerror=alert(1)&gt;"));
    }

    @Test
    void respectsTheNotificationPreference() {
        Reminder reminder = reminderFor(false, "sam@example.com", inThirtyMinutes());
        when(reminders.findAll()).thenReturn(List.of(reminder));

        service.sendReminderNotifications();

        verify(email, never()).sendEmail(any(), any(), any());
    }

    @Test
    void skipsCompletedReminders() {
        Reminder completed = reminderFor(true, "sam@example.com", inThirtyMinutes());
        completed.setCompleted(true);
        when(reminders.findAll()).thenReturn(List.of(completed));

        service.sendReminderNotifications();

        verify(email, never()).sendEmail(any(), any(), any());
    }

    @Test
    void skipsRemindersOutsideTheWindow() {
        Reminder past = reminderFor(true, "past@example.com", OffsetDateTime.now().minusMinutes(5));
        Reminder later = reminderFor(true, "later@example.com", OffsetDateTime.now().plusHours(2));
        when(reminders.findAll()).thenReturn(List.of(past, later));

        service.sendReminderNotifications();

        verify(email, never()).sendEmail(any(), any(), any());
    }

    @Test
    void oneFailedEmailDoesNotStopTheOthers() {
        Reminder broken = reminderFor(true, "broken@example.com", inThirtyMinutes());
        Reminder fine = reminderFor(true, "fine@example.com", inThirtyMinutes());
        when(reminders.findAll()).thenReturn(List.of(broken, fine));
        doThrow(new RuntimeException("smtp down")).when(email).sendEmail(eq("broken@example.com"), any(), any());

        assertThatCode(service::sendReminderNotifications).doesNotThrowAnyException();

        verify(email, times(1)).sendEmail(eq("fine@example.com"), any(), any());
    }

    @Test
    void survivesAReminderWhoseApplicationIsGone() {
        Reminder orphan = new Reminder();
        orphan.setApplicationId(java.util.UUID.randomUUID());
        orphan.setRemindAt(inThirtyMinutes());
        when(reminders.findAll()).thenReturn(List.of(orphan));
        when(applications.findById(any())).thenReturn(Optional.empty());

        assertThatCode(service::sendReminderNotifications).doesNotThrowAnyException();

        verify(email, never()).sendEmail(any(), any(), any());
    }
}
