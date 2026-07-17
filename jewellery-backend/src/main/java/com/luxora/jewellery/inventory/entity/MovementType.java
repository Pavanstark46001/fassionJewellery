package com.luxora.jewellery.inventory.entity;

/**
 * Reason code for a {@link StockMovement}. {@code quantityChange} is always
 * signed independently of this type (positive for entries/returns, negative
 * for sales/damage) - this enum is purely descriptive/for reporting.
 */
public enum MovementType {
    PURCHASE_ENTRY,
    DAMAGE_ENTRY,
    RETURN_ENTRY,
    STOCK_TRANSFER,
    SALE_DEDUCTION
}
