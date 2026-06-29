package com.nybutik.module.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesReportRow(
        LocalDate date,
        long orderCount,
        BigDecimal revenue
) {}
