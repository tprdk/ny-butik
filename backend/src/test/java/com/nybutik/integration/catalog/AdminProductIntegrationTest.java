package com.nybutik.integration.catalog;

import com.nybutik.BaseIntegrationTest;
import com.nybutik.module.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Admin — Ürün Yönetimi")
class AdminProductIntegrationTest extends BaseIntegrationTest {

    @MockBean
    private StorageService storageService;

    private String adminToken;
    private String customerToken;
    private Long categoryId;

    @BeforeEach
    void setUp() throws Exception {
        when(storageService.upload(any(), anyString()))
                .thenReturn("http://minio/ny-butik-images/products/1/test.jpg");

        adminToken = getAdminToken("admin-products@test.com");
        customerToken = registerAndGetToken("customer@test.com");

        // Kategori oluştur
        String catBody = """
                {"name":"Elbise","isActive":true}
                """;
        MvcResult catResult = mockMvc.perform(
                        post("/api/v1/admin/categories")
                                .header("Authorization", bearer(adminToken))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(catBody))
                .andExpect(status().isCreated())
                .andReturn();
        categoryId = extractId(catResult);
    }

    private String productPayload(String name, List<String> tags) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "categoryId", categoryId,
                "name", name,
                "shortDesc", "Test açıklama",
                "featured", false,
                "tags", tags,
                "variants", List.of(Map.of(
                        "sku", name.replaceAll("\\s", "-").toUpperCase() + "-001",
                        "price", 199.90,
                        "stockQuantity", 10
                ))
        ));
    }

    // ── Ürün Oluşturma ────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /admin/products — admin 201 ile oluşturur")
    void createProduct_asAdmin_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Yeni Elbise", List.of("elbise"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Yeni Elbise"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.slug").value("yeni-elbise"));
    }

    @Test
    @DisplayName("POST /admin/products — müşteri 403 alır")
    void createProduct_asCustomer_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(customerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Ürün", List.of())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /admin/products — auth olmadan 401 alır")
    void createProduct_withoutAuth_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Ürün", List.of())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /admin/products — eksik zorunlu alan 422 döner")
    void createProduct_missingName_returns422() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("categoryId", categoryId));
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── Ürün Güncelleme ───────────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /admin/products/{id} — aynı tag'larla iki kez güncelleme constraint hatası vermez")
    void updateProduct_sameTagsTwice_noConstraintViolation() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Tesettür Elbise", List.of("tesettür", "elbise"))))
                .andExpect(status().isCreated())
                .andReturn();
        Long id = extractId(created);

        String updatePayload = productPayload("Tesettür Elbise", List.of("tesettür", "elbise"));

        // 1. güncelleme
        mockMvc.perform(put("/api/v1/admin/products/" + id)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk());

        // 2. güncelleme — aynı tag'lar, constraint hatası olmaz
        mockMvc.perform(put("/api/v1/admin/products/" + id)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tags").isArray());
    }

    @Test
    @DisplayName("PUT /admin/products/{id} — tag'lar değiştirilebilir")
    void updateProduct_tagsCanChange() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Tag Test", List.of("eski-tag"))))
                .andReturn();
        Long id = extractId(created);

        String updated = productPayload("Tag Test", List.of("yeni-tag", "başka-tag"));
        mockMvc.perform(put("/api/v1/admin/products/" + id)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updated))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tags.length()").value(2));
    }

    // ── Durum Güncelleme ──────────────────────────────────────────────────────

    @Test
    @DisplayName("PATCH /admin/products/{id}/status — DRAFT → ACTIVE")
    void updateStatus_draftToActive() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Durum Test", List.of())))
                .andReturn();
        Long id = extractId(created);

        mockMvc.perform(patch("/api/v1/admin/products/" + id + "/status?status=ACTIVE")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("PATCH /admin/products/{id}/status — ACTIVE → PASSIVE, public listede görünmez")
    void updateStatus_activeToPassive_hiddenFromPublic() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Gizlenecek Ürün", List.of())))
                .andReturn();
        Long id = extractId(created);

        mockMvc.perform(patch("/api/v1/admin/products/" + id + "/status?status=ACTIVE")
                .header("Authorization", bearer(adminToken)));

        // Önce aktifken görünür
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(jsonPath("$.data.totalElements").value(1));

        // Pasife al
        mockMvc.perform(patch("/api/v1/admin/products/" + id + "/status?status=PASSIVE")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PASSIVE"));

        // Artık public listede görünmez
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ── Ürün Listesi (Admin) ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /admin/products — status filtresi olmadan tüm durumlar döner")
    void listAdminProducts_noStatusFilter_returnsAll() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(productPayload("Draft Ürün", List.of())));

        MvcResult r2 = mockMvc.perform(post("/api/v1/admin/products")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(productPayload("Aktif Ürün", List.of()))).andReturn();
        mockMvc.perform(patch("/api/v1/admin/products/" + extractId(r2) + "/status?status=ACTIVE")
                .header("Authorization", bearer(adminToken)));

        // Tümü — 2 ürün görünmeli
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /admin/products?status=ACTIVE — sadece aktif ürünler")
    void listAdminProducts_statusFilter_returnFiltered() throws Exception {
        mockMvc.perform(post("/api/v1/admin/products")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(productPayload("Draft Ürün", List.of())));

        MvcResult r2 = mockMvc.perform(post("/api/v1/admin/products")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(productPayload("Aktif Ürün", List.of()))).andReturn();
        mockMvc.perform(patch("/api/v1/admin/products/" + extractId(r2) + "/status?status=ACTIVE")
                .header("Authorization", bearer(adminToken)));

        mockMvc.perform(get("/api/v1/admin/products?status=ACTIVE")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].name").value("Aktif Ürün"));

        mockMvc.perform(get("/api/v1/admin/products?status=DRAFT")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].name").value("Draft Ürün"));
    }

    // ── Silme ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /admin/products/{id} — soft-delete, public listede görünmez")
    void deleteProduct_softDeletesAndHidesFromPublic() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Silinecek Ürün", List.of())))
                .andReturn();
        Long id = extractId(created);
        mockMvc.perform(patch("/api/v1/admin/products/" + id + "/status?status=ACTIVE")
                .header("Authorization", bearer(adminToken)));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(jsonPath("$.data.totalElements").value(1));

        mockMvc.perform(delete("/api/v1/admin/products/" + id)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());

        // Silinen ürün public listede görünmez
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ── Görsel Yükleme ────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /admin/products/{id}/images — geçerli JPEG yükler")
    void uploadImage_validJpeg_returns201() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Görsel Test Ürün", List.of())))
                .andReturn();
        Long id = extractId(created);

        MockMultipartFile image = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{0x01, 0x02, 0x03});

        mockMvc.perform(multipart("/api/v1/admin/products/" + id + "/images")
                        .file(image)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url").isNotEmpty())
                .andExpect(jsonPath("$.data.isPrimary").value(true));
    }

    @Test
    @DisplayName("POST /admin/products/{id}/images — desteklenmeyen format reddedilir")
    void uploadImage_invalidMimeType_returns400() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Format Test", List.of())))
                .andReturn();
        Long id = extractId(created);

        MockMultipartFile pdf = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46});

        mockMvc.perform(multipart("/api/v1/admin/products/" + id + "/images")
                        .file(pdf)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /admin/products/{id}/images/{imageId} — görsel silinir")
    void deleteImage_removes() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Görsel Silme Test", List.of())))
                .andReturn();
        Long id = extractId(created);

        MockMultipartFile image = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{0x01});
        MvcResult uploadResult = mockMvc.perform(
                        multipart("/api/v1/admin/products/" + id + "/images")
                                .file(image)
                                .header("Authorization", bearer(adminToken)))
                .andReturn();
        Long imageId = extractId(uploadResult);

        mockMvc.perform(delete("/api/v1/admin/products/" + id + "/images/" + imageId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /admin/products/{id}/images/{imageId}/primary — kapak değiştirilir")
    void setPrimary_changesMainImage() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Primary Test", List.of())))
                .andReturn();
        Long id = extractId(created);

        when(storageService.upload(any(), anyString()))
                .thenReturn("http://minio/products/1/img1.jpg")
                .thenReturn("http://minio/products/1/img2.jpg");

        MockMultipartFile img1 = new MockMultipartFile("file", "img1.jpg", "image/jpeg", new byte[]{0x01});
        MockMultipartFile img2 = new MockMultipartFile("file", "img2.jpg", "image/jpeg", new byte[]{0x02});

        mockMvc.perform(multipart("/api/v1/admin/products/" + id + "/images")
                .file(img1).header("Authorization", bearer(adminToken)));
        MvcResult img2Result = mockMvc.perform(
                        multipart("/api/v1/admin/products/" + id + "/images")
                                .file(img2).header("Authorization", bearer(adminToken)))
                .andReturn();
        Long img2Id = extractId(img2Result);

        mockMvc.perform(patch("/api/v1/admin/products/" + id + "/images/" + img2Id + "/primary")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPrimary").value(true));
    }
}
