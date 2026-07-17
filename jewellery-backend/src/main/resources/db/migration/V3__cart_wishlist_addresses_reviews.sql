-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 2 schema
-- Cart, wishlist, saved addresses and product reviews. Still no
-- order/payment/inventory/admin tables - those remain later sprints.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- addresses
-- ----------------------------------------------------------------------------
CREATE TABLE addresses (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    user_id        UUID NOT NULL REFERENCES users (id),
    label          VARCHAR(100),
    full_name      VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(20) NOT NULL,
    address_line1  VARCHAR(255) NOT NULL,
    address_line2  VARCHAR(255),
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    postal_code    VARCHAR(20) NOT NULL,
    country        VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default     BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_addresses_user ON addresses (user_id) WHERE is_deleted = false;
CREATE INDEX idx_addresses_user_default ON addresses (user_id, is_default) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- cart_items
-- ----------------------------------------------------------------------------
CREATE TABLE cart_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    user_id        UUID NOT NULL REFERENCES users (id),
    product_id     UUID NOT NULL REFERENCES products (id),
    quantity       INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_cart_items_user_product ON cart_items (user_id, product_id) WHERE is_deleted = false;
CREATE INDEX idx_cart_items_user ON cart_items (user_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- wishlist_items
-- ----------------------------------------------------------------------------
CREATE TABLE wishlist_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    user_id        UUID NOT NULL REFERENCES users (id),
    product_id     UUID NOT NULL REFERENCES products (id)
);

CREATE UNIQUE INDEX uq_wishlist_items_user_product ON wishlist_items (user_id, product_id) WHERE is_deleted = false;
CREATE INDEX idx_wishlist_items_user ON wishlist_items (user_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by             VARCHAR(255),
    created_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by             VARCHAR(255),
    updated_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                BIGINT NOT NULL DEFAULT 0,
    is_deleted             BOOLEAN NOT NULL DEFAULT false,
    deleted_date           TIMESTAMPTZ,

    product_id             UUID NOT NULL REFERENCES products (id),
    user_id                UUID NOT NULL REFERENCES users (id),
    rating                 INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title                  VARCHAR(150),
    comment                TEXT,
    is_verified_purchase   BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX uq_reviews_product_user ON reviews (product_id, user_id) WHERE is_deleted = false;
CREATE INDEX idx_reviews_product_created ON reviews (product_id, created_date) WHERE is_deleted = false;
