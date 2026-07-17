package com.luxora.jewellery.order.entity;

/**
 * {@code COD} and {@code ONLINE} (e.g. Razorpay/UPI, wired up in Sprint 4)
 * are the web-checkout methods. Sprint 6 adds {@code CASH} and {@code CARD}
 * for in-store POS sales, which are paid at the till at the moment of sale.
 * UPI-at-the-till is intentionally not a separate value - it reuses {@code
 * ONLINE} rather than adding a POS-only UPI variant, keeping this enum
 * small; splitting it out for finer-grained reporting is a future
 * refinement if the business needs it.
 */
public enum PaymentMethod {
    COD,
    ONLINE,
    CASH,
    CARD
}
