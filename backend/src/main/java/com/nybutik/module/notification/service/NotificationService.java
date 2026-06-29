package com.nybutik.module.notification.service;

import com.nybutik.module.order.entity.Order;
import com.nybutik.module.return_.entity.Return;

public interface NotificationService {
    void sendOrderConfirmation(Order order);
    void sendReturnConfirmation(Return returnRequest);
}
