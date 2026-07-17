package com.luxora.jewellery.notification.service;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.notification.dto.NotificationDto;
import com.luxora.jewellery.notification.entity.NotificationLog;
import com.luxora.jewellery.notification.repository.NotificationLogRepository;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Read-side of the notification log, kept separate from {@link
 * LoggingNotificationService} since that class is the {@code
 * NotificationService} seam implementation (write-only from the domain's
 * point of view) while this is the per-user listing used by {@code GET
 * /api/v1/notifications}.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationQueryService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;

    public PageResponse<NotificationDto> listNotifications(String email, Pageable pageable) {
        UUID userId = resolveUser(email).getId();
        var page = notificationLogRepository.findByUserIdOrderByCreatedDateDesc(userId, pageable);
        return PageResponse.from(page, page.getContent().stream().map(this::toDto).toList());
    }

    private NotificationDto toDto(NotificationLog entry) {
        return new NotificationDto(
                entry.getRecipientEmail(),
                entry.getChannel(),
                entry.getSubject(),
                entry.getSummary(),
                entry.getRelatedOrderNumber(),
                entry.getStatus(),
                entry.getSentAt());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
    }
}
