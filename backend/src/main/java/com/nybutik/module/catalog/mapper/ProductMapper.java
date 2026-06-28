package com.nybutik.module.catalog.mapper;

import com.nybutik.module.catalog.dto.response.*;
import com.nybutik.module.catalog.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface ProductMapper {

    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    @Mapping(target = "primaryImageUrl", source = "product", qualifiedByName = "primaryImageUrl")
    @Mapping(target = "minPrice", source = "product", qualifiedByName = "minPrice")
    @Mapping(target = "maxPrice", source = "product", qualifiedByName = "maxPrice")
    @Mapping(target = "minSalePrice", source = "product", qualifiedByName = "minSalePrice")
    @Mapping(target = "inStock", source = "product", qualifiedByName = "inStock")
    ProductSummaryResponse toSummary(Product product);

    List<ProductSummaryResponse> toSummaryList(List<Product> products);

    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    @Mapping(target = "tags", source = "product", qualifiedByName = "tagStrings")
    @Mapping(target = "attributes", source = "attributes")
    ProductResponse toResponse(Product product);

    @Mapping(target = "effectivePrice", expression = "java(variant.getEffectivePrice())")
    @Mapping(target = "inStock", expression = "java(variant.isInStock())")
    ProductVariantResponse toVariantResponse(ProductVariant variant);

    @Mapping(target = "hexCode", source = "hexCode")
    ColorResponse toColorResponse(Color color);

    SizeResponse toSizeResponse(Size size);

    ProductImageResponse toImageResponse(ProductImage image);

    ProductAttributeResponse toAttributeResponse(ProductAttribute attribute);

    @Named("primaryImageUrl")
    default String primaryImageUrl(Product product) {
        return product.getImages().stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsPrimary()))
                .findFirst()
                .or(() -> product.getImages().stream().min(Comparator.comparingInt(ProductImage::getDisplayOrder)))
                .map(ProductImage::getUrl)
                .orElse(null);
    }

    @Named("minPrice")
    default BigDecimal minPrice(Product product) {
        return product.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }

    @Named("maxPrice")
    default BigDecimal maxPrice(Product product) {
        return product.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(ProductVariant::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(null);
    }

    @Named("minSalePrice")
    default BigDecimal minSalePrice(Product product) {
        return product.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()) && v.getSalePrice() != null)
                .map(ProductVariant::getSalePrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }

    @Named("inStock")
    default Boolean inStock(Product product) {
        return product.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .anyMatch(ProductVariant::isInStock);
    }

    @Named("tagStrings")
    default List<String> tagStrings(Product product) {
        return product.getTags().stream().map(ProductTag::getTag).toList();
    }
}
