package com.luxora.jewellery.notification.service;

import com.luxora.jewellery.notification.entity.NotificationChannel;
import com.luxora.jewellery.notification.entity.NotificationLog;
import com.luxora.jewellery.notification.entity.NotificationStatus;
import com.luxora.jewellery.notification.repository.NotificationLogRepository;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Mock notification sender - no real email/SMS provider is wired up yet
 * (SendGrid/Twilio credentials aren't available), so this just logs a
 * clear structured line and persists a {@link NotificationLog} row. The
 * log table makes the mock's behavior inspectable (e.g. via {@code GET
 * /api/v1/notifications}) instead of relying on log lines that vanish.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LoggingNotificationService implements NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void sendOrderConfirmation(Order order) {
        send(order, "Order %s confirmed".formatted(order.getOrderNumber()),
                "Your order %s for %s has been placed and is being processed."
                        .formatted(order.getOrderNumber(), order.getTotalAmount()));
    }

    @Override
    @Transactional
    public void sendPaymentConfirmation(Order order) {
        send(order, "Payment received for order %s".formatted(order.getOrderNumber()),
                "We've received your payment of %s for order %s."
                        .formatted(order.getTotalAmount(), order.getOrderNumber()));
    }

    @Override
    @Transactional
    public void sendOrderCancellation(Order order) {
        send(order, "Order %s cancelled".formatted(order.getOrderNumber()),
                "Your order %s has been cancelled as requested.".formatted(order.getOrderNumber()));
    }

    @Override
    @Transactional
    public void sendOrderStatusUpdate(Order order) {
        send(order, "Order %s status updated".formatted(order.getOrderNumber()),
                "Order %s has %s.".formatted(order.getOrderNumber(), statusVerb(order.getStatus())));
    }

    private String statusVerb(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "been confirmed";
            case SHIPPED -> "shipped";
            case DELIVERED -> "been delivered";
            default -> "been updated to " + status;
        };
    }

    private void send(Order order, String subject, String summary) {
        String recipientEmail = userRepository.findById(order.getUserId())
                .map(user -> user.getEmail())
                .orElse("unknown@sriaisaifashionjewellery.local");

        log.info("[MOCK EMAIL] To: {} | Subject: {} | {}", recipientEmail, subject, summary);

        NotificationLog entry = NotificationLog.builder()
                .userId(order.getUserId())
                .recipientEmail(recipientEmail)
                .channel(NotificationChannel.EMAIL)
                .subject(subject)
                .summary(summary)
                .relatedOrderNumber(order.getOrderNumber())
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationLogRepository.save(entry);
    }
}
