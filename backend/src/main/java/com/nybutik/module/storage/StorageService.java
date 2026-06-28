package com.nybutik.module.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String upload(MultipartFile file, String folder);

    void delete(String fileUrl);

    String getPublicUrl(String key);
}
