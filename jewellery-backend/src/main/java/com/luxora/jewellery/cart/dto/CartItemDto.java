package com.luxora.jewellery.cart.dto;

import com.luxora.jewellery.product.dto.ProductSummaryDto;

import java.math.BigDecimal;

public record CartItemDto(
        ProductSummaryDto product,
        int quantity,
        BigDecimal lineTotal
) {
}
