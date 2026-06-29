package com.nybutik.module.return_.controller;

import com.nybutik.module.return_.dto.request.CreateReturnRequest;
import com.nybutik.module.return_.dto.response.ReturnResponse;
import com.nybutik.module.return_.dto.response.ReturnSummaryResponse;
import com.nybutik.module.return_.service.ReturnService;
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
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReturnResponse> createReturn(@Valid @RequestBody CreateReturnRequest req) {
        return ApiResponse.ok(returnService.createReturn(SecurityUtils.currentUserId(), req));
    }

    @GetMapping
    public ApiResponse<PageResponse<ReturnSummaryResponse>> getMyReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.ok(returnService.getMyReturns(SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ReturnResponse> getMyReturn(@PathVariable Long id) {
        return ApiResponse.ok(returnService.getMyReturn(SecurityUtils.currentUserId(), id));
    }
}
