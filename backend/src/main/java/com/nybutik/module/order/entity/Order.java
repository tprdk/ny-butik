package com.nybutik.module.order.entity;

import com.nybutik.module.coupon.entity.Coupon;
import com.nybutik.module.order.enums.OrderStatus;
import com.nybutik.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "shipping_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingAmount;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Teslimat adresi snapshot
    @Column(name = "shipping_name", nullable = false, length = 200)
    private String shippingName;
    @Column(name = "shipping_phone", nullable = false, length = 20)
    private String shippingPhone;
    @Column(name = "shipping_address1", nullable = false, length = 255)
    private String shippingAddress1;
    @Column(name = "shipping_address2", length = 255)
    private String shippingAddress2;
    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;
    @Column(name = "shipping_district", nullable = false, length = 100)
    private String shippingDistrict;
    @Column(name = "shipping_postal", nullable = false, length = 10)
    private String shippingPostal;
    @Column(name = "shipping_country", nullable = false, length = 2)
    private String shippingCountry;

    // Fatura adresi snapshot
    @Column(name = "billing_name", nullable = false, length = 200)
    private String billingName;
    @Column(name = "billing_phone", nullable = false, length = 20)
    private String billingPhone;
    @Column(name = "billing_address1", nullable = false, length = 255)
    private String billingAddress1;
    @Column(name = "billing_address2", length = 255)
    private String billingAddress2;
    @Column(name = "billing_city", nullable = false, length = 100)
    private String billingCity;
    @Column(name = "billing_district", nullable = false, length = 100)
    private String billingDistrict;
    @Column(name = "billing_postal", nullable = false, length = 10)
    private String billingPostal;
    @Column(name = "billing_country", nullable = false, length = 2)
    private String billingCountry;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
