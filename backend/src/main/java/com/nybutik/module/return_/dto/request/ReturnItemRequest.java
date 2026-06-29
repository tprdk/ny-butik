package com.nybutik.module.return_.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReturnItemRequest(
        @NotNull Long orderItemId,
        @NotNull @Min(1) Integer quantity
) {}
