package com.luxora.jewellery.admin.order.dto;

import com.luxora.jewellery.order.entity.OrderChannel;
import com.luxora.jewellery.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Row shape for the admin order list - like {@code OrderSummaryDto} but
 * unscoped from "current user", so it also carries who placed the order.
 *
 * <p>Sprint 6: {@code channel} distinguishes a WEB order from an in-store
 * POS sale (same table, unified list - see {@code PosService}). {@code
 * customerName} falls back to the POS walk-in name when there's no linked
 * {@code userId}.
 */
public record AdminOrderSummaryDto(
        String orderNumber,
        OrderStatus status,
        OrderChannel channel,
        BigDecimal totalAmount,
        int itemCount,
        Instant placedAt,
        String customerEmail,
        String customerName
) {
}
