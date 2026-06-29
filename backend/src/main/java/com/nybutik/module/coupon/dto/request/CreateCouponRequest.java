package com.nybutik.module.coupon.dto.request;

import com.nybutik.module.coupon.enums.DiscountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateCouponRequest(
        @NotBlank @Size(min = 3, max = 50) String code,
        @NotNull DiscountType discountType,
        @NotNull @Positive BigDecimal discountValue,
        @PositiveOrZero BigDecimal minOrderAmount,
        @Positive Integer maxUses,
        @Positive Integer usesPerUser,
        Instant startsAt,
        Instant expiresAt
) {
    public CreateCouponRequest {
        if (usesPerUser == null) usesPerUser = 1;
    }
}
