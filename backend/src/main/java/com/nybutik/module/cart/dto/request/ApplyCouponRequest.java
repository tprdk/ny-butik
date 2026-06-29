package com.nybutik.module.cart.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ApplyCouponRequest(@NotBlank String code) {}
