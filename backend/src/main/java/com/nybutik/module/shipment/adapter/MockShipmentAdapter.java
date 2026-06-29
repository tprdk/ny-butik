package com.nybutik.module.shipment.adapter;

import com.nybutik.module.shipment.entity.Shipment;
import com.nybutik.module.shipment.enums.ShipmentStatus;
import com.nybutik.module.shipment.repository.ShipmentRepository;
import com.nybutik.module.shipment.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockShipmentAdapter implements ShipmentService {

    private static final List<ShipmentStatus> TERMINAL_STATUSES = List.of(
            ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED);

    private static final List<ShipmentStatus> PROGRESSION = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PICKING,
            ShipmentStatus.PACKED,
            ShipmentStatus.SHIPPED,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY,
            ShipmentStatus.DELIVERED
    );

    private final ShipmentRepository shipmentRepository;

    @Override
    @Transactional
    public Shipment createShipment(Long orderId) {
        String trackingNo = "NYB" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        Shipment shipment = Shipment.builder()
                .orderId(orderId)
                .provider("MOCK")
                .trackingNumber(trackingNo)
                .trackingUrl("https://kargo.nybutik.com/takip/" + trackingNo)
                .status(ShipmentStatus.CREATED)
                .estimatedDelivery(Instant.now().plus(3, ChronoUnit.DAYS))
                .build();

        return shipmentRepository.save(shipment);
    }

    // Demo: her 2 dakikada bir aktif kargoları bir sonraki adıma ilerlet
    @Scheduled(fixedDelay = 120_000)
    @Transactional
    public void advanceShipments() {
        List<Shipment> active = shipmentRepository.findByStatusNotIn(TERMINAL_STATUSES);
        for (Shipment s : active) {
            int idx = PROGRESSION.indexOf(s.getStatus());
            if (idx >= 0 && idx < PROGRESSION.size() - 1) {
                ShipmentStatus next = PROGRESSION.get(idx + 1);
                s.setStatus(next);
                if (next == ShipmentStatus.DELIVERED) {
                    s.setDeliveredAt(Instant.now());
                }
                log.debug("Shipment {} advanced to {}", s.getTrackingNumber(), next);
            }
        }
        if (!active.isEmpty()) shipmentRepository.saveAll(active);
    }
}
