-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 4 schema
-- Mock payment gateway + mock/logged notifications. No real payment/email/SMS
-- provider is integrated yet - see the `payment` and `notification` packages
-- for the swap-in seams.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- orders.payment_reference - gateway-assigned reference id, set once an
-- ONLINE order's payment succeeds (mock gateway for now).
-- ----------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(100);

-- ----------------------------------------------------------------------------
-- notification_log - a record of every (mocked) outbound notification, so
-- the mock's behavior is inspectable via a real table rather than log lines
-- that vanish. user_id is stored directly (not derived via order) so the
-- per-user listing (GET /api/v1/notifications) doesn't need to join.
-- ----------------------------------------------------------------------------
CREATE TABLE notification_log (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by             VARCHAR(255),
    created_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by             VARCHAR(255),
    updated_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                BIGINT NOT NULL DEFAULT 0,
    is_deleted             BOOLEAN NOT NULL DEFAULT false,
    deleted_date           TIMESTAMPTZ,

    user_id                UUID NOT NULL REFERENCES users (id),
    recipient_email        VARCHAR(255) NOT NULL,
    channel                VARCHAR(20) NOT NULL,
    subject                VARCHAR(255) NOT NULL,
    summary                VARCHAR(1000),
    related_order_number   VARCHAR(20),
    status                 VARCHAR(20) NOT NULL DEFAULT 'SENT',
    sent_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_log_user_created ON notification_log (user_id, created_date) WHERE is_deleted = false;
