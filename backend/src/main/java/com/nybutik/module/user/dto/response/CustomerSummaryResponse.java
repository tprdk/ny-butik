package com.nybutik.module.user.dto.response;

import java.time.Instant;

public record CustomerSummaryResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        boolean isActive,
        Instant createdAt
) {}
