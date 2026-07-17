-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 3 schema
-- Orders + order line items. Payments (real gateway integration) remain a
-- later sprint - orders are COD-only / payment-status-stub for now.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- order_number_seq - backs the human-readable SSFJ-000001 style order number
-- ----------------------------------------------------------------------------
CREATE SEQUENCE order_number_seq START WITH 1 INCREMENT BY 1;

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by               VARCHAR(255),
    created_date             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by               VARCHAR(255),
    updated_date             TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                  BIGINT NOT NULL DEFAULT 0,
    is_deleted               BOOLEAN NOT NULL DEFAULT false,
    deleted_date             TIMESTAMPTZ,

    user_id                  UUID NOT NULL REFERENCES users (id),
    order_number             VARCHAR(20) NOT NULL,
    status                   VARCHAR(20) NOT NULL DEFAULT 'PLACED',
    payment_method           VARCHAR(20) NOT NULL,
    payment_status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal                 NUMERIC(12, 2) NOT NULL,
    shipping_fee             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount             NUMERIC(12, 2) NOT NULL,
    item_count               INTEGER NOT NULL DEFAULT 0,

    -- Shipping address is snapshotted as plain columns (not a FK to
    -- addresses) - an order's shipping details must not silently change if
    -- the customer later edits/deletes that saved address.
    shipping_full_name       VARCHAR(255) NOT NULL,
    shipping_phone_number    VARCHAR(20) NOT NULL,
    shipping_address_line1   VARCHAR(255) NOT NULL,
    shipping_address_line2   VARCHAR(255),
    shipping_city            VARCHAR(100) NOT NULL,
    shipping_state           VARCHAR(100) NOT NULL,
    shipping_postal_code     VARCHAR(20) NOT NULL,
    shipping_country         VARCHAR(100) NOT NULL DEFAULT 'India'
);

CREATE UNIQUE INDEX uq_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_date) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by          VARCHAR(255),
    created_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          VARCHAR(255),
    updated_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             BIGINT NOT NULL DEFAULT 0,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    deleted_date        TIMESTAMPTZ,

    order_id            UUID NOT NULL REFERENCES orders (id),
    product_id          UUID NOT NULL REFERENCES products (id),
    -- Product fields below are snapshotted at order time (same rationale as
    -- the shipping address) - the catalog can change or the product can even
    -- be deleted after the order is placed, but the order record must not.
    ornament_id         VARCHAR(50) NOT NULL,
    product_name        VARCHAR(255) NOT NULL,
    product_image_url   VARCHAR(500),
    unit_price          NUMERIC(12, 2) NOT NULL,
    quantity            INTEGER NOT NULL,
    line_total          NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items (order_id) WHERE is_deleted = false;
