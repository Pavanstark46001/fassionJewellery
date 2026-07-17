package com.luxora.jewellery.cart.dto;

import java.util.List;

public record CartResponse(
        List<CartItemDto> items,
        CartSummaryDto summary
) {
}
