package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.dto.response.ColorResponse;
import com.nybutik.module.catalog.dto.response.SizeResponse;
import com.nybutik.module.catalog.entity.Color;
import com.nybutik.module.catalog.entity.Size;
import com.nybutik.module.catalog.mapper.ProductMapper;
import com.nybutik.module.catalog.repository.ColorRepository;
import com.nybutik.module.catalog.repository.SizeRepository;
import com.nybutik.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Renk & Beden")
public class ColorSizeController {

    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;
    private final ProductMapper productMapper;

    @GetMapping("/colors")
    public ResponseEntity<ApiResponse<List<ColorResponse>>> getColors() {
        List<ColorResponse> colors = colorRepository.findAllByOrderByNameAsc()
                .stream().map(productMapper::toColorResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(colors));
    }

    @GetMapping("/sizes")
    public ResponseEntity<ApiResponse<List<SizeResponse>>> getSizes() {
        List<SizeResponse> sizes = sizeRepository.findAllByOrderBySortOrderAsc()
                .stream().map(productMapper::toSizeResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(sizes));
    }
}
