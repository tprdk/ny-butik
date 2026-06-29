package com.nybutik.module.order.event;

import com.nybutik.module.order.entity.Order;

public record OrderPaidEvent(Order order) {}
