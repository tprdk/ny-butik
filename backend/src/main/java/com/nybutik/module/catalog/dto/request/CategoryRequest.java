package com.nybutik.module.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        Long parentId,

        @NotBlank @Size(max = 150)
        String name,

        String description,
        String imageUrl,
        Integer displayOrder,
        Boolean isActive
) {}
