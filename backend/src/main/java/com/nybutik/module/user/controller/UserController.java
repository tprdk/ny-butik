package com.nybutik.module.user.controller;

import com.nybutik.module.user.dto.request.AddressRequest;
import com.nybutik.module.user.dto.request.ChangePasswordRequest;
import com.nybutik.module.user.dto.request.UpdateProfileRequest;
import com.nybutik.module.user.dto.response.AddressResponse;
import com.nybutik.module.user.dto.response.UserResponse;
import com.nybutik.module.user.service.AddressService;
import com.nybutik.module.user.service.UserService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User", description = "Kullanıcı profil ve adres yönetimi")
public class UserController {

    private final UserService userService;
    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Profil bilgisi")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.ok(userService.getProfile(SecurityUtils.currentUserId()));
    }

    @PutMapping
    @Operation(summary = "Profil güncelleme")
    public ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(userService.updateProfile(SecurityUtils.currentUserId(), request));
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Şifre değiştirme")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(SecurityUtils.currentUserId(), request);
    }

    // Adresler

    @GetMapping("/addresses")
    @Operation(summary = "Adres listesi")
    public ApiResponse<List<AddressResponse>> listAddresses() {
        return ApiResponse.ok(addressService.listAddresses(SecurityUtils.currentUserId()));
    }

    @PostMapping("/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yeni adres ekle")
    public ApiResponse<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        return ApiResponse.ok(addressService.createAddress(SecurityUtils.currentUserId(), request));
    }

    @PutMapping("/addresses/{id}")
    @Operation(summary = "Adres güncelle")
    public ApiResponse<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        return ApiResponse.ok(addressService.updateAddress(SecurityUtils.currentUserId(), id, request));
    }

    @DeleteMapping("/addresses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Adres sil")
    public void deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(SecurityUtils.currentUserId(), id);
    }

    @PatchMapping("/addresses/{id}/default")
    @Operation(summary = "Varsayılan adres ayarla")
    public ApiResponse<AddressResponse> setDefaultAddress(@PathVariable Long id) {
        return ApiResponse.ok(addressService.setDefault(SecurityUtils.currentUserId(), id));
    }
}
