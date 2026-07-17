package com.luxora.jewellery.payment;

import com.luxora.jewellery.order.entity.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Always-succeeds stand-in for a real payment gateway, used until real
 * Razorpay/PhonePe credentials are available. Generates a fake
 * {@code MOCK-...} transaction reference so the rest of the system (order
 * record, invoice, support tooling) has something reference-shaped to work
 * with.
 *
 * <p>Future extension: a real gateway integration would also need a
 * "declined payment" path (insufficient funds, card errors, gateway
 * timeouts, webhook-based async confirmation, etc.). That's out of scope
 * for this sprint - the mock intentionally never fails.
 */
@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentResult charge(Order order) {
        String reference = "MOCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return new PaymentResult(true, reference);
    }
}
