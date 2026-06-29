package com.nybutik.module.shipment.service;

import com.nybutik.module.shipment.dto.ShipmentResult;
import com.nybutik.module.shipment.entity.Shipment;

public interface ShipmentService {
    Shipment createShipment(Long orderId);
}
