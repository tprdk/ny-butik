package com.nybutik.module.catalog.dto.response;

public record ProductImageResponse(
        Long id,
        String url,
        String altText,
        Integer displayOrder,
        Boolean isPrimary
) {}
