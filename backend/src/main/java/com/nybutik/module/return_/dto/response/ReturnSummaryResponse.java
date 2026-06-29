package com.nybutik.module.return_.dto.response;

import com.nybutik.module.return_.enums.ReturnReason;
import com.nybutik.module.return_.enums.ReturnStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ReturnSummaryResponse(
        Long id,
        Long orderId,
        String orderNumber,
        ReturnStatus status,
        ReturnReason reason,
        Integer itemCount,
        BigDecimal refundAmount,
        Instant createdAt
) {}
