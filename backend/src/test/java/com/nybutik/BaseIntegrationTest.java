package com.nybutik;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nybutik.module.user.dto.request.LoginRequest;
import com.nybutik.module.user.dto.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public abstract class BaseIntegrationTest {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected JdbcTemplate jdbcTemplate;

    protected String registerAndGetToken(String email) throws Exception {
        return registerAndGetToken("Test", "Kullanıcı", email, "Sifre123!");
    }

    protected String registerAndGetToken(String firstName, String lastName, String email, String password) throws Exception {
        var request = new RegisterRequest(firstName, lastName, email, password);
        MvcResult result = mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractToken(result);
    }

    protected String getAdminToken(String email) throws Exception {
        registerAndGetToken(email);
        jdbcTemplate.update("UPDATE users SET role = 'ADMIN' WHERE email = ?", email);
        var login = new LoginRequest(email, "Sifre123!");
        MvcResult result = mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        return extractToken(result);
    }

    protected String extractToken(MvcResult result) throws Exception {
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.at("/data/accessToken").asText();
    }

    protected Long extractId(MvcResult result) throws Exception {
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.at("/data/id").asLong();
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }
}
