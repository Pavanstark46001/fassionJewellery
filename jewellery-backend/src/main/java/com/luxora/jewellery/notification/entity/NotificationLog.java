package com.luxora.jewellery.notification.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

/**
 * A record of a (mocked) outbound notification. Nothing is actually
 * emailed/texted this sprint - {@code LoggingNotificationService} logs a
 * structured line and persists a row here so the mock's behavior is
 * inspectable via a real table rather than log lines that vanish. {@code
 * userId} is a plain UUID column, same no-JPA-association convention used
 * throughout (see {@code Order}/{@code CartItem}).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_log")
@SQLDelete(sql = "UPDATE notification_log SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class NotificationLog extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "recipient_email", nullable = false, length = 255)
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private NotificationChannel channel;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "summary", length = 1000)
    private String summary;

    @Column(name = "related_order_number", length = 20)
    private String relatedOrderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationStatus status;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;
}
