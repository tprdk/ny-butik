package com.nybutik.module.user.dto.response;

import java.time.Instant;

public record AddressResponse(
        Long id,
        String label,
        String firstName,
        String lastName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String district,
        String postalCode,
        String country,
        boolean isDefault,
        Instant createdAt
) {}
