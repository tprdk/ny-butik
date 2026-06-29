package com.nybutik.module.user.controller;

import com.nybutik.module.user.dto.response.CustomerResponse;
import com.nybutik.module.user.dto.response.CustomerSummaryResponse;
import com.nybutik.module.user.service.AdminCustomerService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ApiResponse<PageResponse<CustomerSummaryResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminCustomerService.listCustomers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(adminCustomerService.getCustomer(id));
    }

    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<CustomerResponse> toggleActive(@PathVariable Long id) {
        return ApiResponse.ok(adminCustomerService.toggleActive(id));
    }
}
