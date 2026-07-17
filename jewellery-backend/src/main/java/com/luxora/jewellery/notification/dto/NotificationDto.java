package com.luxora.jewellery.notification.dto;

import com.luxora.jewellery.notification.entity.NotificationChannel;
import com.luxora.jewellery.notification.entity.NotificationStatus;

import java.time.Instant;

public record NotificationDto(
        String recipientEmail,
        NotificationChannel channel,
        String subject,
        String summary,
        String relatedOrderNumber,
        NotificationStatus status,
        Instant sentAt
) {
}
