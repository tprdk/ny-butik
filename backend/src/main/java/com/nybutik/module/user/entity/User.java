package com.nybutik.module.user.entity;

import com.nybutik.module.user.enums.Role;
import com.nybutik.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
