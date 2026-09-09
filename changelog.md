# 📝 Changelog — genericMed

> **Purpose:** Chronological history of all project changes.
> Follow [Keep a Changelog](https://keepachangelog.com/) format.
> Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

_Upcoming changes not yet tagged for release._

### Planned

- Session store upgrade: MemoryStore → connect-pg-simple (PostgreSQL sessions)
- `AppContext.tsx` refactor to fetch data from real API endpoints
- `CartCheckoutDrawer.tsx` real Razorpay/Stripe checkout widget integration
- Email notifications for order/prescription events
- Input validation and security audit

---

## [0.2.0] — 2026-09-09

### 🏗️ Phase 2 — Production Readiness (In Progress)

Foundation for production: persistent database, real server-side auth, modular API, payment gateways, security hardening, and automated tests.

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

#### Modular API Routes (Sub-Phase 2.3)
- **`src/api/index.ts`** — Central router mounting all 9 domain modules with global rate limiter
- **`src/api/medicines.ts`** — Medicine catalog: search/filter, single lookup with offers, admin update
- **`src/api/offers.ts`** — Seller offers: filter, lowest-price query, pharmacy price/stock updates with audit logs
- **`src/api/prescriptions.ts`** — Full prescription lifecycle: role-scoped listing, upload, review (accept/reject), AI analysis
- **`src/api/orders.ts`** — Order CRUD: cart → order with stock validation, status progression, cancellation
- **`src/api/users.ts`** — User profile read/update (own) and admin user listing
- **`src/api/audit.ts`** — Admin-only audit trail with filtering and pagination
- **`src/api/tickets.ts`** — Support ticket CRUD with threaded messages and auto-InProgress on staff reply
- **`src/api/middleware/validate.ts`** — Zod `validateBody` and `validateQuery` middleware
- **`src/api/middleware/errorHandler.ts`** — Global async error handler with Prisma error translation + `asyncHandler` wrapper

#### Payment Gateway (Sub-Phase 2.4)
- **`src/api/payments.ts`** — Dual payment provider: Razorpay + Stripe
  - `POST /create-order` — creates Razorpay order or Stripe PaymentIntent
  - `POST /verify` — HMAC-SHA256 signature verification for Razorpay, intent status for Stripe
  - `POST /refund` — admin-only refund processing with audit log
  - Graceful stub mode when keys not configured

#### Security Hardening (Sub-Phase 2.5)
- **`src/api/middleware/rateLimit.ts`** — Three-tier rate limiting: general (100/min), auth (10/min), AI analysis (20/min)
- **`server.ts`** — Rebuilt with Helmet HTTP security headers, CORS with credentials, session middleware, global error handler
- File upload validation: MIME type whitelist + 10MB size limit in prescriptions route

#### Testing (Sub-Phase 2.6)
- **`src/__tests__/setup.ts`** — Jest global test setup with test env vars
- **`src/__tests__/utils/prescriptionMatcher.test.ts`** — 8 unit tests for prescription matcher (exact match, brand name, no-match, empty catalog)
- **`src/__tests__/api/auth.test.ts`** — 7 integration tests for auth routes with mocked Prisma client

### Changed

- **`server.ts`** — Refactored from 281-line monolith to 65-line entry point; all routes now in `src/api/`
- **`package.json`** — Version bumped to 0.2.0; added 12 production deps + 9 devDeps; new `db:*` and `test` scripts; Jest config added
- **`.env.example`** — Added `DATABASE_URL`, `SESSION_SECRET`, `RAZORPAY_*`, `STRIPE_*` with descriptions
- **`tsconfig.json`** — Added `resolveJsonModule: true` and `types: ["node", "jest"]`



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
- **`useTheme.ts`** — custom hook for theme management with localStorage sync

---

## Version History Summary

| Version  | Date       | Highlights                                     |
|----------|------------|-------------------------------------------------|
| `0.1.0`  | 2026-09-08 | Full MVP: 4 roles, AI scanner, price comparison |

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
