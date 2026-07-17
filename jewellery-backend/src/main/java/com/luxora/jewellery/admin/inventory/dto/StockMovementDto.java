package com.luxora.jewellery.admin.inventory.dto;

import com.luxora.jewellery.inventory.entity.MovementType;

import java.time.Instant;
import java.util.UUID;

public record StockMovementDto(
        UUID id,
        UUID productId,
        String ornamentId,
        String productName,
        MovementType movementType,
        int quantityChange,
        String note,
        String referenceOrderNumber,
        String performedBy,
        Instant createdDate
) {
}
