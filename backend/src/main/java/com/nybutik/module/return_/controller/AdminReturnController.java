package com.nybutik.module.return_.controller;

import com.nybutik.module.return_.dto.request.AdminUpdateReturnRequest;
import com.nybutik.module.return_.dto.response.ReturnResponse;
import com.nybutik.module.return_.dto.response.ReturnSummaryResponse;
import com.nybutik.module.return_.enums.ReturnStatus;
import com.nybutik.module.return_.service.ReturnService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.response.PageResponse;
import com.nybutik.shared.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/returns")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ApiResponse<PageResponse<ReturnSummaryResponse>> listReturns(
            @RequestParam(required = false) ReturnStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.ok(returnService.adminListReturns(status, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ReturnResponse> getReturn(@PathVariable Long id) {
        return ApiResponse.ok(returnService.adminGetReturn(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<ReturnResponse> updateReturn(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateReturnRequest req) {
        return ApiResponse.ok(returnService.adminUpdateReturn(id, req, SecurityUtils.currentUserId()));
    }
}
