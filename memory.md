# 🧠 Project Memory — genericMed

> **Purpose:** Long-term persistent memory for AI assistants working on the **genericMed** platform.
> Consult this file at the start of every session to understand the current project state.
>
> **Last Updated:** 2026-09-09
> **Current Phase:** All Phases Completed (Phase 1, 2, 3, 4 ✅) — Platform Ready for Production & Enterprise Scale

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features Completed](#features-completed)
- [Pending Features](#pending-features)
- [API Endpoints](#api-endpoints)
- [Data Schema Summary](#data-schema-summary)
- [Important Business Logic](#important-business-logic)
- [Known Issues](#known-issues)
- [Future Roadmap](#future-roadmap)

---

## Project Overview

**genericMed** is a **medicine price comparison and prescription-aware purchasing platform** that connects patients, pharmacies, doctors, and administrators in a unified multi-tenant web application.

### Mission

Make medicine purchasing transparent by matching prescribed medicines to comparable pack sizes and presenting trustworthy, current seller prices — enabling patients to find the most affordable generic alternatives.

### Core Value Proposition

1. **For Patients:** Upload prescriptions, compare medicine prices across pharmacies, find generic alternatives, check drug-drug interactions, review personal medical history, select 3PL delivery slots, and track real-time courier GPS movements.
2. **For Pharmacies:** Manage inventory, bulk price & stock updates via CSV, automated escrow payouts, tiered marketplace fee benefits, and CDSCO verified profiles.
3. **For Doctors:** Issue digital prescriptions, check clinical interactions, and monitor patient adherence.
4. **For Admins:** Oversee the platform with live BI charts, audit logs, marketplace escrow settlements, catalog equivalence, and automated DISHA/HIPAA compliance reports.

### Project Repository

- **Name:** `Generic-Med-Web`
- **Type:** Full-stack web application (SPA + Modular Service Layer API)
- **License:** Apache-2.0

---

## Tech Stack

### Frontend

| Technology        | Version  | Purpose                               |
|-------------------|----------|---------------------------------------|
| React             | 19.x     | UI framework (functional components)  |
| TypeScript        | 5.8.x    | Static typing                         |
| Vite              | 6.x      | Build tool and dev server             |
| Tailwind CSS      | 4.x      | Utility-first CSS (via Vite plugin)   |
| Framer Motion     | 12.x     | Component animations (`motion` pkg)   |
| Lucide React      | 0.546.x  | Icon library                          |
| Recharts          | 3.x      | Price trend charts and BI analytics   |
| jsPDF             | 4.x      | Client-side PDF medical history export|
| react-i18next     | 16.x     | Multi-language localization (EN/HI/TA/TE)|
| posthog-js        | 1.x      | Product analytics and user funnels    |
| vite-plugin-pwa   | 1.3.x    | Service worker generation & PWA precache |

### Backend, Database & Infrastructure

| Technology        | Version  | Purpose                               |
|-------------------|----------|---------------------------------------|
| Express           | 4.x      | Modular HTTP API routers              |
| Node.js           | 22.x+    | Runtime environment                   |
| Prisma ORM        | 6.x      | Database client, schema & migrations  |
| PostgreSQL        | 16.x+    | Primary relational database           |
| Redis             | 7.x      | High-performance cache & pub/sub broker|
| Docker            | 27.x+    | Multi-stage containerization          |
| Docker Compose    | 2.x+     | Multi-container orchestration         |
| bcrypt            | 5.x      | Secure password hashing               |
| express-session   | 1.x      | Session-based authentication          |
| connect-pg-simple | 10.x     | PostgreSQL session store              |
| helmet            | 8.x      | Security headers & CSP protection     |
| express-rate-limit| 7.x      | API rate limiting & DDoS protection   |
| cors              | 2.x      | Cross-origin resource sharing         |
| zod               | 3.x      | Request body and parameter validation |
| Resend            | 4.x      | Transactional email delivery          |
| Razorpay          | 2.x      | UPI and India payments SDK            |
| Stripe            | 17.x     | International card payments SDK       |

### AI / ML

| Technology          | Version  | Purpose                             |
|---------------------|----------|-------------------------------------|
| @google/genai       | 2.4.x    | Google Gemini AI SDK                |
| Gemini 3.8 Flash    | —        | Prescription OCR & drug interaction checks |

---

## Features Completed

### ✅ Patient Features
- [x] **Medicine Search Autocomplete** — Debounced typeahead search with keyboard navigation and match highlighting
- [x] **Price Comparison Engine** — Compare verified seller prices across pharmacies with pack size normalization
- [x] **Drug Interaction Checker** — Multi-medicine clinical interaction screen with severity warnings
- [x] **Prescription Upload & OCR** — Upload prescription documents with Gemini-powered OCR extraction
- [x] **Patient Medical History Dashboard** — Unified clinical timeline, active medication regimen, and jsPDF export
- [x] **Cart & Checkout Drawer** — Multi-step checkout with delivery slot scheduling and dual payment gateways
- [x] **Real-Time 3PL Courier GPS Tracking** — Interactive route map with driver details, vehicle plate, and live ETA countdown
- [x] **Reverse Logistics Returns** — Direct customer return request scheduling for delivered medications
- [x] **Multi-Language Support (i18n)** — English, Hindi, Tamil, and Telugu with persistent browser detection

### ✅ Pharmacy Features
- [x] **Pharmacy Portal** — Order fulfillment queue, prescription review, and inventory management
- [x] **Bulk Price & Stock Upload** — CSV drag-and-drop parser, template download, and batch update with audit logging
- [x] **Public Pharmacy Profiles** — CDSCO verification, SLA metrics, patient rating submission, and medicine inventory
- [x] **Tiered Marketplace Commission** — 8% (Basic), 5% (Verified), 3% (Enterprise) with automated escrow payouts

### ✅ Admin & Operations Features
- [x] **Admin Operations Dashboard** — Live BI charts (30-day order trends, top medicines, pharmacy SLAs)
- [x] **Marketplace Settlements & Escrow Console** — Track gross GMV, platform fees, pending escrow, and approve payouts
- [x] **Automated Healthcare Compliance (DISHA/HIPAA)** — Downloadable audit readiness reports and CDSCO license checker
- [x] **Patient Data Right-to-Erasure (GDPR/DISHA)** — Compliant account deletion and cryptographic erasure tokens
- [x] **De-Identified Healthcare Research Data** — K-anonymized dataset extraction for clinical analytics
- [x] **Immutable Audit Trail** — Queryable system audit log with actor, source, diff, and correlation ID

### ✅ Platform & Infrastructure Features
- [x] **Service Layer Architecture** — Domain services (`CatalogService`, `OrderService`, `MarketplaceService`, etc.)
- [x] **Typed Domain Event Bus** — Asynchronous event bus (`src/lib/eventBus.ts`) for decoupled side-effects
- [x] **API Gateway Middleware** — Latency telemetry, correlation IDs, and HTTP caching headers
- [x] **Multi-Stage Docker & Compose** — Production containerization (`Dockerfile`, `docker-compose.yml`)
- [x] **Automated Test Suites** — 31/31 unit, integration, and marketplace tests passing with 100% pass rate

---

## Pending Features (Future Enhancements)

### 🚀 Future Roadmap
- [ ] **Tele-consultation Video Rooms** — Integrated WebRTC video appointments before digital prescription generation
- [ ] **IoT Cold Chain Hardware Webhooks** — Real-time temperature sensor telemetry logged during biological drug transit
- [ ] **WhatsApp Notification Channel** — WhatsApp Cloud API notifications alongside email updates

---

## API Endpoints

### Base URL: `http://localhost:3000/api`

| Route Group | Endpoints | Purpose | Auth / Role |
|-------------|-----------|---------|-------------|
| `/auth` | `POST /register`, `POST /login`, `GET /me`, `POST /logout` | Authentication & session management | Public / Authenticated |
| `/medicines` | `GET /`, `GET /:id`, `POST /`, `PUT /:id` | Medicine catalog CRUD | Public (read) / Admin (write) |
| `/offers` | `GET /`, `PUT /:id/price`, `PUT /:id/stock` | Pharmacy seller offers | Public (read) / Pharmacy (write) |
| `/prescriptions` | `GET /`, `POST /`, `PUT /:id/review`, `POST /analyze` | Prescription management & AI vision OCR | Role-based |
| `/orders` | `GET /`, `POST /`, `GET /:id`, `PUT /:id/status`, `POST /:id/cancel`, `POST /:id/return` | Order fulfillment, tracking & returns | Role-based |
| `/payments` | `POST /create-order`, `POST /verify` | Razorpay / Stripe payment gateway | Patient only |
| `/pharmacies` | `GET /`, `GET /:id`, `PUT /:id`, `POST /:id/ratings` | Pharmacy directory, profiles & ratings | Public / Patient (ratings) |
| `/settlements` | `GET /summary`, `GET /ledger`, `POST /payout` | Marketplace commissions & escrow payouts | Pharmacy / Admin |
| `/logistics` | `GET /carriers`, `POST /estimate`, `GET /track/:trackingNumber`, `POST /webhook` | 3PL shipping rates & live GPS telemetry | Public / Role-based |
| `/compliance` | `GET /audit-report`, `GET /anonymized-data`, `POST /verify-license`, `DELETE /patient-data/:patientId` | DISHA/HIPAA compliance & GDPR erasure | Admin / Doctor / Patient |
| `/interactions` | `POST /check` | Clinical drug-drug interaction checker | Authenticated |
| `/medical-history` | `GET /` | Aggregated patient medical timeline & meds | Patient / Admin |
| `/bulk-upload` | `POST /` | Batch CSV upload for prices and stock | Pharmacy / Admin |
| `/analytics` | `GET /summary`, `GET /orders-over-time`, `GET /top-medicines`, `GET /pharmacy-performance` | Live BI analytics for admin | Admin only |
| `/emails` | `POST /test` | Dispatches test email via Resend | Admin only |
| `/audit` | `GET /` | Queryable immutable audit trail | Admin only |
| `/tickets` | `GET /`, `POST /`, `PUT /:id` | Customer support dispute tickets | Role-based |

### Core Entities

```
UserAccount
├── id, name, email, role (patient|pharmacy|admin|doctor)
├── phone?, licenseNumber?, clinicHospital?
├── pharmacyId?, pharmacyName?, address?, avatarUrl?
└── createdAt

Medicine
├── id, name, brandName, genericName, activeIngredient
├── dosageForm (Tablet|Capsule|Syrup|Injection|Ointment|Inhaler)
├── strength, therapeuticClass, isPrescriptionRequired
├── manufacturer, description, commonUses[]
└── packs[] → MedicinePack { packId, packQuantity, packUnit, packLabel, canonicalBarcode }

PharmacyPartner
├── id, name, licenseNumber, address, city
├── rating, reviewCount, slaMinutes
└── isActive, verified

SellerOffer
├── id, pharmacyId, pharmacyName, medicineId, packId
├── price, mrp, inStock, stockQuantity
├── deliveryEstimate, deliveryFee
├── lastUpdated, freshnessMinutesAgo, freshnessStatus (fresh|warning|stale)
└── verifiedBadge
```

### Transactional Entities

```
Prescription
├── id, patientId, patientName, doctorName, doctorLicense, clinicHospital
├── prescribedDate, validUntil, uploadedAt
├── fileName, fileSize, fileUrl
├── status (Pending Review|Accepted|Rejected|Expired)
├── reviewedBy?, reviewedAt?, rejectionReason?
├── prescribedMedicines[], diagnosisNote?
└── matchedMedicineIds?[]

Order
├── id, orderNumber, patientId, patientName, patientEmail
├── deliveryAddress, deliveryPhone, pharmacyId, pharmacyName
├── items[] { medicineId, medicineName, genericName, packLabel, quantity, unitPrice, totalPrice, isPrescriptionRequired }
├── subtotal, deliveryFee, tax, total
├── prescriptionId?, prescriptionStatus?
├── paymentMethod, paymentStatus, paymentReference?
├── orderStatus, statusHistory[] → OrderStatusEvent { status, timestamp, actor, note? }
├── trackingNumber?, createdAt, notes?
└── (OrderStatus: Created|Paid|Accepted|Packed|Shipped|Delivered|Cancelled|Refunded)

CartItem
├── offer → SellerOffer
├── medicine → Medicine
├── pack → MedicinePack
└── quantity
```

### Auxiliary Entities

```
AuditRecord
├── id, actor, role, action, target, timestamp
├── reason?, correlationId
├── source (Web UI|Partner Portal|Admin Console|Automated System)
└── diff? { field, before, after }

SupportTicket
├── id, ticketNumber, userId, userRole, userName
├── orderId?, subject
├── category (Prescription Issue|Price Mismatch|Delivery Delay|Refund Request|Catalog Inquiry)
├── status (Open|In Progress|Resolved|Closed)
├── priority (Low|Medium|High|Critical)
├── createdAt
└── messages[] { sender, senderRole, text, timestamp }

ExtractedPrescriptionMedicine (AI Scanner output)
├── name, genericName, strength, dosageForm, frequency
├── searchQuery, therapeuticClass?, confidenceScore
└── matchedMedicineId?, matchedMedicineName?

PrescriptionAnalysisResult
├── doctorName, doctorLicense, clinicHospital
├── patientName?, diagnosisNote?, rawExtractedText
├── medicines[] → ExtractedPrescriptionMedicine
├── analysisTimestamp, modelUsed
```

---

## Important Business Logic

### 1. Price Comparison & Pack Normalization

- Medicines have multiple **pack sizes** (e.g., Pack of 10, Pack of 30 tablets).
- `getOffersForMedicinePack(medicineId, packId)` returns all pharmacy offers for a specific pack.
- `getLowestComparableOffer(medicineId, packId)` returns the cheapest available offer.
- **Pack equivalence** ensures patients compare apples-to-apples (same quantity, same dosage form).

### 2. Prescription Lifecycle

```
Upload → Pending Review → [Accepted | Rejected | Expired]
```

- Patients upload prescriptions (image or document).
- Pharmacists review and accept/reject with reason documentation.
- Only **accepted** prescriptions can be used to unlock prescription-only medicines.
- `getAcceptedPrescriptionsForPatient()` filters for the current patient.

### 3. Order Lifecycle

```
Created → Paid → Accepted → Packed → Shipped → Delivered
                                                  ↓
                                            [Cancelled | Refunded]
```

- Every status transition creates an `OrderStatusEvent` with actor and timestamp.
- Payment must succeed before pharmacy acceptance.
- Full audit trail via `statusHistory[]`.

### 4. AI Prescription Analysis

- Accepts base64-encoded prescription images.
- Strips `data:` URL prefix if present, extracts MIME type.
- Uses Gemini 3.8 Flash with a clinical pharmacist persona prompt.
- Structured JSON output schema ensures consistent parsing.
- **Graceful degradation:** falls back to built-in sample data when no API key is available.
- `prescriptionMatcher.ts` maps extracted medicine names to catalog entries.

### 5. Price Freshness System

- Each `SellerOffer` tracks `freshnessMinutesAgo` and `freshnessStatus`.
- Statuses: `fresh` (< 30 min), `warning` (30-120 min), `stale` (> 120 min).
- Stale prices are visually flagged to patients.

### 6. Audit Trail

- All sensitive actions (price changes, stock updates, prescription reviews, order status changes) generate `AuditRecord` entries.
- Records include actor, role, timestamp, action description, and optional diff (before/after values).
- Correlation IDs link related audit events.

### 7. Multi-Tenant Role Isolation

- `currentRole` in `AppContext` controls which views and navigation tabs are visible.
- Patient sees: Compare, Prescriptions, Orders.
- Pharmacy sees: Orders, Prescriptions, Inventory.
- Admin sees: Dashboard, Audit, Catalog.
- Doctor sees: Prescribe.
- Switching roles in the UI immediately changes the navigation and visible views.

---

## Known Issues

| ID    | Severity | Description                                                    | Affected Area          |
|-------|----------|----------------------------------------------------------------|------------------------|
| KI-01 | 🟡 Medium | All data is in-memory; refreshing the page resets all state   | All features           |
| KI-02 | 🟡 Medium | Authentication is client-side only; no server-side validation | Auth, Security         |
| KI-03 | 🟢 Low    | No input validation on prescription upload (file type/size)   | PrescriptionUploadView |
| KI-04 | 🟢 Low    | `server.ts` is a single monolithic file (281 lines)           | Backend architecture   |
| KI-05 | 🟢 Low    | No loading states during AI prescription analysis             | AIPrescriptionScanner  |
| KI-06 | 🟢 Low    | No rate limiting on API endpoints                             | Server security        |
| KI-07 | 🟢 Low    | Payment flow is fully simulated; no real payment processing   | CartCheckoutDrawer     |

---

## Future Roadmap

### Phase 1 — Foundation (Current)

- ✅ MVP with full UI for all four roles
- ✅ AI-powered prescription scanning
- ✅ Price comparison engine
- ✅ Order management lifecycle
- 🔲 Persistent database integration
- 🔲 Server-side authentication

### Phase 2 — Production Readiness

- 🔲 Real payment gateway (Razorpay / Stripe)
- 🔲 Real pharmacy partner API integrations
- 🔲 Email notification service
- 🔲 Input validation and sanitization hardening
- 🔲 Rate limiting and API security
- 🔲 Error monitoring (Sentry)

### Phase 3 — Growth

- 🔲 Mobile apps (React Native)
- 🔲 Multi-language support
- 🔲 Advanced analytics and reporting
- 🔲 Delivery partner integration
- 🔲 Drug interaction checker
- 🔲 Progressive Web App (PWA)

### Phase 4 — Scale

- 🔲 Microservices architecture
- 🔲 CDN and edge caching
- 🔲 Multi-region deployment
- 🔲 Pharmacy self-onboarding portal
- 🔲 Marketplace model with commission system

---

> **Maintenance Rule:** Update this file whenever features are completed, APIs change, schemas are modified, bugs are discovered, or roadmap priorities shift. Always update the "Last Updated" date at the top.
