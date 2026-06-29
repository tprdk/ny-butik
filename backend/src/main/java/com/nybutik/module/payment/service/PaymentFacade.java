package com.nybutik.module.payment.service;

import com.nybutik.module.payment.dto.PaymentResult;
import com.nybutik.module.payment.entity.Payment;
import com.nybutik.module.payment.enums.PaymentStatus;
import com.nybutik.module.payment.repository.PaymentRepository;
import com.nybutik.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentFacade {

    private final Map<String, PaymentService> providers;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Payment processPayment(Long orderId, BigDecimal amount, String paymentMethod) {
        PaymentService provider = providers.get(paymentMethod);
        if (provider == null) {
            throw new BusinessException("Desteklenmeyen ödeme yöntemi: " + paymentMethod,
                    HttpStatus.BAD_REQUEST, "UNSUPPORTED_PAYMENT_METHOD");
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .provider(paymentMethod)
                .amount(amount)
                .currency("TRY")
                .status(PaymentStatus.PROCESSING)
                .initiatedAt(Instant.now())
                .build();
        paymentRepository.save(payment);

        PaymentResult result = provider.processPayment(orderId, amount, "TRY");

        payment.setStatus(result.status());
        payment.setProviderRef(result.providerRef());
        payment.setErrorCode(result.errorCode());
        payment.setErrorMessage(result.errorMessage());
        if (result.isSuccess()) {
            payment.setCompletedAt(Instant.now());
        }

        return paymentRepository.save(payment);
    }
}
