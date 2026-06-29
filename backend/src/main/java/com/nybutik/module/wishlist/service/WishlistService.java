package com.nybutik.module.wishlist.service;

import com.nybutik.module.catalog.entity.Product;
import com.nybutik.module.catalog.entity.ProductImage;
import com.nybutik.module.catalog.repository.ProductRepository;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.service.UserService;
import com.nybutik.module.wishlist.dto.WishlistItemResponse;
import com.nybutik.module.wishlist.entity.Wishlist;
import com.nybutik.module.wishlist.repository.WishlistRepository;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    public List<WishlistItemResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserIdWithProduct(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Set<Long> getWishlistedProductIds(Long userId) {
        return wishlistRepository.findProductIdsByUserId(userId);
    }

    @Transactional
    public WishlistItemResponse addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            return wishlistRepository.findByUserIdAndProductId(userId, productId)
                    .map(this::toResponse)
                    .orElseThrow();
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", productId));
        User user = userService.findById(userId);

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        return toResponse(wishlistRepository.save(wishlist));
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public boolean isWishlisted(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistItemResponse toResponse(Wishlist w) {
        Product p = w.getProduct();
        String imageUrl = p.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .map(ProductImage::getUrl)
                .findFirst().orElse(null);

        BigDecimal minPrice = p.getVariants().stream()
                .map(v -> v.getPrice())
                .min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        BigDecimal minSalePrice = p.getVariants().stream()
                .filter(v -> v.getSalePrice() != null)
                .map(v -> v.getSalePrice())
                .min(BigDecimal::compareTo).orElse(null);

        boolean inStock = p.getVariants().stream().anyMatch(v -> v.getStockQuantity() > 0);

        return new WishlistItemResponse(
                w.getId(), p.getId(), p.getName(), p.getSlug(),
                imageUrl, minPrice, minSalePrice, inStock, w.getCreatedAt()
        );
    }
}
