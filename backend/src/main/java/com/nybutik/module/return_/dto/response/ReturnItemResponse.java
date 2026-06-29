package com.nybutik.module.return_.dto.response;

public record ReturnItemResponse(
        Long id,
        Long orderItemId,
        String productName,
        String sku,
        Integer quantity
) {}
