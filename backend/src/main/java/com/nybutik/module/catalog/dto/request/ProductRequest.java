package com.nybutik.module.catalog.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record ProductRequest(
        @NotNull
        Long categoryId,

        @NotBlank @Size(max = 300)
        String name,

        @Size(max = 500)
        String shortDesc,

        String description,
        Boolean featured,
        List<String> tags,
        Map<String, String> attributes,

        @Valid
        List<ProductVariantRequest> variants
) {}
