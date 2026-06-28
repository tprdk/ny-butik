package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.dto.response.ProductResponse;
import com.nybutik.module.catalog.dto.response.ProductSummaryResponse;
import com.nybutik.module.catalog.service.ProductService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Ürünler")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Ürün listesi (filtre + arama + sayfalama)")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<Long> colorIds,
            @RequestParam(required = false) List<Long> sizeIds,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ProductSummaryResponse> result = productService.list(
                categoryId, colorIds, sizeIds, minPrice, maxPrice, search, featured,
                PageRequest.of(page, Math.min(size, 100), sort));

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/featured")
    @Operation(summary = "Öne çıkan ürünler")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getFeatured(
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeatured(size)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Slug ile ürün detayı")
    public ResponseEntity<ApiResponse<ProductResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getBySlug(slug)));
    }
}
