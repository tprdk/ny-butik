package com.nybutik.module.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
        long totalOrders,
        long todayOrders,
        BigDecimal totalRevenue,
        BigDecimal todayRevenue,
        long totalProducts,
        long lowStockProducts,
        long totalCustomers,
        long newCustomersToday,
        List<OrderSummaryItem> recentOrders,
        List<TopProductItem> topProducts
) {}
