package com.nybutik.module.notification.listener;

import com.nybutik.module.notification.service.NotificationService;
import com.nybutik.module.order.event.OrderPaidEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void onOrderPaid(OrderPaidEvent event) {
        log.debug("OrderPaidEvent alındı: {}", event.order().getOrderNumber());
        notificationService.sendOrderConfirmation(event.order());
    }
}
