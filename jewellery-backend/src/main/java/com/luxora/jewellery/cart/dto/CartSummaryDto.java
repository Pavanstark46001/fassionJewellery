package com.luxora.jewellery.cart.dto;

import java.math.BigDecimal;

public record CartSummaryDto(
        int itemCount,
        BigDecimal subtotal
) {
}
