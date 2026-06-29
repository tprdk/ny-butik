package com.nybutik.module.payment.adapter;

import com.nybutik.module.payment.dto.PaymentResult;
import com.nybutik.module.payment.service.PaymentService;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component("MOCK")
public class MockPaymentAdapter implements PaymentService {

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    @Override
    public PaymentResult processPayment(Long orderId, BigDecimal amount, String currency) {
        // Simülasyon: her zaman başarılı
        String ref = "MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return PaymentResult.success(ref);
    }

    @Override
    public PaymentResult refund(String providerRef, BigDecimal amount) {
        return PaymentResult.success("REFUND-" + providerRef);
    }
}
