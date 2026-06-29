package com.nybutik.module.order.dto.response;

import com.nybutik.module.order.enums.OrderStatus;
import com.nybutik.module.shipment.enums.ShipmentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        Integer itemCount,
        ShipmentStatus shipmentStatus,
        Instant createdAt
) {}
