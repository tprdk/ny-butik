package com.nybutik.module.return_.entity;

import com.nybutik.module.order.entity.Order;
import com.nybutik.module.return_.enums.ReturnReason;
import com.nybutik.module.return_.enums.ReturnStatus;
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
@Table(name = "returns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Return {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReturnStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReturnReason reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "return_tracking", length = 100)
    private String returnTracking;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @OneToMany(mappedBy = "returnRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
