package com.nybutik.module.catalog.dto.response;

import java.time.Instant;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String shortDesc,
        String description,
        String status,
        Boolean featured,
        CategoryResponse category,
        List<ProductVariantResponse> variants,
        List<ProductImageResponse> images,
        List<String> tags,
        List<ProductAttributeResponse> attributes,
        Instant createdAt,
        Instant updatedAt
) {}
