package com.nybutik.module.user.controller;

import com.nybutik.module.user.dto.request.LoginRequest;
import com.nybutik.module.user.dto.request.RegisterRequest;
import com.nybutik.module.user.dto.response.AuthResponse;
import com.nybutik.module.user.service.AuthService;
import com.nybutik.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Kimlik doğrulama işlemleri")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Yeni kullanıcı kaydı")
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(authService.register(request, response));
    }

    @PostMapping("/login")
    @Operation(summary = "Giriş — access token + refresh cookie döner")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Access token yenileme (refresh cookie kullanır)")
    public ApiResponse<AuthResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.ok(authService.refresh(request, response));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Çıkış — refresh token iptal edilir")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
    }
}
