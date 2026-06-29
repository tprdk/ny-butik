package com.nybutik.module.return_.dto.response;

import com.nybutik.module.return_.enums.ReturnReason;
import com.nybutik.module.return_.enums.ReturnStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ReturnResponse(
        Long id,
        Long orderId,
        String orderNumber,
        ReturnStatus status,
        ReturnReason reason,
        String description,
        String adminNote,
        String returnTracking,
        BigDecimal refundAmount,
        List<ReturnItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
