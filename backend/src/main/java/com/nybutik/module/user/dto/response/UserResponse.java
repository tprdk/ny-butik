package com.nybutik.module.user.dto.response;

import com.nybutik.module.user.enums.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role,
        boolean emailVerified,
        Instant createdAt
) {}
