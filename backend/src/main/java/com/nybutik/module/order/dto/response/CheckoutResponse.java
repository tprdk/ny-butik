package com.nybutik.module.order.dto.response;

import com.nybutik.module.order.enums.OrderStatus;

import java.math.BigDecimal;

public record CheckoutResponse(
        Long orderId,
        String orderNumber,
        OrderStatus status,
        BigDecimal total
) {}
