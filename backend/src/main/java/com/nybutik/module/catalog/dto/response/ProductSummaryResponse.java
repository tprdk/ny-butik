package com.nybutik.module.catalog.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductSummaryResponse(
        Long id,
        String name,
        String slug,
        String shortDesc,
        String status,
        Boolean featured,
        String primaryImageUrl,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal minSalePrice,
        Boolean inStock,
        CategoryResponse category,
        Instant createdAt
) {}
