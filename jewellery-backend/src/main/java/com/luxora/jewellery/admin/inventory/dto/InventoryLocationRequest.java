package com.luxora.jewellery.admin.inventory.dto;

/**
 * Body for {@code PUT /api/v1/admin/inventory/products/{id}/location}. All
 * fields are optional/nullable (simple single-location-per-product model -
 * a product may not have a location assigned yet).
 */
public record InventoryLocationRequest(
        String warehouseName,
        String rackCode,
        String shelfCode
) {
}
