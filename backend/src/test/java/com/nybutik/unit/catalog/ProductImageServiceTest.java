package com.nybutik.unit.catalog;

import com.nybutik.module.catalog.dto.response.ProductImageResponse;
import com.nybutik.module.catalog.entity.Product;
import com.nybutik.module.catalog.entity.ProductImage;
import com.nybutik.module.catalog.mapper.ProductMapper;
import com.nybutik.module.catalog.service.ProductImageService;
import com.nybutik.module.catalog.service.ProductService;
import com.nybutik.module.storage.StorageService;
import com.nybutik.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ProductImageService — Unit Testler")
class ProductImageServiceTest {

    @Mock StorageService storageService;
    @Mock ProductService productService;
    @Mock ProductMapper productMapper;
    @Mock com.nybutik.module.catalog.repository.ProductImageRepository productImageRepository;

    @InjectMocks
    ProductImageService productImageService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder().build();
        product.setImages(new ArrayList<>());
    }

    // ── Dosya Validasyonu ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Desteklenmeyen MIME türü BusinessException fırlatır")
    void upload_withInvalidMimeType_throwsBusinessException() {
        MultipartFile file = mockFile("application/pdf", 1024L, false);

        assertThatThrownBy(() -> productImageService.upload(1L, file, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Desteklenmeyen dosya türü");
    }

    @Test
    @DisplayName("5MB'ı aşan dosya BusinessException fırlatır")
    void upload_withFileTooLarge_throwsBusinessException() {
        MultipartFile file = mockFile("image/jpeg", 6 * 1024 * 1024L, false);

        assertThatThrownBy(() -> productImageService.upload(1L, file, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("5MB");
    }

    @Test
    @DisplayName("Boş dosya BusinessException fırlatır")
    void upload_withEmptyFile_throwsBusinessException() {
        MultipartFile file = mockFile("image/jpeg", 0L, true);

        assertThatThrownBy(() -> productImageService.upload(1L, file, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Dosya boş olamaz");
    }

    @Test
    @DisplayName("Geçerli JPEG dosyası başarıyla yüklenir")
    void upload_withValidJpeg_returnsImageResponse() {
        MultipartFile file = mockFile("image/jpeg", 1024L, false);
        when(productService.findById(1L)).thenReturn(product);
        when(storageService.upload(any(), anyString())).thenReturn("http://storage/img.jpg");
        ProductImage savedImage = ProductImage.builder().id(1L).url("http://storage/img.jpg").isPrimary(true).displayOrder(0).build();
        when(productImageRepository.save(any(ProductImage.class))).thenReturn(savedImage);

        ProductImageResponse expected = new ProductImageResponse(1L, "http://storage/img.jpg", null, 0, true);
        when(productMapper.toImageResponse(any(ProductImage.class))).thenReturn(expected);

        ProductImageResponse result = productImageService.upload(1L, file, null);

        assertNotNull(result);
        assertEquals("http://storage/img.jpg", result.url());
        verify(storageService).upload(file, "products/1");
    }

    @Test
    @DisplayName("İlk yüklenen görsel otomatik primary olur")
    void upload_firstImage_isPrimary() {
        MultipartFile file = mockFile("image/jpeg", 1024L, false);
        when(productService.findById(1L)).thenReturn(product);
        when(storageService.upload(any(), anyString())).thenReturn("http://storage/img.jpg");
        ProductImage savedImage = ProductImage.builder().id(1L).url("http://storage/img.jpg").isPrimary(true).displayOrder(0).build();
        when(productImageRepository.save(any(ProductImage.class))).thenReturn(savedImage);

        ProductImageResponse expected = new ProductImageResponse(1L, "http://storage/img.jpg", null, 0, true);
        when(productMapper.toImageResponse(any(ProductImage.class))).thenReturn(expected);

        product.getImages().clear(); // boş liste
        ProductImageResponse result = productImageService.upload(1L, file, null);

        assertTrue(result.isPrimary());
    }

    @Test
    @DisplayName("PNG ve WEBP formatları kabul edilir")
    void upload_withPngAndWebp_accepted() {
        for (String mime : List.of("image/png", "image/webp")) {
            MultipartFile file = mockFile(mime, 1024L, false);
            when(productService.findById(1L)).thenReturn(product);
            when(storageService.upload(any(), anyString())).thenReturn("http://storage/img");
            when(productImageRepository.save(any(ProductImage.class))).thenReturn(
                    ProductImage.builder().id(1L).url("http://storage/img").isPrimary(false).displayOrder(0).build());
            when(productMapper.toImageResponse(any())).thenReturn(
                    new ProductImageResponse(1L, "http://storage/img", null, 0, false));

            assertDoesNotThrow(() -> productImageService.upload(1L, file, null),
                    mime + " kabul edilmeli");

            product.getImages().clear(); // sonraki iterasyon için sıfırla
        }
    }

    // ── Primary Yönetimi ──────────────────────────────────────────────────────

    @Test
    @DisplayName("setPrimary — sadece seçilen görsel primary olur, diğerleri false")
    void setPrimary_setsOnlySelectedAsPrimary() {
        ProductImage img1 = buildImage(1L, true, 0);
        ProductImage img2 = buildImage(2L, false, 1);
        product.setImages(new ArrayList<>(List.of(img1, img2)));

        when(productService.findById(1L)).thenReturn(product);
        when(productMapper.toImageResponse(img2)).thenReturn(
                new ProductImageResponse(2L, "url2", null, 1, true));

        productImageService.setPrimary(1L, 2L);

        assertFalse(img1.getIsPrimary());
        assertTrue(img2.getIsPrimary());
    }

    // ── Silme ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Primary görsel silinirse sonraki görsel primary olur")
    void delete_primaryImage_setsNextAsPrimary() {
        ProductImage img1 = buildImage(1L, true, 0);
        ProductImage img2 = buildImage(2L, false, 1);
        product.setImages(new ArrayList<>(List.of(img1, img2)));

        when(productService.findById(1L)).thenReturn(product);
        doNothing().when(storageService).delete(anyString());

        productImageService.delete(1L, 1L);

        assertFalse(product.getImages().contains(img1));
        assertTrue(img2.getIsPrimary());
    }

    @Test
    @DisplayName("Non-primary görsel silinirse primary değişmez")
    void delete_nonPrimaryImage_primaryUnchanged() {
        ProductImage img1 = buildImage(1L, true, 0);
        ProductImage img2 = buildImage(2L, false, 1);
        product.setImages(new ArrayList<>(List.of(img1, img2)));

        when(productService.findById(1L)).thenReturn(product);
        doNothing().when(storageService).delete(anyString());

        productImageService.delete(1L, 2L);

        assertTrue(img1.getIsPrimary());
        assertEquals(1, product.getImages().size());
    }

    // ── Sıralama ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("reorder — verilen sıraya göre displayOrder güncellenir")
    void reorder_updatesDisplayOrder() {
        ProductImage img1 = buildImage(1L, true, 0);
        ProductImage img2 = buildImage(2L, false, 1);
        ProductImage img3 = buildImage(3L, false, 2);
        product.setImages(new ArrayList<>(List.of(img1, img2, img3)));

        when(productService.findById(1L)).thenReturn(product);
        when(productMapper.toImageResponse(any())).thenAnswer(inv -> {
            ProductImage img = inv.getArgument(0);
            return new ProductImageResponse(img.getId(), "url", null, img.getDisplayOrder(), img.getIsPrimary());
        });

        // Yeni sıra: img3, img1, img2
        List<ProductImageResponse> result = productImageService.reorder(1L, List.of(3L, 1L, 2L));

        assertEquals(3, result.size());
        // img3 → 0, img1 → 1, img2 → 2
        assertEquals(0, img3.getDisplayOrder());
        assertEquals(1, img1.getDisplayOrder());
        assertEquals(2, img2.getDisplayOrder());
    }

    // ── Yardımcı metodlar ─────────────────────────────────────────────────────

    private MultipartFile mockFile(String contentType, long size, boolean empty) {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(empty);
        if (!empty) {
            when(file.getContentType()).thenReturn(contentType);
            when(file.getSize()).thenReturn(size);
        }
        return file;
    }

    private ProductImage buildImage(Long id, boolean isPrimary, int order) {
        return ProductImage.builder()
                .id(id)
                .url("http://storage/img-" + id + ".jpg")
                .isPrimary(isPrimary)
                .displayOrder(order)
                .build();
    }
}
