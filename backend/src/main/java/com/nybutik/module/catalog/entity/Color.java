package com.nybutik.module.catalog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "colors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Color {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "hex_code", length = 7)
    private String hexCode;

    @Column(unique = true, nullable = false, length = 100)
    private String slug;
}
