package com.apptracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class R2StorageService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${r2.bucket}")
    private String bucket;

    public R2StorageService(S3Presigner s3Presigner, S3Client s3Client) {
        this.s3Presigner = s3Presigner;
        this.s3Client = s3Client;
    }

    public PresignedUploadUrl generatePresignedUploadUrl(UUID userId, UUID appId, String fileName, String contentType) {
        // Generate safe object key
        String sanitizedFileName = sanitizeFileName(fileName);
        String objectKey = String.format("users/%s/apps/%s/%s_%s",
                userId, appId, UUID.randomUUID(), sanitizedFileName);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return new PresignedUploadUrl(
                presignedRequest.url().toString(),
                objectKey,
                System.currentTimeMillis() + Duration.ofMinutes(15).toMillis());
    }

    public String generatePresignedDownloadUrl(String objectKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }

    public void deleteObject(String objectKey) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public static class PresignedUploadUrl {
        private final String uploadUrl;
        private final String objectKey;
        private final long expiresAt;

        public PresignedUploadUrl(String uploadUrl, String objectKey, long expiresAt) {
            this.uploadUrl = uploadUrl;
            this.objectKey = objectKey;
            this.expiresAt = expiresAt;
        }

        public String getUploadUrl() {
            return uploadUrl;
        }

        public String getObjectKey() {
            return objectKey;
        }

        public long getExpiresAt() {
            return expiresAt;
        }
    }

    public static boolean isAllowedContentType(String contentType) {
        return contentType != null && (contentType.equals("application/pdf") ||
                contentType.equals("image/png") ||
                contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || // .docx
                contentType.equals("application/msword") || // .doc
                contentType.equals("text/plain") || // .txt
                contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || // .xlsx
                contentType.equals("application/vnd.ms-excel") // .xls
        );
    }

    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
}
