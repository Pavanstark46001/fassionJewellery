package com.luxora.jewellery.cart.dto;

/**
 * {@code quantity <= 0} means "remove this item" per the cart API contract,
 * so this is intentionally not validated with {@code @Min(1)}.
 */
public record UpdateCartItemRequest(
        int quantity
) {
}
