package com.nybutik.module.order.listener;

import com.nybutik.module.catalog.repository.ProductVariantRepository;
import com.nybutik.module.order.entity.OrderItem;
import com.nybutik.module.order.event.OrderPaidEvent;
import com.nybutik.module.shipment.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPaidEventListener {

    private final ProductVariantRepository variantRepository;
    private final ShipmentService shipmentService;

    @EventListener
    @Transactional
    public void onOrderPaid(OrderPaidEvent event) {
        var order = event.order();
        log.info("OrderPaid event received for order {}", order.getOrderNumber());

        // Stok azalt
        for (OrderItem item : order.getItems()) {
            variantRepository.findById(item.getVariantId()).ifPresent(variant -> {
                int newStock = Math.max(0, variant.getStockQuantity() - item.getQuantity());
                variant.setStockQuantity(newStock);
                variantRepository.save(variant);
            });
        }

        // Kargo oluştur
        shipmentService.createShipment(order.getId());

        log.info("Stock decremented and shipment created for order {}", order.getOrderNumber());
    }
}
