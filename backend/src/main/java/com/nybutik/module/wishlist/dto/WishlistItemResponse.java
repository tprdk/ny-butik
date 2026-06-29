package com.nybutik.module.wishlist.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WishlistItemResponse(
        Long wishlistId,
        Long productId,
        String productName,
        String slug,
        String imageUrl,
        BigDecimal minPrice,
        BigDecimal minSalePrice,
        boolean inStock,
        Instant addedAt
) {}
