package com.luxora.jewellery.notification.entity;

/**
 * Only {@code SENT} is reachable this sprint - every notification is mocked
 * (logged + persisted) and never actually fails to "send". A real
 * email/SMS provider integration later would add {@code FAILED} and retry
 * bookkeeping.
 */
public enum NotificationStatus {
    SENT
}
