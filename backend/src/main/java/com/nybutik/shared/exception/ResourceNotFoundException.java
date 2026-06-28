package com.nybutik.shared.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object id) {
        super("%s bulunamadı: %s".formatted(resource, id), HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }
}