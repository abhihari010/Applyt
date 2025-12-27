package com.apptracker.repository;

import com.apptracker.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    List<Reminder> findByApplicationIdOrderByRemindAtAsc(UUID applicationId);

    @Query("SELECT r FROM Reminder r WHERE r.completed = false AND r.remindAt <= :until ORDER BY r.remindAt ASC")
    List<Reminder> findDueReminders(@Param("until") OffsetDateTime until);

    @Query("SELECT r FROM Reminder r JOIN ApplicationEntity a ON r.applicationId = a.id " +
            "WHERE a.userId = :userId AND r.completed = false AND r.remindAt <= :until " +
            "ORDER BY r.remindAt ASC")
    List<Reminder> findDueRemindersByUser(@Param("userId") UUID userId, @Param("until") OffsetDateTime until);

    @Query("SELECT r FROM Reminder r JOIN ApplicationEntity a ON r.applicationId = a.id " +
            "WHERE a.userId = :userId AND r.completed = false " +
            "ORDER BY r.remindAt ASC")
    List<Reminder> findAllIncompleteRemindersByUser(@Param("userId") UUID userId);
}
