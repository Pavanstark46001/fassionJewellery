package com.luxora.jewellery.admin.order.dto;

import com.luxora.jewellery.order.dto.OrderItemDto;
import com.luxora.jewellery.order.dto.ShippingAddressDto;
import com.luxora.jewellery.order.entity.OrderChannel;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.entity.PaymentMethod;
import com.luxora.jewellery.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full order detail for the admin API - the same shape as the customer-facing
 * {@code OrderDetailDto} plus the owning customer's identity, since an admin
 * views orders across every user, not just their own.
 *
 * <p>Sprint 6: {@code customerId}/{@code customerEmail}/{@code customerName}
 * are all null for an anonymous POS walk-in sale - {@code walkInCustomerName}
 * carries the customer's name in that case instead.
 */
public record AdminOrderDetailDto(
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
        Instant updatedAt,
        UUID customerId,
        String customerEmail,
        String customerName
) {
}
