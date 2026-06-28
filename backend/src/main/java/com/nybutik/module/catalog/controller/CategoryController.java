package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.dto.response.CategoryResponse;
import com.nybutik.module.catalog.service.CategoryService;
import com.nybutik.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Kategoriler")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Kök kategoriler (ağaç yapısı ile)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getTree() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getTree()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Slug ile kategori")
    public ResponseEntity<ApiResponse<CategoryResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getBySlug(slug)));
    }

    @GetMapping("/{id}/children")
    @Operation(summary = "Alt kategoriler")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getChildren(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getChildren(id)));
    }
}
