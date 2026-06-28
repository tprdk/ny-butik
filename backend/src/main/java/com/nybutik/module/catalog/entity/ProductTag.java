package com.nybutik.module.catalog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_tags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductTag {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String tag;
}
