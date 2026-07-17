-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 6 schema
-- In-store billing / point-of-sale (POS). POS sales reuse the existing
-- orders/order_items tables (unified sales reporting across channels) rather
-- than a parallel data model - this migration only extends `orders` with the
-- columns a POS sale needs that a WEB order never had.
--
-- Out of scope this sprint (see PosService for the fuller rationale):
--   - split/partial payments across multiple methods
--   - exchanges and returns
--   - a configurable tax-rate module (GST is a flat 3% constant for now)
-- ============================================================================

-- user_id must become nullable: a POS sale to a walk-in customer with no
-- account has nothing to put there. walkInCustomerName/Phone below carry
-- the customer's details in that case.
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Sales channel. Every row created before this migration is a WEB order (POS
-- didn't exist yet), so backfill explicitly rather than relying only on the
-- column default applying retroactively.
ALTER TABLE orders ADD COLUMN channel VARCHAR(10) NOT NULL DEFAULT 'WEB';
UPDATE orders SET channel = 'WEB' WHERE channel IS NULL OR channel <> 'WEB';

ALTER TABLE orders ADD COLUMN walk_in_customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN walk_in_customer_phone VARCHAR(20);

-- Flat manual discount applied at the register, and GST broken out
-- separately from total_amount for proper tax-invoice compliance. Both
-- default/backfill to 0 - no earlier order ever had either concept.
ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN gst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- The admin order list may want to filter/report by channel as POS volume
-- grows; a partial index (mirroring idx_orders_status from V6) keeps that
-- cheap. Not wired into the admin list query this sprint (no such filter
-- exists yet - that's admin-UI/API scope, not this migration's), but adding
-- it now costs nothing and avoids a later migration.
CREATE INDEX idx_orders_channel ON orders (channel) WHERE is_deleted = false;
