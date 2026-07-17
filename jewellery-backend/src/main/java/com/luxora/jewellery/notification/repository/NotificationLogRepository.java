package com.luxora.jewellery.notification.repository;

import com.luxora.jewellery.notification.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {

    Page<NotificationLog> findByUserIdOrderByCreatedDateDesc(UUID userId, Pageable pageable);
}
