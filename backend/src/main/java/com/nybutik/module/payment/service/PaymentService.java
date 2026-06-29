package com.nybutik.module.payment.service;

import com.nybutik.module.payment.dto.PaymentResult;

import java.math.BigDecimal;

public interface PaymentService {
    String getProviderName();
    PaymentResult processPayment(Long orderId, BigDecimal amount, String currency);
    PaymentResult refund(String providerRef, BigDecimal amount);
}
