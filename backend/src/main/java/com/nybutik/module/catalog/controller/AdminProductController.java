package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.dto.request.ProductRequest;
import com.nybutik.module.catalog.dto.response.ProductResponse;
import com.nybutik.module.catalog.dto.response.ProductSummaryResponse;
import com.nybutik.module.catalog.enums.ProductStatus;
import com.nybutik.module.catalog.service.ProductService;
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
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Ürünler")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Tüm ürünler (admin görünümü)")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<ProductSummaryResponse> result = productService.listForAdmin(
                categoryId, search, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ürün detayı (id ile)")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Ürün oluştur")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(productService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Ürün güncelle")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Ürün durumunu değiştir (DRAFT/ACTIVE/PASSIVE)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @PathVariable Long id, @RequestParam ProductStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Ürünü soft-delete ile sil")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
