package com.nybutik.module.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Ad boş olamaz.")
        @Size(min = 2, max = 100, message = "Ad 2-100 karakter arasında olmalıdır.")
        String firstName,

        @NotBlank(message = "Soyad boş olamaz.")
        @Size(min = 2, max = 100, message = "Soyad 2-100 karakter arasında olmalıdır.")
        String lastName,

        @NotBlank(message = "E-posta boş olamaz.")
        @Email(message = "Geçerli bir e-posta adresi giriniz.")
        @Size(max = 255)
        String email,

        @NotBlank(message = "Şifre boş olamaz.")
        @Size(min = 8, max = 100, message = "Şifre en az 8 karakter olmalıdır.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir."
        )
        String password
) {}
