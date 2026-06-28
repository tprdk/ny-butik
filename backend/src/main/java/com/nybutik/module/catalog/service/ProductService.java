package com.nybutik.module.catalog.service;

import com.nybutik.module.catalog.dto.request.ProductRequest;
import com.nybutik.module.catalog.dto.request.ProductVariantRequest;
import com.nybutik.module.catalog.dto.response.ProductResponse;
import com.nybutik.module.catalog.dto.response.ProductSummaryResponse;
import com.nybutik.module.catalog.entity.*;
import com.nybutik.module.catalog.enums.ProductStatus;
import com.nybutik.module.catalog.mapper.ProductMapper;
import com.nybutik.module.catalog.repository.ColorRepository;
import com.nybutik.module.catalog.repository.ProductRepository;
import com.nybutik.module.catalog.repository.SizeRepository;
import com.nybutik.module.catalog.repository.specification.ProductSpecification;
import com.nybutik.shared.exception.ConflictException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import com.nybutik.shared.response.PageResponse;
import com.nybutik.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;
    private final CategoryService categoryService;
    private final ProductMapper productMapper;

    public PageResponse<ProductSummaryResponse> list(
            Long categoryId, List<Long> colorIds, List<Long> sizeIds,
            BigDecimal minPrice, BigDecimal maxPrice, String search,
            Boolean featured, Pageable pageable) {

        Specification<Product> spec = ProductSpecification.buildFilter(
                categoryId, colorIds, sizeIds, minPrice, maxPrice, search, featured, ProductStatus.ACTIVE);

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(productMapper::toSummary));
    }

    public PageResponse<ProductSummaryResponse> listForAdmin(
            Long categoryId, String search, ProductStatus status, Pageable pageable) {

        Specification<Product> spec = ProductSpecification.buildFilter(
                categoryId, null, null, null, null, search, null, status);

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(productMapper::toSummary));
    }

    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", slug));
        return productMapper.toResponse(product);
    }

    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findById(id));
    }

    public PageResponse<ProductSummaryResponse> getFeatured(int size) {
        Page<Product> page = productRepository.findFeatured(
                ProductStatus.ACTIVE, Pageable.ofSize(size));
        return PageResponse.from(page.map(productMapper::toSummary));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String slug = generateUniqueSlug(request.name());

        Product product = Product.builder()
                .category(categoryService.findById(request.categoryId()))
                .name(request.name())
                .slug(slug)
                .shortDesc(request.shortDesc())
                .description(request.description())
                .status(ProductStatus.DRAFT)
                .featured(request.featured() != null ? request.featured() : false)
                .build();

        addTags(product, request.tags());
        addAttributes(product, request.attributes());
        addVariants(product, request.variants());

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);

        if (!product.getName().equals(request.name())) {
            product.setSlug(generateUniqueSlug(request.name()));
            product.setName(request.name());
        }

        product.setCategory(categoryService.findById(request.categoryId()));
        product.setShortDesc(request.shortDesc());
        product.setDescription(request.description());
        if (request.featured() != null) product.setFeatured(request.featured());

        product.getTags().clear();
        product.getAttributes().clear();
        product.getVariants().clear();

        addTags(product, request.tags());
        addAttributes(product, request.attributes());
        addVariants(product, request.variants());

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateStatus(Long id, ProductStatus status) {
        Product product = findById(id);
        product.setStatus(status);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        product.setDeletedAt(Instant.now());
        product.setStatus(ProductStatus.PASSIVE);
        productRepository.save(product);
    }

    public Product findById(Long id) {
        return productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", id));
    }

    private String generateUniqueSlug(String name) {
        String base = SlugUtils.toSlug(name);
        String slug = base;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private void addTags(Product product, List<String> tags) {
        if (tags == null) return;
        tags.forEach(t -> {
            ProductTag tag = ProductTag.builder().product(product).tag(t).build();
            product.getTags().add(tag);
        });
    }

    private void addAttributes(Product product, Map<String, String> attributes) {
        if (attributes == null) return;
        int order = 0;
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            ProductAttribute attr = ProductAttribute.builder()
                    .product(product)
                    .attrKey(entry.getKey())
                    .attrValue(entry.getValue())
                    .displayOrder(order++)
                    .build();
            product.getAttributes().add(attr);
        }
    }

    private void addVariants(Product product, List<ProductVariantRequest> variantRequests) {
        if (variantRequests == null) return;
        variantRequests.forEach(req -> {
            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .sku(req.sku())
                    .price(req.price())
                    .salePrice(req.salePrice())
                    .stockQuantity(req.stockQuantity() != null ? req.stockQuantity() : 0)
                    .isActive(req.isActive() != null ? req.isActive() : true)
                    .build();

            if (req.colorId() != null) {
                variant.setColor(colorRepository.findById(req.colorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Renk", req.colorId())));
            }
            if (req.sizeId() != null) {
                variant.setSize(sizeRepository.findById(req.sizeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Beden", req.sizeId())));
            }

            product.getVariants().add(variant);
        });
    }
}
