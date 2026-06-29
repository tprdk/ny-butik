package com.nybutik.module.order.dto.response;

import com.nybutik.module.order.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal shippingAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String notes,
        String couponCode,
        List<OrderItemResponse> items,
        List<OrderStatusHistoryResponse> statusHistory,
        ShipmentResponse shipment,

        // Adres snapshot'ları
        String shippingName,
        String shippingPhone,
        String shippingAddress1,
        String shippingAddress2,
        String shippingCity,
        String shippingDistrict,
        String shippingPostal,
        String shippingCountry,

        String billingName,
        String billingPhone,
        String billingAddress1,
        String billingAddress2,
        String billingCity,
        String billingDistrict,
        String billingPostal,
        String billingCountry,

        Instant createdAt
) {}
