package com.nybutik.module.user.entity;

import com.nybutik.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 100)
    private String label;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(nullable = false, length = 2)
    private String country;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;
}
