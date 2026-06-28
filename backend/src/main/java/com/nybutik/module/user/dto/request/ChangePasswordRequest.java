package com.nybutik.module.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "Mevcut şifre boş olamaz.")
        String currentPassword,

        @NotBlank(message = "Yeni şifre boş olamaz.")
        @Size(min = 8, max = 100, message = "Şifre en az 8 karakter olmalıdır.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir."
        )
        String newPassword
) {}
