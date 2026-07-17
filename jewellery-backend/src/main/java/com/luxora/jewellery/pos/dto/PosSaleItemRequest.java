package com.luxora.jewellery.pos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * One scanned/looked-up line item for a POS sale. Only {@code productId} and
 * {@code quantity} come from the till - price is always looked up server
 * side from the live product record, never trusted from the client.
 */
public record PosSaleItemRequest(
        @NotNull(message = "productId is required")
        UUID productId,

        @Min(value = 1, message = "quantity must be at least 1")
        int quantity
) {
}
