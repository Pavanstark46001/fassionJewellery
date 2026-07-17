package com.luxora.jewellery.order.dto;

import com.luxora.jewellery.order.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PlaceOrderRequest(
        @NotNull(message = "addressId is required")
        UUID addressId,

        @NotNull(message = "paymentMethod is required")
        PaymentMethod paymentMethod,

        /** Sprint 8: optional wallet amount the customer wants to redeem
         * against this order. Actually deducted amount is capped at
         * min(this value, wallet balance, order total) - see {@code
         * OrderService.placeOrder} / {@code WalletService.redeem}. Null or
         * omitted means "don't redeem anything". */
        @DecimalMin(value = "0.0", message = "useWalletAmount cannot be negative")
        BigDecimal useWalletAmount
) {
}
