package com.nybutik.module.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddItemRequest(
        @NotNull Long variantId,
        @NotNull @Min(1) Integer quantity
) {}
