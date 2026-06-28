package com.nybutik.module.catalog.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductVariantRequest(
        Long colorId,
        Long sizeId,

        @NotBlank
        String sku,

        @NotNull @DecimalMin("0.01")
        BigDecimal price,

        @DecimalMin("0.01")
        BigDecimal salePrice,

        @Min(0)
        Integer stockQuantity,

        Boolean isActive
) {}
