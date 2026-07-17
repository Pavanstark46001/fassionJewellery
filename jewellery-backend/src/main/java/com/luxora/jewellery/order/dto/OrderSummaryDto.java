package com.luxora.jewellery.order.dto;

import com.luxora.jewellery.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryDto(
        String orderNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        int itemCount,
        Instant placedAt
) {
}
