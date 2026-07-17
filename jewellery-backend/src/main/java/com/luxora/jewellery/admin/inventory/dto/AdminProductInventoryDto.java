package com.luxora.jewellery.admin.inventory.dto;

import com.luxora.jewellery.product.entity.StockStatus;

import java.util.UUID;

/**
 * One row of the admin inventory list ({@code GET
 * /api/v1/admin/inventory/products}) - a product's tracked quantity,
 * low-stock threshold, and single-location warehouse placement.
 */
public record AdminProductInventoryDto(
        UUID productId,
        String ornamentId,
        String name,
        int stockQuantity,
        int lowStockThreshold,
        StockStatus stockStatus,
        String warehouseName,
        String rackCode,
        String shelfCode
) {
}
