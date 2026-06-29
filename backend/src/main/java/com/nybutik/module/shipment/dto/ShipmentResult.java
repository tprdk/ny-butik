package com.nybutik.module.shipment.dto;

import java.time.Instant;

public record ShipmentResult(
        String provider,
        String trackingNumber,
        String trackingUrl,
        Instant estimatedDelivery
) {}
