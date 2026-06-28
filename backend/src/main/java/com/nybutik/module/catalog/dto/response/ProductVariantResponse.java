package com.nybutik.module.catalog.dto.response;

import java.math.BigDecimal;

public record ProductVariantResponse(
        Long id,
        ColorResponse color,
        SizeResponse size,
        String sku,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        Integer stockQuantity,
        Boolean isActive,
        Boolean inStock
) {}
