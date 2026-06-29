package com.nybutik.module.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long shippingAddressId,
        @NotNull Long billingAddressId,
        @NotBlank String paymentMethod,
        String notes
) {}
