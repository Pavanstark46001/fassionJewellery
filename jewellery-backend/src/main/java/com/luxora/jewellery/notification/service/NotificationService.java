package com.luxora.jewellery.notification.service;

import com.luxora.jewellery.order.entity.Order;

/**
 * Seam between order flows and whatever actually delivers a notification.
 * {@link LoggingNotificationService} is the only implementation for Sprint
 * 4 - it logs and persists rather than sending real email/SMS. A real
 * provider (SendGrid/Twilio/etc.) is a drop-in replacement later.
 */
public interface NotificationService {

    void sendOrderConfirmation(Order order);

    void sendPaymentConfirmation(Order order);

    void sendOrderCancellation(Order order);

    /**
     * Sprint 5: fired by the admin order-status-transition endpoint after
     * the order's status is updated (e.g. to SHIPPED/DELIVERED), so the
     * customer is notified of progress beyond the initial confirmation.
     */
    void sendOrderStatusUpdate(Order order);
}
