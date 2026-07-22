# Sri Sai Fashion Jewellery — E-Commerce Platform

A premium artificial-jewellery e-commerce platform: a luxury customer storefront, a full admin back-office, and an in-store billing/POS system, built across 8 incremental sprints.

## cmd to deploy application

cd C:\Users\vmuser\fassionJewellery>
git pull
powershell -ExecutionPolicy Bypass -File .\redeploy.ps1


## Structure

```
jewellery-backend/    Spring Boot 3.5 (Java 21) REST API
jewellery-frontend/   React 19 + TypeScript + Vite storefront + admin panel
docker-compose.yml    Local/production stack: backend + frontend + Redis
.env.example          Template for docker-compose environment variables
```

## What's implemented

- **Storefront**: cinematic homepage (3D hero, GSAP/Lenis/Framer Motion animations), full catalog browse with filters/search/sort, product detail with gallery/reviews/related products, cart, wishlist, guest-friendly + authenticated checkout, order history/tracking with PDF invoices, mock online payments (swap-in-ready for Razorpay/PhonePe), wallet & reward points, referral program, blog, static policy pages, SEO (meta tags, Open Graph, JSON-LD, sitemap.xml/robots.txt).
- **Admin back-office** (`/admin`, requires the `ADMIN` role): dashboard, product/category/collection/occasion management, order management with status transitions, customer list, homepage/banner/blog/static-page CMS, and inventory (stock levels, low-stock alerts, purchase/damage/transfer entries).
- **In-store billing (POS)** (`/admin/pos`): barcode-scanner-friendly lookup (any USB/Bluetooth scanner works — they emulate keyboard input), walk-in or registered-customer sales, GST calculation, thermal receipt and A4 GST-invoice printing — unified into the same order system as web orders for one reporting view.
- **Backend**: JWT auth with role-based access, UUID PKs with full audit fields + soft delete + optimistic locking on every table, Redis-cached listings (degrades gracefully if Redis is down), Swagger/OpenAPI docs, Flyway-managed schema.

## Prerequisites

- Java 21
- Node.js 20+ and npm
- Docker (for local Redis, or the full docker-compose stack)
- PostgreSQL — this project uses a dedicated database `jewellery_store` on an existing Postgres instance, with its own login role `jewellery_app` (do not reuse credentials from an unrelated project's database)

## Running locally (without Docker)

```powershell
# Backend
cd jewellery-backend
docker compose -f ../docker-compose.yml up -d redis   # or run any local Redis on :6379
$env:JAVA_HOME = "<path to a JDK 21 install>"
.\mvnw.cmd spring-boot:run
```

- API base URL: `http://localhost:8090/api/v1`
- Swagger/OpenAPI: `http://localhost:8090/swagger-ui.html`
- Flyway migrations run automatically on startup.

```powershell
# Frontend
cd jewellery-frontend
npm install
npm run dev
```

- Dev server: `http://localhost:5173` (falls back to `:5174` if occupied)
- Expects the backend at `http://localhost:8090/api/v1` (`VITE_API_BASE_URL` env var, see `src/lib/axios.ts`)

**Default admin account** (dev/demo only — change before any real deployment): `admin@srisaifashionjewellery.local` / `Admin@12345`, auto-created on first backend startup.

## Running with Docker

```powershell
cp .env.example .env   # fill in real DB_PASSWORD / JWT_SECRET at minimum
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8090`
- Redis runs in its own container; Postgres stays external (point `DB_URL` in `.env` at your instance).

If you deploy the frontend and backend on different hosts/ports than the defaults, update `CORS_ALLOWED_ORIGINS` (backend) and `VITE_API_BASE_URL` (frontend build arg) accordingly — see `.env.example`.

## Production checklist

Before deploying anywhere real:
- [ ] Change the default admin password (`admin@srisaifashionjewellery.local`)
- [ ] Set a real, random `JWT_SECRET` (32+ chars)
- [ ] Point `CORS_ALLOWED_ORIGINS` / `FRONTEND_BASE_URL` at your real domain(s)
- [ ] Replace the mock payment gateway (`payment/MockPaymentGateway.java`) with a real Razorpay/PhonePe integration
- [ ] Replace the mock/logging notification service (`notification/LoggingNotificationService.java`) with real email/SMS providers
- [ ] Review the GST rate (currently a flat 3% constant) against your actual tax obligations
- [ ] Set up real Postgres backups (this project doesn't manage that)

## Known scope boundaries

This is a feature-complete foundation, not an exhaustive enterprise system. Deliberately out of scope, called out in code comments where relevant: split/partial payments, exchange/return workflows, multi-warehouse inventory ledgers (a simple single-location-per-product model is used instead), a visual drag-and-drop homepage builder (CMS is CRUD + ordering), and full SSR/prerendering for SEO (this is a client-rendered SPA — meta tags update dynamically via JS, which helps but isn't equivalent to server-rendered HTML for all crawlers).
