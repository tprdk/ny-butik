package com.nybutik.module.return_.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "return_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReturnItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    private Return returnRequest;

    @Column(name = "order_item_id", nullable = false)
    private Long orderItemId;

    @Column(nullable = false)
    private Integer quantity;
}
