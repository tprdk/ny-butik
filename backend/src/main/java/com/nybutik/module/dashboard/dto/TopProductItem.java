package com.nybutik.module.dashboard.dto;

import java.math.BigDecimal;

public record TopProductItem(
        Long productId,
        String productName,
        long totalSold,
        BigDecimal totalRevenue
) {}
