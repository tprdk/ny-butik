package com.nybutik.module.catalog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sizes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Size {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "size_group", length = 50)
    private String sizeGroup;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
