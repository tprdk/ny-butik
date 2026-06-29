package com.nybutik.integration.auth;

import com.nybutik.BaseIntegrationTest;
import com.nybutik.module.user.dto.request.LoginRequest;
import com.nybutik.module.user.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Auth — Kimlik Doğrulama")
class AuthIntegrationTest extends BaseIntegrationTest {

    @Test
    void register_withValidData_returns201() throws Exception {
        var request = new RegisterRequest("Ayşe", "Demir", "ayse@test.com", "Sifre123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("ayse@test.com"));
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        var request = new RegisterRequest("Test", "User", "duplicate@test.com", "Sifre123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        var register = new RegisterRequest("Ali", "Yılmaz", "ali@test.com", "Sifre123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)));

        var login = new LoginRequest("ali@test.com", "YanlisŞifre1!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_withWeakPassword_returns422() throws Exception {
        var request = new RegisterRequest("Test", "User", "weak@test.com", "zayif");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors").isArray());
    }
}
