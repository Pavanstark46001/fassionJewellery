package com.luxora.jewellery.order.dto;

import com.luxora.jewellery.order.entity.OrderChannel;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.entity.PaymentMethod;
import com.luxora.jewellery.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Sprint 6 added {@code channel}, {@code discountAmount}, {@code gstAmount}
 * and {@code walkInCustomerName} so this same shape can represent a POS sale
 * too, not just a WEB order - {@code discountAmount}/{@code gstAmount} are
 * zero and {@code walkInCustomerName} is null for every pre-Sprint-6 WEB
 * order.
 */
public record OrderDetailDto(
        String orderNumber,
        OrderStatus status,
        OrderChannel channel,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String paymentReference,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal gstAmount,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        String walkInCustomerName,
        ShippingAddressDto shippingAddress,
        List<OrderItemDto> items,
        Instant placedAt,
        Instant updatedAt
) {
}
