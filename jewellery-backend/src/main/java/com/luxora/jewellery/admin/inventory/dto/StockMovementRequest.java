package com.luxora.jewellery.admin.inventory.dto;

import com.luxora.jewellery.inventory.entity.MovementType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/admin/inventory/movements} - a manual
 * purchase entry, damage write-off, return, or transfer note.
 * {@code quantityChange} is signed by the caller (positive for
 * purchase/return entries, negative for damage write-offs); {@code
 * SALE_DEDUCTION} is not a valid value here since sales are only ever
 * recorded automatically by {@code InventoryService.deductStock}.
 */
public record StockMovementRequest(
        @NotNull(message = "productId is required")
        UUID productId,

        @NotNull(message = "movementType is required")
        MovementType movementType,

        @NotNull(message = "quantityChange is required")
        Integer quantityChange,

        String note
) {
}
