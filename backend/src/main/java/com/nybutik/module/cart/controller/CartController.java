package com.nybutik.module.cart.controller;

import com.nybutik.module.cart.dto.request.AddItemRequest;
import com.nybutik.module.cart.dto.request.ApplyCouponRequest;
import com.nybutik.module.cart.dto.request.UpdateItemRequest;
import com.nybutik.module.cart.dto.response.CartResponse;
import com.nybutik.module.cart.service.CartService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Sepet")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Sepeti getir (misafir: X-Session-Id header)")
    public ResponseEntity<ApiResponse<CartResponse>> get(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.get(currentUserId(), sessionId)));
    }

    @PostMapping("/items")
    @Operation(summary = "Sepete ürün ekle")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody AddItemRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.addItem(currentUserId(), sessionId, req)));
    }

    @PutMapping("/items/{variantId}")
    @Operation(summary = "Sepet ürün miktarını güncelle")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateItemRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateItem(currentUserId(), sessionId, variantId, req)));
    }

    @DeleteMapping("/items/{variantId}")
    @Operation(summary = "Sepetten ürün çıkar")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.removeItem(currentUserId(), sessionId, variantId)));
    }

    @DeleteMapping
    @Operation(summary = "Sepeti temizle")
    public ResponseEntity<ApiResponse<CartResponse>> clear(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.clear(currentUserId(), sessionId)));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Kupon uygula")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody ApplyCouponRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.applyCoupon(currentUserId(), sessionId, req.code())));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Kuponu kaldır")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.removeCoupon(currentUserId(), sessionId)));
    }

    @PostMapping("/merge")
    @Operation(summary = "Misafir sepetini hesapla birleştir (login sonrası)")
    public ResponseEntity<ApiResponse<CartResponse>> merge(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        Long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(cartService.merge(userId, sessionId)));
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.nybutik.shared.security.UserPrincipal principal) {
            return principal.id();
        }
        return null;
    }
}
