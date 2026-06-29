package com.nybutik.module.coupon.dto.response;

import com.nybutik.module.coupon.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponResponse(
        Long id,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        Integer maxUses,
        Integer usesPerUser,
        Integer usedCount,
        Boolean isActive,
        Instant startsAt,
        Instant expiresAt
) {}
