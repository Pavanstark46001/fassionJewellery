package com.luxora.jewellery.payment;

import com.luxora.jewellery.order.entity.Order;

/**
 * Seam between {@code OrderService} and whatever payment provider actually
 * moves money. {@link MockPaymentGateway} is the only implementation for
 * Sprint 4 - swapping in a real provider (Razorpay/PhonePe/etc.) later is a
 * matter of adding a new {@code @Component} and retiring the mock, with no
 * changes needed above this interface.
 */
public interface PaymentGateway {

    PaymentResult charge(Order order);
}
