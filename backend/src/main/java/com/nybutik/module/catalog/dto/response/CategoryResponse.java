package com.nybutik.module.catalog.dto.response;

import java.util.List;

public record CategoryResponse(
        Long id,
        Long parentId,
        String name,
        String slug,
        String description,
        String imageUrl,
        Integer displayOrder,
        Boolean isActive,
        List<CategoryResponse> children
) {}
