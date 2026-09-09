# 📝 Changelog — genericMed

> **Purpose:** Chronological history of all project changes.
> Follow [Keep a Changelog](https://keepachangelog.com/) format.
> Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

_Upcoming maintenance and enterprise enhancements._

### Planned

- Tele-consultation WebRTC video appointments
- IoT hardware cold-chain sensor telemetry integration
- WhatsApp Cloud API messaging channel

---

## [0.5.0] — 2026-09-09

### 🔀 Architecture Refactoring — Complete Decoupling into Frontend & Backend Subfolders ✅

Refactored the monolithic repository into two completely independent applications (`frontend/` and `backend/`) with isolated `package.json` manifests, zero cross-folder code imports, separate environment configurations, and reverse proxy API connectivity.

### Changed
- **Folder Restructuring**:
  - `backend/`: Dedicated Express API server with its own `package.json`, `tsconfig.json`, `prisma/` schema and migrations, `src/server.ts`, `src/api/`, `src/services/`, `src/lib/`, and integration test suites. Runs on port 5000 with CORS.
  - `frontend/`: Standalone React 19 + Vite 6 + Tailwind 4 client with its own `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `public/` assets, `src/components/`, `src/context/`, and `src/hooks/`. Proxies all `/api/*` requests to `http://localhost:5000`.
  - Project Root: Lightweight orchestrator `package.json` featuring unified scripts (`npm run dev`, `npm run install:all`, `npm run build`, `npm run test`, `npm run lint`).
- **Zero Cross-Folder Coupling**: Migrated logistics types to `frontend/src/types.ts` and eliminated all direct imports between client and server code.
- **Environment Isolation**:
  - `backend/.env` & `backend/.env.example` for server port, database URL, session secrets, and payment API keys.
  - `frontend/.env` & `frontend/.env.example` for Vite backend proxy target and client analytics.
- **Testing & Tooling**:
  - Backend integration tests (all 4 suites, 31 tests) passing via Jest & Supertest.
  - Clean TypeScript check (`tsc --noEmit`) across both frontend and backend.
  - Vite production build verified with PWA service worker generation.

---

## [0.4.0] — 2026-09-09

### 🌐 Phase 4 — Scale & Enterprise ✅

Architected for enterprise scale with Service Layer decomposition, typed asynchronous Event Bus, API Gateway telemetry middleware, production multi-stage Docker containerization and Compose orchestration, tiered marketplace commissions with automated escrow settlement ledger, multi-carrier 3PL logistics with live driver GPS tracking, delivery slot scheduling, reverse logistics returns, automated DISHA/HIPAA compliance audit reports, and GDPR patient data right-to-erasure.

### Added

#### Architecture Evolution & Event Bus (Sub-Phase 4.1)
- **`src/services/`** — Decoupled service layer abstracting core domain rules from Express HTTP controllers:
  - `CatalogService`: Normalized search, bioequivalence mappings, pack pricing, and promoted listing ranking.
  - `OrderService`: State machine transitions, stock reservations, escrow initialization, and return handling.
  - `MarketplaceService`: Tiered commissions (8%, 5%, 3%), escrow holding, settlement ledgers, and payout requests.
  - `LogisticsService`: 3PL carrier dispatch, rate estimation, live driver GPS telemetry simulation, and carrier webhooks.
  - `ComplianceService`: Automated DISHA/HIPAA audit reporting, CDSCO license verification, research de-identification, and patient right-to-erasure.
- **`src/lib/eventBus.ts`** — Typed asynchronous domain event bus (`order.created`, `order.status_changed`, `order.cancelled`, `settlement.released`, `logistics.dispatched`, `user.data_erased`).
- **`src/lib/logger.ts`** — Centralized structured JSON logger supporting log levels (`debug`, `info`, `warn`, `error`), ISO timestamps, and request correlation IDs.
- **`src/api/middleware/gateway.ts`** — API gateway telemetry middleware injecting correlation IDs (`X-Correlation-ID`), response timing (`X-Response-Time`), request logging, and HTTP cache headers for idempotent catalog queries.

#### Infrastructure & DevOps (Sub-Phase 4.2)
- **`Dockerfile`** — Production multi-stage Docker build (`dependencies` → `builder` → `runner`) with `node:22-alpine` and non-root security.
- **`docker-compose.yml`** — Full enterprise orchestration including `app` server, `postgres` 16 with health check, and `redis` 7 cache / event broker.
- **`.dockerignore`** — Production build exclusions.
- **`src/__tests__/api/marketplace.test.ts`** — 11 automated unit and integration tests verifying tiered commissions, escrow state transitions, 3PL dispatch, live GPS tracking, and DISHA compliance (bringing test suite to 31/31 passing tests).

#### Marketplace Model & Settlements (Sub-Phase 4.3)
- **`src/api/settlements.ts`** — Marketplace economics endpoints:
  - `GET /api/settlements/summary`: GMV, total commission earned, pending escrow, available payout balance.
  - `GET /api/settlements/ledger`: Itemized settlement transaction log with commission rates and release statuses.
  - `POST /api/settlements/payout`: Request pharmacy payout disbursement to verified bank accounts.
- Automated escrow holding on order placement; auto-release to pharmacy balance upon order transition to `Delivered`.
- Pharmacy Subscription Tiers: Basic (8% commission), Verified (5% commission), Enterprise (3% commission).
- **`src/components/AdminDashboardView.tsx`** — New "Marketplace Settlements" tab displaying escrow KPI cards, subscription tier summaries, and itemized settlement ledger.
- **`src/components/MedicineComparisonView.tsx`** — Partner Verified and Enterprise Partner Priority badges with boosted offer visibility.

#### Logistics & Delivery Ecosystem (Sub-Phase 4.4)
- **`src/lib/logistics.ts`** & **`src/api/logistics.ts`** — Multi-carrier 3PL adapter supporting Dunzo Express (2-hr hyperlocal), Shiprocket (intercity), and Shadowfax (cold-chain).
  - `GET /api/logistics/carriers`: Lists carrier SLA options and cold-chain certifications.
  - `POST /api/logistics/estimate`: Distance-based rate calculation with cold-chain rerouting.
  - `GET /api/logistics/track/:trackingNumber`: Real-time driver GPS coordinates, ETA countdown, vehicle info, and route waypoints.
  - `POST /api/logistics/webhook`: Carrier delivery event simulator.
- **`src/components/DeliveryTrackingModal.tsx`** — Interactive live courier tracking modal featuring route waypoints, animated moving courier pin, driver call button, vehicle plate details, and temperature monitoring badges.
- **`src/components/OrderTrackingView.tsx`** — Connected "Track Live Courier (GPS)" button to launch the live tracking modal.
- **`src/components/CartCheckoutDrawer.tsx`** — Delivery time slot selector (Express 2-hour, Today Evening, Tomorrow Morning).
- **`POST /api/orders/:id/return`** — Customer reverse logistics return request workflow.

#### Compliance & Governance (Sub-Phase 4.5)
- **`src/lib/compliance.ts`** & **`src/api/compliance.ts`** — Healthcare compliance suite:
  - `GET /api/compliance/audit-report`: Automated DISHA, HIPAA, and CDSCO compliance audit readiness report.
  - `GET /api/compliance/anonymized-data`: De-identified health dataset for clinical research compliance.
  - `POST /api/compliance/verify-license`: CDSCO Indian retail drug license verification tool.
  - `DELETE /api/compliance/patient-data/:patientId`: Patient right-to-erasure (GDPR / DISHA) with cryptographic audit tokens.

### Changed
- **`src/api/index.ts`** — Mounted `/settlements`, `/logistics`, `/compliance` routers and attached `gatewayMiddleware`.
- **`src/api/orders.ts`** — Integrated with `MarketplaceService` escrow lifecycle, event publishing, and reverse logistics return endpoint.
- **`package.json`** — Bumped version to `0.4.0`.

---

## [0.3.0] — 2026-09-09

### 🚀 Phase 3 — Growth & Expansion ✅

Expanded platform reach with transactional email notifications, clinical drug-drug interaction checker, patient medical history records with PDF export, pharmacy ecosystem with CDSCO verified profiles and CSV bulk uploads, Progressive Web App (PWA) offline capabilities, multi-language localization in 4 Indian languages, and PostHog product analytics with live admin BI dashboards.

### Added

#### Transactional Email Notifications (Sub-Phase 3.1)
- **`src/lib/email.ts`** — Resend email integration with branded HTML templates and fallback dev stub:
  - `sendOrderConfirmation`: sends itemized receipt, pricing breakdown, delivery address, and status link.
  - `sendPrescriptionStatus`: notifies patient on pharmacist acceptance or rejection with clinical notes.
  - `sendDeliveryUpdate`: alerts patient on order dispatch, tracking details, and estimated arrival.
  - `sendWelcomeEmail`: welcomes newly registered patients and pharmacies.
- **`src/api/emails.ts`** — Admin test endpoint `POST /api/emails/test` for verifying delivery.
- Integrated automated email triggers into `orders.ts` (creation & status progression), `prescriptions.ts` (review outcome), and `auth.ts` (registration).

#### Advanced Patient Features (Sub-Phase 3.2)
- **`src/components/SearchAutocomplete.tsx`** — Fast, debounced (300ms) typeahead search with keyboard navigation (↑, ↓, Enter, Esc), drug class badges, and match highlighting.
- **`src/api/interactions.ts`** & **`src/components/DrugInteractionChecker.tsx`** — Clinical drug-drug interaction screening engine with severity tiers (`severe`, `moderate`, `mild`), clinical descriptions, and evidence levels.
- Integrated interaction warning check directly into **`src/components/CartCheckoutDrawer.tsx`** to ensure safety before order placement.
- **`src/api/medical-history.ts`** & **`src/components/MedicalHistoryView.tsx`** — Comprehensive patient timeline aggregating orders and prescriptions, active 90-day medication regimen card, search/filter, and one-click jsPDF medical report export.

#### Pharmacy Ecosystem (Sub-Phase 3.3)
- **`src/components/PharmacyProfileView.tsx`** & **`src/api/pharmacies.ts`** — Public pharmacy profiles featuring CDSCO license badges, fulfillment SLAs, verified catalog inventory, and interactive patient star rating & review submission (`POST /api/pharmacies/:id/ratings`).
- **`src/components/BulkPriceUpload.tsx`** & **`src/api/bulk-upload.ts`** — Pharmacy bulk management portal featuring:
  - CSV drag-and-drop parser with live data preview and schema validation.
  - Downloadable standardized CSV template (`SKU,Price,Stock,InStock`).
  - Batch update endpoint updating seller offers and generating immutable audit records.
- Wired bulk upload seamlessly into `src/components/PharmacyPortalView.tsx`.

#### Progressive Web App (PWA) (Sub-Phase 3.4)
- **`public/manifest.json`** — Web App Manifest with standalone display mode, theme colors (`#10b981`), icons, and orientation settings.
- **`public/sw.js`** — Production-ready Service Worker supporting stale-while-revalidate for static assets, network-first for API requests, and offline fallbacks.
- **`vite-plugin-pwa`** in `vite.config.ts` — Precache asset manifest and PWA registration lifecycle.
- App icons: SVG (`public/icon.svg`), 192x192 PNG (`public/icon-192.png`), and 512x512 PNG (`public/icon-512.png`).

#### Multi-Language Localization (Sub-Phase 3.5)
- **`src/i18n/index.ts`** — react-i18next setup with `i18next-browser-languagedetector` and fallback to English.
- Complete JSON translation dictionaries in `src/i18n/locales/`:
  - English (`en/common.json`)
  - Hindi (`hi/common.json`)
  - Tamil (`ta/common.json`)
  - Telugu (`te/common.json`)
- Interactive language selector dropdown in **`src/components/Header.tsx`** with persisted user preference.

#### Advanced Analytics & BI (Sub-Phase 3.6)
- **`src/lib/analytics.ts`** — PostHog client wrapper (`initAnalytics`, `trackEvent`, `identifyUser`, `trackPageView`) with dev fallback stub.
- **`src/api/analytics.ts`** — Real-time business intelligence endpoints:
  - `GET /api/analytics/summary` — total revenue, order count, active users, prescriptions.
  - `GET /api/analytics/orders-over-time` — 30-day chronological revenue & order volume trend.
  - `GET /api/analytics/top-medicines` — highest grossing medicines and order frequencies.
  - `GET /api/analytics/pharmacy-performance` — pharmacy fulfillment speed, ratings, and GMV.
- **`src/components/AdminDashboardView.tsx`** — Interactive Recharts (`LineChart`, `BarChart`) visualizing live platform metrics and pharmacy benchmarking table.

### Changed
- **`src/App.tsx`** — Added navigation routes for `medical_history` and `pharmacy_profile`.
- **`src/components/MedicineComparisonView.tsx`** — Embedded `SearchAutocomplete` into the primary search bar.
- **`src/components/CartCheckoutDrawer.tsx`** — Added automated clinical interaction safety screening on cart contents.
- **`package.json`** — Bumped version to `0.3.0`.

---

## [0.2.0] — 2026-09-09

### 🏗️ Phase 2 — Production Readiness ✅

Foundation for production: persistent PostgreSQL database with Prisma ORM, real server-side session auth, modular API, Razorpay and Stripe payment gateways, security hardening, and automated tests.

### Added

#### Database Layer (Sub-Phase 2.1)
- **`prisma/schema.prisma`** — Complete PostgreSQL schema with 16 models: User, Session, Pharmacy, Medicine, MedicinePack, SellerOffer, Prescription, Order, OrderItem, OrderStatusEvent, AuditRecord, SupportTicket, TicketMessage, and all enums
- **`prisma/seed.ts`** — Full database seeding script migrating all mock data (5 pharmacies, 4 users with bcrypt passwords, 4 medicines, 9 packs, 11 offers, 1 prescription, 1 sample order)
- **`src/lib/db.ts`** — Prisma singleton client with hot-reload protection and environment-sensitive logging

#### Authentication (Sub-Phase 2.2)
- **`src/api/middleware/auth.ts`** — `requireAuth` and `requireRole(...roles)` RBAC middleware with typed express-session
- **`src/api/auth.ts`** — Complete auth routes: `POST /register`, `POST /login`, `POST /logout`, `GET /me`
  - bcrypt password hashing (cost factor 12)
  - Session creation/destruction
  - Passwords never returned in API responses
- Auto-session restoration on page load via `GET /api/auth/me` in `AppContext.tsx`.

#### Modular API Routes (Sub-Phase 2.3)
- **`src/api/index.ts`** — Central router mounting all domain modules with global rate limiter
- **`src/api/medicines.ts`** — Medicine catalog: search/filter, single lookup with offers, admin update
- **`src/api/offers.ts`** — Seller offers: filter, lowest-price query, pharmacy price/stock updates with audit logs
- **`src/api/prescriptions.ts`** — Full prescription lifecycle: role-scoped listing, upload, review (accept/reject), AI analysis
- **`src/api/orders.ts`** — Order CRUD: cart → order with stock validation, status progression, cancellation
- **`src/api/users.ts`** — User profile read/update (own) and admin user listing
- **`src/api/audit.ts`** — Admin-only audit trail with filtering and pagination
- **`src/api/tickets.ts`** — Support ticket CRUD with threaded messages and auto-InProgress on staff reply
- **`src/api/middleware/validate.ts`** — Zod `validateBody` and `validateQuery` middleware
- **`src/api/middleware/errorHandler.ts`** — Global async error handler with Prisma error translation + `asyncHandler` wrapper
- **`src/hooks/useApi.ts`** — Reusable typed API hook with loading, error, and refetch states.

#### Payment Gateway (Sub-Phase 2.4)
- **`src/api/payments.ts`** — Dual payment provider: Razorpay + Stripe
  - `POST /create-order` — creates Razorpay order or Stripe PaymentIntent
  - `POST /verify` — HMAC-SHA256 signature verification for Razorpay, intent status for Stripe
  - `POST /refund` — admin-only refund processing with audit log
  - Graceful stub mode when keys not configured
- **`src/components/CartCheckoutDrawer.tsx`** — Integrated payment order creation and verification flow.

#### Security Hardening (Sub-Phase 2.5)
- **`src/api/middleware/rateLimit.ts`** — Three-tier rate limiting: general (100/min), auth (10/min), AI analysis (20/min)
- **`server.ts`** — Rebuilt with Helmet HTTP security headers, CORS with credentials, session middleware, global error handler
- File upload validation: MIME type whitelist + 10MB size limit in prescriptions route

#### Testing (Sub-Phase 2.6)
- **`src/__tests__/setup.ts`** — Jest global test setup with test env vars
- **`src/__tests__/utils/prescriptionMatcher.test.ts`** — 8 unit tests for prescription matcher
- **`src/__tests__/api/auth.test.ts`** — 7 integration tests for auth routes with mocked Prisma client
- **`src/__tests__/api/orders.test.ts`** — 5 integration tests for order placement, listing, and state progression

### Changed

- **`src/context/AppContext.tsx`** — Completely refactored from in-memory arrays to live backend API calls.
- **`server.ts`** — Refactored from 281-line monolith to 65-line entry point; all routes now in `src/api/`.
- **`package.json`** — Added production & dev dependencies; added `db:*` and `test` scripts.
- **`.env.example`** — Added `DATABASE_URL`, `SESSION_SECRET`, `RAZORPAY_*`, `STRIPE_*` with descriptions.
- **`tsconfig.json`** — Added `resolveJsonModule: true` and `types: ["node", "jest"]`.

---

## [0.1.0] — 2026-09-08

### 🎉 Initial Release — Full MVP

The inaugural release of **genericMed**, a medicine price comparison and prescription-aware purchasing platform with multi-tenant architecture supporting four user roles.

### Added

#### Core Platform

- **Multi-tenant role-based architecture** with four user roles: Patient, Pharmacy, Admin, Doctor
- **Role-based navigation** — dynamic header tabs and views based on active role
- **Dark/Light theme system** with localStorage persistence and system-preference detection
- **Global toast notification system** with success, info, warning, and error types
- **Responsive layout** — mobile-first design with `max-w-7xl` content container

#### Patient Features

- **Medicine Search & Comparison** — search by name, compare prices across pharmacies with pack size normalization
- **Prescription Upload** — upload prescription images/documents for pharmacist review
- **AI Prescription Scanner** — Gemini 3.8 Flash-powered OCR to extract structured medication data from prescription images
- **Order Tracking** — view order status timeline (Created → Paid → Accepted → Packed → Shipped → Delivered)
- **Cart & Checkout Drawer** — multi-pharmacy cart with delivery fees, tax computation, and payment method selection
- **Historical Price Trends** — interactive Recharts-powered line charts showing price history over time
- **PDF Report Generation** — client-side jsPDF reports for prescription analysis and order summaries

#### Pharmacy Features

- **Pharmacy Portal** with three sub-views: Orders, Prescriptions, Inventory
- **Order Fulfillment** — accept, pack, ship orders with status tracking
- **Prescription Review** — accept/reject patient prescriptions with reason documentation
- **Inventory Management** — update stock quantities and pricing with audit trail logging

#### Admin Features

- **Admin Dashboard** with platform-wide analytics overview
- **Audit Log Viewer** — searchable/filterable audit trail of all platform actions
- **Medicine Catalog Management** — view and manage the medicine database
- **Support Ticket System** — handle escalated customer issues with threaded messages

#### Doctor Features

- **Digital Prescription Creation** — issue digital prescriptions to patients

#### Backend & API

- **Express.js server** (`server.ts`) with embedded Vite dev middleware
- **`GET /api/health`** — health check endpoint with Gemini API key status
- **`POST /api/prescription/analyze`** — AI prescription image analysis with Gemini 3.8 Flash
- **Three built-in clinical prescription samples** — Cardiology, Antibiotic, Gastroenterology
- **Graceful AI fallback** — sample data returned when no API key is configured
- **Production build pipeline** — Vite static build + esbuild server bundling

#### Authentication

- **Login/Register UI** — role-aware authentication forms
- **Account switching** — switch between registered accounts
- **Client-side auth state** managed via React Context

#### Architecture & Documentation

- **Architecture View** — in-app technical architecture visualization
- **SEO meta tags** — Open Graph and Twitter Card metadata
- **Apache-2.0 License** headers

#### Data Layer

- **Comprehensive mock data** — medicines, pharmacies, offers, prescriptions, orders, audit logs, support tickets, user accounts
- **Price history dataset** — historical pricing data for trend charts
- **Type-safe schema** — 15+ TypeScript interfaces covering all domain entities

#### Utilities

- **`pdfGenerator.ts`** — PDF report builder for prescriptions and orders
- **`prescriptionMatcher.ts`** — maps AI-extracted medicine names to catalog entries
- **`useTheme.ts`** custom hook for theme management with localStorage sync

---

## Version History Summary

| Version  | Date       | Highlights                                                                                  |
|----------|------------|---------------------------------------------------------------------------------------------|
| `0.4.0`  | 2026-09-09 | Phase 4: Service Layer, Event Bus, Docker, Marketplace Escrow, 3PL GPS Tracking, DISHA/HIPAA|
| `0.3.0`  | 2026-09-09 | Phase 3: PWA, i18n (4 langs), Resend email, drug interactions, medical history, PostHog BI |
| `0.2.0`  | 2026-09-09 | Phase 2: PostgreSQL + Prisma, session auth, 14 API routes, Razorpay/Stripe, Jest tests      |
| `0.1.0`  | 2026-09-08 | Full MVP: 4 roles, AI scanner, price comparison                                             |

---

## Changelog Entry Template

<!--
Copy this template when adding a new version:

## [X.Y.Z] — YYYY-MM-DD

### Added
- New feature or capability

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Removed
- Removed features or deprecated code

### Security
- Security-related changes

### Deprecated
- Features marked for future removal

---
-->

---

> **Maintenance Rule:** Add a new entry at the top of the "Unreleased" section for ongoing work. When cutting a release, move "Unreleased" items into a new versioned section. Always include the date.
