-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 5 schema
-- Admin/back-office API. The default ADMIN user is seeded in code (see
-- AdminUserInitializer), not here, so it's created idempotently via the
-- app's own PasswordEncoder rather than a bcrypt hash baked into SQL.
--
-- The admin order list/dashboard filter and group by orders.status, which
-- had no index of its own before this sprint (only composite indexes keyed
-- on other columns) - add one to keep those admin queries efficient as the
-- orders table grows.
-- ============================================================================

CREATE INDEX idx_orders_status ON orders (status) WHERE is_deleted = false;
