package com.luxora.jewellery.order.entity;

/**
 * Sprint 6: which sales channel produced this order. {@code WEB} is every
 * order placed through the storefront (Sprints 1-5); {@code POS} is an
 * in-store till sale rung up by showroom staff. Both flow through the same
 * {@code Order}/{@code OrderItem} tables and the same admin order-management
 * screens - POS is just another channel feeding the same unified reporting,
 * not a parallel data model.
 */
public enum OrderChannel {
    WEB,
    POS
}
