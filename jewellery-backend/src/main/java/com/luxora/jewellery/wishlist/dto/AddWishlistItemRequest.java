package com.luxora.jewellery.wishlist.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddWishlistItemRequest(
        @NotNull(message = "productId is required")
        UUID productId
) {
}
