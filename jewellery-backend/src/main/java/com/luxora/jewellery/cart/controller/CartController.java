package com.luxora.jewellery.cart.controller;

import com.luxora.jewellery.cart.dto.AddCartItemRequest;
import com.luxora.jewellery.cart.dto.CartResponse;
import com.luxora.jewellery.cart.dto.UpdateCartItemRequest;
import com.luxora.jewellery.cart.service.CartService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Cart", description = "Authenticated user's shopping cart")
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(Authentication authentication) {
        return ApiResponse.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(Authentication authentication,
                                                               @Valid @RequestBody AddCartItemRequest request) {
        CartResponse cart = cartService.addItem(authentication.getName(), request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Item added to cart", cart));
    }

    @PatchMapping("/items/{productId}")
    public ApiResponse<CartResponse> updateQuantity(Authentication authentication, @PathVariable UUID productId,
                                                      @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.ok(cartService.updateQuantity(authentication.getName(), productId, request.quantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<CartResponse> removeItem(Authentication authentication, @PathVariable UUID productId) {
        return ApiResponse.ok(cartService.removeItem(authentication.getName(), productId));
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ApiResponse.ok("Cart cleared", null);
    }
}
