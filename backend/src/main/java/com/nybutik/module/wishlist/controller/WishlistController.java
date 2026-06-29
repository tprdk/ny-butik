package com.nybutik.module.wishlist.controller;

import com.nybutik.module.wishlist.dto.WishlistItemResponse;
import com.nybutik.module.wishlist.service.WishlistService;
import com.nybutik.shared.response.ApiResponse;
import com.nybutik.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<WishlistItemResponse>> getWishlist() {
        return ApiResponse.ok(wishlistService.getWishlist(SecurityUtils.currentUserId()));
    }

    @GetMapping("/ids")
    public ApiResponse<Set<Long>> getWishlistedIds() {
        return ApiResponse.ok(wishlistService.getWishlistedProductIds(SecurityUtils.currentUserId()));
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WishlistItemResponse> add(@PathVariable Long productId) {
        return ApiResponse.ok(wishlistService.addToWishlist(SecurityUtils.currentUserId(), productId));
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(SecurityUtils.currentUserId(), productId);
    }

    @GetMapping("/{productId}/check")
    public ApiResponse<Boolean> check(@PathVariable Long productId) {
        return ApiResponse.ok(wishlistService.isWishlisted(SecurityUtils.currentUserId(), productId));
    }
}
