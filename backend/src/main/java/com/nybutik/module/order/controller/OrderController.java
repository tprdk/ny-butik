package com.nybutik.module.order.controller;

import com.nybutik.module.order.dto.request.CreateOrderRequest;
import com.nybutik.module.order.dto.response.CheckoutResponse;
import com.nybutik.module.order.dto.response.OrderResponse;
import com.nybutik.module.order.dto.response.OrderSummaryResponse;
import com.nybutik.module.order.service.OrderService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.response.PageResponse;
import com.nybutik.shared.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CheckoutResponse> createOrder(@Valid @RequestBody CreateOrderRequest req) {
        return ApiResponse.ok(orderService.createOrder(SecurityUtils.currentUserId(), req));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderSummaryResponse>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.ok(orderService.getMyOrders(SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/{orderNumber}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.getMyOrder(SecurityUtils.currentUserId(), orderNumber));
    }

    @PostMapping("/{orderNumber}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.cancelOrder(SecurityUtils.currentUserId(), orderNumber));
    }
}
