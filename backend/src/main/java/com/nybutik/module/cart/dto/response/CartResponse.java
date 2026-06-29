package com.nybutik.module.cart.dto.response;

import com.nybutik.module.coupon.dto.response.CouponResponse;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long id,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal shippingAmount,
        BigDecimal total,
        CouponResponse coupon
) {}
