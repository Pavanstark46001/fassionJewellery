-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 8 schema
-- Real inventory quantity tracking (products gain stock_quantity/location
-- columns + a stock_movements audit trail) and a wallet/reward-points/
-- referral system (wallets, wallet_transactions, users gain a referral code
-- + referred-by link).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- products: real stock quantity + single-location placement
-- ----------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5;
ALTER TABLE products ADD COLUMN warehouse_name VARCHAR(100);
ALTER TABLE products ADD COLUMN rack_code VARCHAR(50);
ALTER TABLE products ADD COLUMN shelf_code VARCHAR(50);

-- Backfill existing rows with a reasonable quantity derived from the
-- existing (manually-set) stock_status, so the data isn't nonsensical -
-- IN_STOCK gets comfortably above the default low-stock threshold, LOW_STOCK
-- gets a small quantity at/under it, and OUT_OF_STOCK/COMING_SOON get zero.
UPDATE products
SET stock_quantity = CASE stock_status
    WHEN 'IN_STOCK' THEN 20
    WHEN 'LOW_STOCK' THEN 3
    WHEN 'OUT_OF_STOCK' THEN 0
    WHEN 'COMING_SOON' THEN 0
    ELSE 0
END;

CREATE INDEX idx_products_low_stock ON products (stock_quantity, low_stock_threshold) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- stock_movements
-- ----------------------------------------------------------------------------
CREATE TABLE stock_movements (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by             VARCHAR(255),
    created_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by             VARCHAR(255),
    updated_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                BIGINT NOT NULL DEFAULT 0,
    is_deleted             BOOLEAN NOT NULL DEFAULT false,
    deleted_date           TIMESTAMPTZ,

    product_id             UUID NOT NULL REFERENCES products (id),
    movement_type          VARCHAR(20) NOT NULL,
    quantity_change        INTEGER NOT NULL,
    note                   VARCHAR(500),
    reference_order_number VARCHAR(20)
);

CREATE INDEX idx_stock_movements_product ON stock_movements (product_id, created_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_stock_movements_order ON stock_movements (reference_order_number) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- users: referral code + optional "referred by" link
-- ----------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN referral_code VARCHAR(20);
ALTER TABLE users ADD COLUMN referred_by_user_id UUID;

-- Deterministic-but-unique-per-row backfill (a truly random generator isn't
-- easy to guarantee collision-free in pure SQL across many rows) - derived
-- from each user's own id, so it's stable and unique by construction.
UPDATE users
SET referral_code = 'REF' || upper(substr(md5(id::text), 1, 8))
WHERE referral_code IS NULL;

ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;

CREATE UNIQUE INDEX uq_users_referral_code ON users (referral_code) WHERE is_deleted = false;
CREATE INDEX idx_users_referred_by ON users (referred_by_user_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- wallets
-- ----------------------------------------------------------------------------
CREATE TABLE wallets (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    user_id        UUID NOT NULL REFERENCES users (id),
    balance        NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_wallets_user_id ON wallets (user_id) WHERE is_deleted = false;

-- Backfill a zero-balance wallet for every existing user.
INSERT INTO wallets (user_id, balance)
SELECT id, 0 FROM users WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- wallet_transactions
-- ----------------------------------------------------------------------------
CREATE TABLE wallet_transactions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by             VARCHAR(255),
    created_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by             VARCHAR(255),
    updated_date           TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                BIGINT NOT NULL DEFAULT 0,
    is_deleted             BOOLEAN NOT NULL DEFAULT false,
    deleted_date           TIMESTAMPTZ,

    user_id                UUID NOT NULL REFERENCES users (id),
    amount                 NUMERIC(12,2) NOT NULL,
    transaction_type       VARCHAR(20) NOT NULL,
    description            VARCHAR(500),
    reference_order_number VARCHAR(20)
);

CREATE INDEX idx_wallet_transactions_user ON wallet_transactions (user_id, created_date DESC) WHERE is_deleted = false;
