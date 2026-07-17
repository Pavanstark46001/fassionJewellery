package com.luxora.jewellery.payment;

/**
 * Outcome of a {@link PaymentGateway#charge} call.
 *
 * @param success            whether the charge succeeded
 * @param transactionReference gateway-assigned reference id, persisted onto
 *                           the order for audit/support purposes
 */
public record PaymentResult(boolean success, String transactionReference) {
}
