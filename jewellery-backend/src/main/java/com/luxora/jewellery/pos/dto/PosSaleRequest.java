package com.luxora.jewellery.pos.dto;

import com.luxora.jewellery.order.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Request body for {@code POST /api/v1/admin/pos/sales}. Exactly one of
 * {@code customerId} or {@code walkInCustomerName}/{@code
 * walkInCustomerPhone} normally applies: if {@code customerId} is present it
 * wins (the sale is linked to that registered account and the walk-in
 * fields, if also sent, are ignored - see {@code PosService}); otherwise the
 * walk-in fields are used, and a completely nameless anonymous walk-in sale
 * is allowed too (a real till sometimes just doesn't bother asking).
 *
 * <p>{@code discountAmount} defaults to zero when omitted. {@code
 * paymentMethod} must be a single POS-appropriate method (CASH/CARD/ONLINE)
 * - split/partial payments across multiple methods are out of scope this
 * sprint (needs a proper payment-ledger design).
 */
public record PosSaleRequest(
        UUID customerId,

        String walkInCustomerName,

        String walkInCustomerPhone,

        @NotEmpty(message = "At least one item is required")
        @Valid
        List<PosSaleItemRequest> items,

        BigDecimal discountAmount,

        @NotNull(message = "paymentMethod is required")
        PaymentMethod paymentMethod
) {
}
