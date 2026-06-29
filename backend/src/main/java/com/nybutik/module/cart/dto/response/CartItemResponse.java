package com.nybutik.module.cart.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        Long variantId,
        Long productId,
        String productName,
        String productSlug,
        String imageUrl,
        String sku,
        String colorName,
        String sizeName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal
) {}
