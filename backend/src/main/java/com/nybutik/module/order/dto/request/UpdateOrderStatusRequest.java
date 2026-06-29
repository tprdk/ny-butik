package com.nybutik.module.order.dto.request;

import com.nybutik.module.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status, String note) {}
