package com.nybutik.module.catalog.service;

import com.nybutik.module.catalog.dto.response.ProductImageResponse;
import com.nybutik.module.catalog.entity.Product;
import com.nybutik.module.catalog.entity.ProductImage;
import com.nybutik.module.catalog.mapper.ProductMapper;
import com.nybutik.module.storage.StorageService;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductImageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024L;

    private final StorageService storageService;
    private final ProductService productService;
    private final ProductMapper productMapper;
    private final com.nybutik.module.catalog.repository.ProductImageRepository productImageRepository;

    @Transactional
    public ProductImageResponse upload(Long productId, MultipartFile file, String altText) {
        validateFile(file);
        Product product = productService.findById(productId);

        String url = storageService.upload(file, "products/" + productId);
        boolean isFirst = product.getImages().isEmpty();

        ProductImage image = ProductImage.builder()
                .product(product)
                .url(url)
                .altText(altText)
                .displayOrder(product.getImages().size())
                .isPrimary(isFirst)
                .build();

        product.getImages().add(image);
        // Direkt kaydet: IDENTITY stratejisinde cascade yerine doğrudan save ID'yi anında üretir
        ProductImage saved = productImageRepository.save(image);
        return productMapper.toImageResponse(saved);
    }

    @Transactional
    public void delete(Long productId, Long imageId) {
        Product product = productService.findById(productId);
        ProductImage image = findImage(product, imageId);

        storageService.delete(image.getUrl());
        product.getImages().remove(image);

        // Eğer silinen primary ise, kalan ilk görseli primary yap
        if (Boolean.TRUE.equals(image.getIsPrimary()) && !product.getImages().isEmpty()) {
            product.getImages().get(0).setIsPrimary(true);
        }
    }

    @Transactional
    public List<ProductImageResponse> reorder(Long productId, List<Long> imageIds) {
        Product product = productService.findById(productId);

        for (int i = 0; i < imageIds.size(); i++) {
            final int order = i;
            ProductImage img = findImage(product, imageIds.get(i));
            img.setDisplayOrder(order);
        }

        product.getImages().sort((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()));
        return product.getImages().stream().map(productMapper::toImageResponse).toList();
    }

    @Transactional
    public ProductImageResponse setPrimary(Long productId, Long imageId) {
        Product product = productService.findById(productId);

        product.getImages().forEach(img -> img.setIsPrimary(false));
        ProductImage target = findImage(product, imageId);
        target.setIsPrimary(true);

        return productMapper.toImageResponse(target);
    }

    private ProductImage findImage(Product product, Long imageId) {
        return product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Görsel", imageId));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Dosya boş olamaz", HttpStatus.BAD_REQUEST, "EMPTY_FILE");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BusinessException(
                    "Desteklenmeyen dosya türü. Geçerli türler: JPEG, PNG, WEBP",
                    HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("Dosya boyutu 5MB'ı aşamaz", HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE");
        }
    }
}
