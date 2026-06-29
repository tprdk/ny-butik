package com.nybutik.module.user.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record CustomerResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        boolean isActive,
        String role,
        Instant createdAt,
        int orderCount,
        BigDecimal totalSpent
) {}
