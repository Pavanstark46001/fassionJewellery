package com.luxora.jewellery.pos.dto;

import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.entity.StockStatus;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Result row for {@code GET /api/v1/admin/pos/lookup} - enough detail for
 * the till screen to show the item and add it to the current sale. A real
 * barcode scanner "types" the scanned {@code ornamentId} + Enter into the
 * lookup field (there's no camera/webcam scanning in this environment), so
 * the exact-match path is the common case; the name-fallback path is for
 * staff typing a partial product name by hand.
 */
public record PosProductLookupDto(
        UUID id,
        String ornamentId,
        String name,
        String primaryImageUrl,
        BigDecimal basePrice,
        BigDecimal discountedPrice,
        MetalType metalType,
        StockStatus stockStatus,
        String categoryName
) {
}
