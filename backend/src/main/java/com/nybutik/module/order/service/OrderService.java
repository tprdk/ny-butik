package com.nybutik.module.order.service;

import com.nybutik.module.cart.entity.Cart;
import com.nybutik.module.cart.entity.CartItem;
import com.nybutik.module.cart.repository.CartRepository;
import com.nybutik.module.coupon.entity.Coupon;
import com.nybutik.module.coupon.service.CouponService;
import com.nybutik.module.order.dto.request.CreateOrderRequest;
import com.nybutik.module.order.dto.request.UpdateOrderStatusRequest;
import com.nybutik.module.order.dto.response.*;
import com.nybutik.module.order.entity.Order;
import com.nybutik.module.order.entity.OrderItem;
import com.nybutik.module.order.entity.OrderStatusHistory;
import com.nybutik.module.order.enums.OrderStatus;
import com.nybutik.module.order.event.OrderPaidEvent;
import com.nybutik.module.order.repository.OrderRepository;
import com.nybutik.module.payment.entity.Payment;
import com.nybutik.module.payment.enums.PaymentStatus;
import com.nybutik.module.payment.service.PaymentFacade;
import com.nybutik.module.shipment.entity.Shipment;
import com.nybutik.module.shipment.repository.ShipmentRepository;
import com.nybutik.module.user.entity.Address;
import com.nybutik.module.user.repository.AddressRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import com.nybutik.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final PaymentFacade paymentFacade;
    private final ShipmentRepository shipmentRepository;
    private final CouponService couponService;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CheckoutResponse createOrder(Long userId, CreateOrderRequest req) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new BusinessException("Sepetiniz boş", HttpStatus.BAD_REQUEST, "EMPTY_CART"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Sepetiniz boş", HttpStatus.BAD_REQUEST, "EMPTY_CART");
        }

        Address shipping = addressRepository.findByIdAndUserId(req.shippingAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teslimat adresi", req.shippingAddressId()));

        Address billing = addressRepository.findByIdAndUserId(req.billingAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura adresi", req.billingAddressId()));

        // Stok kontrolü
        for (CartItem item : cart.getItems()) {
            if (item.getVariant().getStockQuantity() < item.getQuantity()) {
                throw new BusinessException(
                        "'%s' için yeterli stok yok (mevcut: %d)".formatted(
                                item.getVariant().getSku(), item.getVariant().getStockQuantity()),
                        HttpStatus.CONFLICT, "INSUFFICIENT_STOCK");
            }
        }

        // Tutarlar
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = cart.getCoupon();
        if (coupon != null) {
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
        }

        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal shipping2 = afterDiscount.compareTo(new BigDecimal("500.00")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("49.90");
        BigDecimal total = afterDiscount.add(shipping2);

        // Sipariş oluştur
        Order order = Order.builder()
                .orderNumber(orderNumberGenerator.generate())
                .user(cart.getUser())
                .status(OrderStatus.PENDING_PAYMENT)
                .coupon(coupon)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingAmount(shipping2)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(total)
                .notes(req.notes())
                // Teslimat adresi snapshot
                .shippingName(shipping.getFirstName() + " " + shipping.getLastName())
                .shippingPhone(shipping.getPhone())
                .shippingAddress1(shipping.getAddressLine1())
                .shippingAddress2(shipping.getAddressLine2())
                .shippingCity(shipping.getCity())
                .shippingDistrict(shipping.getDistrict())
                .shippingPostal(shipping.getPostalCode())
                .shippingCountry(shipping.getCountry())
                // Fatura adresi snapshot
                .billingName(billing.getFirstName() + " " + billing.getLastName())
                .billingPhone(billing.getPhone())
                .billingAddress1(billing.getAddressLine1())
                .billingAddress2(billing.getAddressLine2())
                .billingCity(billing.getCity())
                .billingDistrict(billing.getDistrict())
                .billingPostal(billing.getPostalCode())
                .billingCountry(billing.getCountry())
                .build();

        // Sipariş kalemleri
        for (CartItem item : cart.getItems()) {
            var variant = item.getVariant();
            var product = variant.getProduct();
            String imageUrl = product.getImages().stream()
                    .filter(img -> img.getIsPrimary())
                    .map(img -> img.getUrl())
                    .findFirst().orElse(null);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variantId(variant.getId())
                    .productName(product.getName())
                    .sku(variant.getSku())
                    .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
                    .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
                    .imageUrl(imageUrl)
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .salePrice(variant.getSalePrice())
                    .lineTotal(item.getLineTotal())
                    .build();
            order.getItems().add(orderItem);
        }

        // Durum geçmişi
        addHistory(order, OrderStatus.PENDING_PAYMENT, "Sipariş oluşturuldu", null);

        Order saved = orderRepository.save(order);

        // Ödeme işle
        Payment payment = paymentFacade.processPayment(saved.getId(), total, req.paymentMethod());

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            saved.setStatus(OrderStatus.CONFIRMED);
            addHistory(saved, OrderStatus.CONFIRMED, "Ödeme başarılı", null);
            orderRepository.save(saved);

            // Kupon kullanım sayısını artır
            if (coupon != null) {
                couponService.incrementUsedCount(coupon);
            }

            // Sepeti temizle
            cart.getItems().clear();
            cart.setCoupon(null);
            cartRepository.save(cart);

            // Event: stok azalt + kargo oluştur
            eventPublisher.publishEvent(new OrderPaidEvent(saved));
        } else {
            saved.setStatus(OrderStatus.PAYMENT_FAILED);
            addHistory(saved, OrderStatus.PAYMENT_FAILED, "Ödeme başarısız: " + payment.getErrorMessage(), null);
            orderRepository.save(saved);
            throw new BusinessException("Ödeme işlemi başarısız oldu", HttpStatus.PAYMENT_REQUIRED, "PAYMENT_FAILED");
        }

        return new CheckoutResponse(saved.getId(), saved.getOrderNumber(), saved.getStatus(), saved.getTotalAmount());
    }

    public PageResponse<OrderSummaryResponse> getMyOrders(Long userId, Pageable pageable) {
        return PageResponse.from(
                orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(o -> toSummary(o, null))
        );
    }

    public OrderResponse getMyOrder(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", orderNumber));
        Shipment shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
        return toResponse(order, shipment);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", orderNumber));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BusinessException("Bu sipariş iptal edilemez (durum: " + order.getStatus() + ")",
                    HttpStatus.BAD_REQUEST, "CANNOT_CANCEL");
        }

        order.setStatus(OrderStatus.CANCELLED);
        addHistory(order, OrderStatus.CANCELLED, "Müşteri tarafından iptal edildi", userId);
        Order saved = orderRepository.save(order);
        return toResponse(saved, null);
    }

    // Admin
    public PageResponse<OrderSummaryResponse> adminListOrders(OrderStatus status, Pageable pageable) {
        var page = status != null
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page.map(o -> {
            Shipment shipment = shipmentRepository.findByOrderId(o.getId()).orElse(null);
            return toSummary(o, shipment);
        }));
    }

    public OrderResponse adminGetOrder(Long id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", id));
        Shipment shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
        return toResponse(order, shipment);
    }

    @Transactional
    public OrderResponse adminUpdateStatus(Long id, UpdateOrderStatusRequest req, Long adminId) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", id));
        order.setStatus(req.status());
        addHistory(order, req.status(), req.note(), adminId);
        Order saved = orderRepository.save(order);
        Shipment shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
        return toResponse(saved, shipment);
    }

    // ── Yardımcı ──────────────────────────────────────────────────────────────

    private void addHistory(Order order, OrderStatus status, String note, Long changedBy) {
        OrderStatusHistory h = OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .changedBy(changedBy)
                .build();
        order.getStatusHistory().add(h);
    }

    private OrderSummaryResponse toSummary(Order o, Shipment shipment) {
        int itemCount = o.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
        return new OrderSummaryResponse(
                o.getId(), o.getOrderNumber(), o.getStatus(),
                o.getTotalAmount(), itemCount,
                shipment != null ? shipment.getStatus() : null,
                o.getCreatedAt()
        );
    }

    private OrderResponse toResponse(Order o, Shipment shipment) {
        List<OrderItemResponse> items = o.getItems().stream().map(i ->
                new OrderItemResponse(i.getVariantId(), i.getProductName(), i.getSku(),
                        i.getColorName(), i.getSizeName(), i.getImageUrl(),
                        i.getQuantity(), i.getUnitPrice(), i.getSalePrice(), i.getLineTotal())
        ).toList();

        List<OrderStatusHistoryResponse> history = o.getStatusHistory().stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(h -> new OrderStatusHistoryResponse(h.getId(), h.getStatus(), h.getNote(),
                        h.getChangedBy(), h.getCreatedAt()))
                .toList();

        ShipmentResponse shipmentResp = shipment == null ? null : new ShipmentResponse(
                shipment.getId(), shipment.getProvider(), shipment.getTrackingNumber(),
                shipment.getTrackingUrl(), shipment.getStatus(),
                shipment.getEstimatedDelivery(), shipment.getDeliveredAt());

        return new OrderResponse(
                o.getId(), o.getOrderNumber(), o.getStatus(),
                o.getSubtotal(), o.getDiscountAmount(), o.getShippingAmount(),
                o.getTaxAmount(), o.getTotalAmount(), o.getNotes(),
                o.getCoupon() != null ? o.getCoupon().getCode() : null,
                items, history, shipmentResp,
                o.getShippingName(), o.getShippingPhone(), o.getShippingAddress1(),
                o.getShippingAddress2(), o.getShippingCity(), o.getShippingDistrict(),
                o.getShippingPostal(), o.getShippingCountry(),
                o.getBillingName(), o.getBillingPhone(), o.getBillingAddress1(),
                o.getBillingAddress2(), o.getBillingCity(), o.getBillingDistrict(),
                o.getBillingPostal(), o.getBillingCountry(),
                o.getCreatedAt()
        );
    }
}
