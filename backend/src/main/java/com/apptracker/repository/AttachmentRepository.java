package com.apptracker.repository;

import com.apptracker.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByApplicationIdOrderByUploadedAtDesc(UUID applicationId);

    @Query("SELECT a FROM Attachment a WHERE a.applicationId IN " +
           "(SELECT app.id FROM ApplicationEntity app WHERE app.userId = :userId)")
    List<Attachment> findAllByUserId(@Param("userId") UUID userId);
}
