package com.nybutik.module.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Slf4j
@Service
public class S3StorageAdapter implements StorageService {

    private final S3Client s3Client;
    private final String bucket;
    private final String publicUrl;

    public S3StorageAdapter(
            @Value("${app.storage.endpoint}") String endpoint,
            @Value("${app.storage.bucket}") String bucket,
            @Value("${app.storage.access-key}") String accessKey,
            @Value("${app.storage.secret-key}") String secretKey,
            @Value("${app.storage.region}") String region,
            @Value("${app.storage.public-url}") String publicUrl
    ) {
        this.bucket = bucket;
        this.publicUrl = publicUrl;
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        String key = "%s/%s-%s".formatted(
                folder,
                UUID.randomUUID(),
                sanitizeFilename(file.getOriginalFilename())
        );
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
            log.debug("Uploaded file to storage: {}", key);
            return getPublicUrl(key);
        } catch (IOException e) {
            throw new RuntimeException("Dosya yüklenemedi: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        String key = fileUrl.replace(publicUrl + "/", "");
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
        log.debug("Deleted file from storage: {}", key);
    }

    @Override
    public String getPublicUrl(String key) {
        return publicUrl + "/" + key;
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
