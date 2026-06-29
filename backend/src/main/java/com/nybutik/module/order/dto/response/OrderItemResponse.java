package com.nybutik.module.order.dto.response;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long variantId,
        String productName,
        String sku,
        String colorName,
        String sizeName,
        String imageUrl,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal salePrice,
        BigDecimal lineTotal
) {}
