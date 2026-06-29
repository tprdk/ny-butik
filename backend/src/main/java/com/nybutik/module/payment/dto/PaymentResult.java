package com.nybutik.module.payment.dto;

import com.nybutik.module.payment.enums.PaymentStatus;

public record PaymentResult(
        PaymentStatus status,
        String providerRef,
        String errorCode,
        String errorMessage
) {
    public static PaymentResult success(String providerRef) {
        return new PaymentResult(PaymentStatus.SUCCESS, providerRef, null, null);
    }

    public static PaymentResult failure(String errorCode, String errorMessage) {
        return new PaymentResult(PaymentStatus.FAILED, null, errorCode, errorMessage);
    }

    public boolean isSuccess() {
        return status == PaymentStatus.SUCCESS;
    }
}
