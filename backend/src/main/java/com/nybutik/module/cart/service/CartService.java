package com.nybutik.module.cart.service;

import com.nybutik.module.cart.dto.request.AddItemRequest;
import com.nybutik.module.cart.dto.request.UpdateItemRequest;
import com.nybutik.module.cart.dto.response.CartItemResponse;
import com.nybutik.module.cart.dto.response.CartResponse;
import com.nybutik.module.cart.entity.Cart;
import com.nybutik.module.cart.entity.CartItem;
import com.nybutik.module.cart.repository.CartItemRepository;
import com.nybutik.module.cart.repository.CartRepository;
import com.nybutik.module.catalog.entity.Product;
import com.nybutik.module.catalog.entity.ProductImage;
import com.nybutik.module.catalog.entity.ProductVariant;
import com.nybutik.module.catalog.repository.ProductVariantRepository;
import com.nybutik.module.coupon.entity.Coupon;
import com.nybutik.module.coupon.service.CouponService;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.repository.UserRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500.00");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("49.90");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;

    public CartResponse get(Long userId, String sessionId) {
        Cart cart = resolveCart(userId, sessionId);
        return cart == null ? emptyCart() : toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, String sessionId, AddItemRequest req) {
        Cart cart = getOrCreate(userId, sessionId);

        ProductVariant variant = findVariant(req.variantId());
        if (!variant.getIsActive()) {
            throw new BusinessException("Bu varyant artık mevcut değil", HttpStatus.BAD_REQUEST, "VARIANT_INACTIVE");
        }
        if (variant.getStockQuantity() < req.quantity()) {
            throw new BusinessException(
                    "Yetersiz stok. Mevcut: " + variant.getStockQuantity(),
                    HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
        }

        Optional<CartItem> existing = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + req.quantity();
            if (variant.getStockQuantity() < newQty) {
                throw new BusinessException(
                        "Yetersiz stok. Mevcut: " + variant.getStockQuantity(),
                        HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }
            item.setQuantity(newQty);
            item.setUnitPrice(variant.getEffectivePrice());
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(req.quantity())
                    .unitPrice(variant.getEffectivePrice())
                    .build();
            cart.getItems().add(item);
        }

        return toResponse(cartRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse updateItem(Long userId, String sessionId, Long variantId, UpdateItemRequest req) {
        Cart cart = getOrCreate(userId, sessionId);
        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Sepet kalemi", variantId));

        if (item.getVariant().getStockQuantity() < req.quantity()) {
            throw new BusinessException(
                    "Yetersiz stok. Mevcut: " + item.getVariant().getStockQuantity(),
                    HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
        }

        item.setQuantity(req.quantity());
        return toResponse(cartRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse removeItem(Long userId, String sessionId, Long variantId) {
        Cart cart = getOrCreate(userId, sessionId);
        cartItemRepository.deleteByCartIdAndVariantId(cart.getId(), variantId);
        cart.getItems().removeIf(i -> i.getVariant().getId().equals(variantId));
        return toResponse(cartRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse clear(Long userId, String sessionId) {
        Cart cart = getOrCreate(userId, sessionId);
        cart.getItems().clear();
        cart.setCoupon(null);
        return toResponse(cartRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse applyCoupon(Long userId, String sessionId, String code) {
        Cart cart = getOrCreate(userId, sessionId);
        BigDecimal subtotal = calculateSubtotal(cart);
        Coupon coupon = couponService.validateAndGet(code, subtotal);
        cart.setCoupon(coupon);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeCoupon(Long userId, String sessionId) {
        Cart cart = getOrCreate(userId, sessionId);
        cart.setCoupon(null);
        return toResponse(cartRepository.save(cart));
    }

    // Guest sepetiyle müşteri sepetini birleştir — login sonrası çağrılır
    @Transactional
    public CartResponse merge(Long userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return get(userId, null);
        }

        Cart userCart = cartRepository.findByUserIdWithItems(userId).orElse(null);
        Cart guestCart = cartRepository.findBySessionIdWithItems(sessionId).orElse(null);

        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return get(userId, null);
        }

        if (userCart == null) {
            // Misafir sepetini kullanıcıya ata
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", userId));
            guestCart.setUser(user);
            guestCart.setSessionId(null);
            return toResponse(cartRepository.save(guestCart));
        }

        // İkisi de var — misafir kalemleri kullanıcı sepetine taşı
        for (CartItem guestItem : guestCart.getItems()) {
            Optional<CartItem> existing = cartItemRepository
                    .findByCartIdAndVariantId(userCart.getId(), guestItem.getVariant().getId());
            if (existing.isPresent()) {
                existing.get().setQuantity(existing.get().getQuantity() + guestItem.getQuantity());
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(userCart)
                        .variant(guestItem.getVariant())
                        .quantity(guestItem.getQuantity())
                        .unitPrice(guestItem.getUnitPrice())
                        .build();
                userCart.getItems().add(newItem);
            }
        }

        cartRepository.delete(guestCart);
        return toResponse(cartRepository.saveAndFlush(userCart));
    }

    // ── Yardımcı metodlar ─────────────────────────────────────────────────────

    private Cart resolveCart(Long userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserIdWithItems(userId).orElse(null);
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return cartRepository.findBySessionIdWithItems(sessionId).orElse(null);
        }
        return null;
    }

    private Cart getOrCreate(Long userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserIdWithItems(userId).orElseGet(() -> {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", userId));
                return cartRepository.save(Cart.builder().user(user).build());
            });
        }
        if (sessionId == null || sessionId.isBlank()) {
            throw new BusinessException("Oturum kimliği gereklidir", HttpStatus.BAD_REQUEST, "SESSION_REQUIRED");
        }
        return cartRepository.findBySessionIdWithItems(sessionId).orElseGet(() ->
                cartRepository.save(Cart.builder().sessionId(sessionId).build()));
    }

    private ProductVariant findVariant(Long variantId) {
        return productVariantRepository.findByIdWithDetails(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Varyant", variantId));
    }

    private BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        com.nybutik.module.coupon.dto.response.CouponResponse couponResp = null;
        if (cart.getCoupon() != null) {
            Coupon coupon = cart.getCoupon();
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
            couponResp = couponService.getById(coupon.getId());
        }

        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal shipping = afterDiscount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO : SHIPPING_COST;
        BigDecimal total = afterDiscount.add(shipping);

        return new CartResponse(cart.getId(), items, subtotal, discountAmount, shipping, total, couponResp);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        Product product = variant.getProduct();

        String imageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .map(ProductImage::getUrl)
                .findFirst()
                .orElse(null);

        String colorName = variant.getColor() != null ? variant.getColor().getName() : null;
        String sizeName = variant.getSize() != null ? variant.getSize().getName() : null;

        return new CartItemResponse(
                variant.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                imageUrl,
                variant.getSku(),
                colorName,
                sizeName,
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }

    private CartResponse emptyCart() {
        return new CartResponse(null, List.of(),
                BigDecimal.ZERO, BigDecimal.ZERO, SHIPPING_COST, SHIPPING_COST, null);
    }
}
