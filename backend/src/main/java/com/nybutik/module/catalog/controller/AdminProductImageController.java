package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.dto.request.ImageOrderRequest;
import com.nybutik.module.catalog.dto.response.ProductImageResponse;
import com.nybutik.module.catalog.service.ProductImageService;
import com.nybutik.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products/{productId}/images")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Ürün Görselleri")
public class AdminProductImageController {

    private final ProductImageService productImageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Görsel yükle (max 5MB, JPEG/PNG/WEBP)")
    public ResponseEntity<ApiResponse<ProductImageResponse>> upload(
            @PathVariable Long productId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "altText", required = false) String altText) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(productImageService.upload(productId, file, altText)));
    }

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Görseli sil (storage'dan da kaldırır)")
    public ResponseEntity<Void> delete(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        productImageService.delete(productId, imageId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/order")
    @Operation(summary = "Görsel sırasını güncelle")
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> reorder(
            @PathVariable Long productId,
            @Valid @RequestBody ImageOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productImageService.reorder(productId, request.imageIds())));
    }

    @PatchMapping("/{imageId}/primary")
    @Operation(summary = "Kapak görseli olarak ayarla")
    public ResponseEntity<ApiResponse<ProductImageResponse>> setPrimary(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.ok(productImageService.setPrimary(productId, imageId)));
    }
}
