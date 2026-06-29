package com.nybutik.module.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryItem(
        Long id,
        String orderNumber,
        String customerName,
        BigDecimal totalAmount,
        String status,
        Instant createdAt
) {}
