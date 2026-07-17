-- ============================================================================
-- Sri Sai Fashion Jewellery - Phase 1 schema
-- Foundation + public catalog/home browse tables only. No cart/order/payment/
-- inventory/admin tables in this phase.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- roles
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    name           VARCHAR(50) NOT NULL,
    description    VARCHAR(255)
);

CREATE UNIQUE INDEX uq_roles_name ON roles (name) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255),
    phone_number   VARCHAR(20),
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uq_users_email ON users (email) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    user_id        UUID NOT NULL REFERENCES users (id),
    role_id        UUID NOT NULL REFERENCES roles (id)
);

CREATE UNIQUE INDEX uq_user_roles_user_role ON user_roles (user_id, role_id) WHERE is_deleted = false;
CREATE INDEX idx_user_roles_user ON user_roles (user_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(170) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uq_categories_slug ON categories (slug) WHERE is_deleted = false;
CREATE INDEX idx_categories_active_order ON categories (is_active, display_order) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- sub_categories
-- ----------------------------------------------------------------------------
CREATE TABLE sub_categories (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    category_id    UUID NOT NULL REFERENCES categories (id),
    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(170) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uq_sub_categories_slug ON sub_categories (slug) WHERE is_deleted = false;
CREATE INDEX idx_sub_categories_category_active ON sub_categories (category_id, is_active) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- collections
-- ----------------------------------------------------------------------------
CREATE TABLE collections (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(170) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    is_featured    BOOLEAN NOT NULL DEFAULT false,
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uq_collections_slug ON collections (slug) WHERE is_deleted = false;
CREATE INDEX idx_collections_active_order ON collections (is_active, display_order) WHERE is_deleted = false;
CREATE INDEX idx_collections_featured_active ON collections (is_featured, is_active) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- occasions
-- ----------------------------------------------------------------------------
CREATE TABLE occasions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(170) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uq_occasions_slug ON occasions (slug) WHERE is_deleted = false;
CREATE INDEX idx_occasions_active_order ON occasions (is_active, display_order) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- products ("ornaments")
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by         VARCHAR(255),
    created_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by         VARCHAR(255),
    updated_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
    version            BIGINT NOT NULL DEFAULT 0,
    is_deleted         BOOLEAN NOT NULL DEFAULT false,
    deleted_date       TIMESTAMPTZ,

    ornament_id        VARCHAR(50) NOT NULL,
    name               VARCHAR(255) NOT NULL,
    slug               VARCHAR(280) NOT NULL,
    short_description  VARCHAR(500),
    description        TEXT,
    base_price         NUMERIC(12,2) NOT NULL,
    discounted_price   NUMERIC(12,2),
    metal_type         VARCHAR(30) NOT NULL,
    weight_grams       NUMERIC(8,2),
    category_id        UUID REFERENCES categories (id),
    sub_category_id    UUID REFERENCES sub_categories (id),
    is_active          BOOLEAN NOT NULL DEFAULT true,
    is_featured        BOOLEAN NOT NULL DEFAULT false,
    stock_status       VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK',
    meta_title         VARCHAR(255),
    meta_description   VARCHAR(500)
);

CREATE UNIQUE INDEX uq_products_ornament_id ON products (ornament_id) WHERE is_deleted = false;
CREATE UNIQUE INDEX uq_products_slug ON products (slug) WHERE is_deleted = false;
CREATE INDEX idx_products_subcategory_active ON products (sub_category_id, is_active) WHERE is_deleted = false;
CREATE INDEX idx_products_category_active ON products (category_id, is_active) WHERE is_deleted = false;
CREATE INDEX idx_products_featured_active ON products (is_featured, is_active) WHERE is_deleted = false;
CREATE INDEX idx_products_base_price ON products (base_price) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
CREATE TABLE product_images (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    product_id     UUID NOT NULL REFERENCES products (id),
    image_url      VARCHAR(500) NOT NULL,
    alt_text       VARCHAR(255),
    display_order  INTEGER DEFAULT 0,
    is_primary     BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_product_images_product_order ON product_images (product_id, display_order) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- product_collections (join)
-- ----------------------------------------------------------------------------
CREATE TABLE product_collections (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    product_id     UUID NOT NULL REFERENCES products (id),
    collection_id  UUID NOT NULL REFERENCES collections (id)
);

CREATE UNIQUE INDEX uq_product_collections_pair ON product_collections (product_id, collection_id) WHERE is_deleted = false;
CREATE INDEX idx_product_collections_collection ON product_collections (collection_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- product_occasions (join)
-- ----------------------------------------------------------------------------
CREATE TABLE product_occasions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    product_id     UUID NOT NULL REFERENCES products (id),
    occasion_id    UUID NOT NULL REFERENCES occasions (id)
);

CREATE UNIQUE INDEX uq_product_occasions_pair ON product_occasions (product_id, occasion_id) WHERE is_deleted = false;
CREATE INDEX idx_product_occasions_occasion ON product_occasions (occasion_id) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- banners
-- ----------------------------------------------------------------------------
CREATE TABLE banners (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    title          VARCHAR(255) NOT NULL,
    subtitle       VARCHAR(500),
    image_url      VARCHAR(500) NOT NULL,
    link_url       VARCHAR(500),
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_banners_active_order ON banners (is_active, display_order) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- home_sections
-- ----------------------------------------------------------------------------
CREATE TABLE home_sections (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by     VARCHAR(255),
    created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by     VARCHAR(255),
    updated_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    version        BIGINT NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN NOT NULL DEFAULT false,
    deleted_date   TIMESTAMPTZ,

    title          VARCHAR(255) NOT NULL,
    subtitle       VARCHAR(500),
    section_type   VARCHAR(30) NOT NULL,
    display_order  INTEGER DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_home_sections_active_order ON home_sections (is_active, display_order) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- home_section_items
-- ----------------------------------------------------------------------------
CREATE TABLE home_section_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by          VARCHAR(255),
    created_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          VARCHAR(255),
    updated_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             BIGINT NOT NULL DEFAULT 0,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    deleted_date        TIMESTAMPTZ,

    home_section_id     UUID NOT NULL REFERENCES home_sections (id),
    reference_type      VARCHAR(30) NOT NULL,
    reference_id        UUID NOT NULL,
    display_order       INTEGER DEFAULT 0,
    override_image_url  VARCHAR(500)
);

CREATE INDEX idx_home_section_items_section_order ON home_section_items (home_section_id, display_order) WHERE is_deleted = false;
