package com.nybutik.module.return_.dto.request;

import com.nybutik.module.return_.enums.ReturnStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AdminUpdateReturnRequest(
        @NotNull ReturnStatus status,
        String adminNote,
        String returnTracking,
        BigDecimal refundAmount
) {}
