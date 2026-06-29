package com.nybutik.module.coupon.controller;

import com.nybutik.module.coupon.dto.request.CreateCouponRequest;
import com.nybutik.module.coupon.dto.response.CouponResponse;
import com.nybutik.module.coupon.service.CouponService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Kuponlar")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    @Operation(summary = "Kupon listesi")
    public ResponseEntity<ApiResponse<PageResponse<CouponResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var data = couponService.list(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(data)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Kupon detayı")
    public ResponseEntity<ApiResponse<CouponResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Yeni kupon oluştur")
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CreateCouponRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(couponService.create(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Kupon güncelle")
    public ResponseEntity<ApiResponse<CouponResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateCouponRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.update(id, req)));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Kupon aktif/pasif değiştir")
    public ResponseEntity<ApiResponse<CouponResponse>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.toggle(id)));
    }
}
