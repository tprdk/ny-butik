package com.nybutik.module.order.dto.response;

import com.nybutik.module.order.enums.OrderStatus;

import java.time.Instant;

public record OrderStatusHistoryResponse(
        Long id,
        OrderStatus status,
        String note,
        Long changedBy,
        Instant createdAt
) {}
