package com.nybutik.module.order.dto.response;

import com.nybutik.module.shipment.enums.ShipmentStatus;

import java.time.Instant;

public record ShipmentResponse(
        Long id,
        String provider,
        String trackingNumber,
        String trackingUrl,
        ShipmentStatus status,
        Instant estimatedDelivery,
        Instant deliveredAt
) {}
