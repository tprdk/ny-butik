package com.nybutik.module.user.dto.response;

public record AuthResponse(
        String accessToken,
        long expiresIn,
        UserResponse user
) {}
