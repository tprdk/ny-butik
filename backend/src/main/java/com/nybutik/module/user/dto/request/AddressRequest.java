package com.nybutik.module.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(

        @Size(max = 100)
        String label,

        @NotBlank(message = "Ad boş olamaz.")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "Soyad boş olamaz.")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "Telefon boş olamaz.")
        @Pattern(regexp = "^(\\+90|0)?[0-9]{10}$", message = "Geçerli bir telefon numarası giriniz.")
        String phone,

        @NotBlank(message = "Adres boş olamaz.")
        @Size(max = 255)
        String addressLine1,

        @Size(max = 255)
        String addressLine2,

        @NotBlank(message = "Şehir boş olamaz.")
        @Size(max = 100)
        String city,

        @NotBlank(message = "İlçe boş olamaz.")
        @Size(max = 100)
        String district,

        @NotBlank(message = "Posta kodu boş olamaz.")
        @Size(max = 10)
        String postalCode,

        boolean isDefault
) {}
