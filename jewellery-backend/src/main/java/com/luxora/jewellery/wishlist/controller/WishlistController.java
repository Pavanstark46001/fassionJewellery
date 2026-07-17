package com.luxora.jewellery.wishlist.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.wishlist.dto.AddWishlistItemRequest;
import com.luxora.jewellery.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Wishlist", description = "Authenticated user's saved/wishlisted products")
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<ProductSummaryDto>> getWishlist(Authentication authentication) {
        return ApiResponse.ok(wishlistService.getWishlist(authentication.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Void>> addItem(Authentication authentication,
                                                       @Valid @RequestBody AddWishlistItemRequest request) {
        wishlistService.addItem(authentication.getName(), request.productId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Item added to wishlist", null));
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<Void> removeItem(Authentication authentication, @PathVariable UUID productId) {
        wishlistService.removeItem(authentication.getName(), productId);
        return ApiResponse.ok("Item removed from wishlist", null);
    }
}
