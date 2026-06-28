package com.nybutik.module.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Ad boş olamaz.")
        @Size(min = 2, max = 100)
        String firstName,

        @NotBlank(message = "Soyad boş olamaz.")
        @Size(min = 2, max = 100)
        String lastName,

        @Pattern(regexp = "^(\\+90|0)?[0-9]{10}$", message = "Geçerli bir telefon numarası giriniz.")
        String phone
) {}
