# 🧠 Project Memory — genericMed

> **Purpose:** Long-term persistent memory for AI assistants working on the **genericMed** platform.
> Consult this file at the start of every session to understand the current project state.
>
> **Last Updated:** 2026-09-09
> **Current Phase:** Phase 2 — Production Readiness (🔲 In Progress)


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

1. **For Patients:** Upload prescriptions, compare medicine prices across pharmacies, find generic alternatives, and order with confidence.
2. **For Pharmacies:** Manage inventory, process orders, review prescriptions, and maintain competitive pricing.
3. **For Doctors:** Issue digital prescriptions and monitor patient medication adherence.
4. **For Admins:** Oversee the platform, audit transactions, manage the medicine catalog, and handle support tickets.

### Project Repository

- **Name:** `Generic-Med-Web`
- **Type:** Full-stack web application (SPA + API server)
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
| Recharts          | 3.x      | Price trend charts and data viz       |
| jsPDF             | 4.x      | Client-side PDF generation            |

### Backend

| Technology        | Version  | Purpose                               |
|-------------------|----------|---------------------------------------|
| Express           | 4.x      | HTTP server and API routes            |
| Node.js           | 22.x+    | Runtime environment                   |
| tsx               | 4.x      | TypeScript execution for dev server   |
| esbuild           | 0.25.x   | Production server bundling            |
| dotenv            | 17.x     | Environment variable loading          |

### AI / ML

| Technology          | Version  | Purpose                             |
|---------------------|----------|-------------------------------------|
| @google/genai       | 2.4.x    | Google Gemini AI SDK                |
| Gemini 3.8 Flash    | —        | Prescription OCR & analysis model   |

### Dev Tools

| Tool               | Purpose                              |
|--------------------|--------------------------------------|
| TypeScript compiler | Type checking (`npm run lint`)      |
| Bun                | Alternative package manager (bun.lock present) |
| npm                | Primary package manager              |

---

## Features Completed

### ✅ Patient Features

- [x] **Medicine Search & Comparison** — Search medicines, compare prices across pharmacies, view pack size normalization
- [x] **Prescription Upload** — Upload prescription images/documents for pharmacist review
- [x] **AI Prescription Scanner** — Gemini-powered OCR to extract medicines from prescription images
- [x] **Order Tracking** — View order status with full timeline history (Created → Paid → Accepted → Packed → Shipped → Delivered)
- [x] **Cart & Checkout** — Multi-pharmacy cart with delivery fee calculation, tax computation, and payment method selection
- [x] **Historical Price Trends** — Interactive Recharts-powered price history graphs
- [x] **PDF Report Generation** — Download prescription analysis and order summaries as PDFs
- [x] **User Authentication** — Login/register with role selection (patient, pharmacy, admin, doctor)
- [x] **Dark/Light Theme Toggle** — Persisted theme preference with system-aware defaults

### ✅ Pharmacy Features

- [x] **Pharmacy Portal** — Order management, prescription review, and inventory control
- [x] **Order Management** — Accept, pack, ship, and track fulfillment
- [x] **Prescription Review** — Accept or reject prescriptions with reason documentation
- [x] **Inventory Management** — Update stock quantities and pricing with audit trails
- [x] **Price Management** — Adjust offer prices with mandatory reason logging

### ✅ Admin Features

- [x] **Admin Dashboard** — Platform-wide analytics, user management, and oversight
- [x] **Audit Log** — Complete audit trail of all platform actions with actor, timestamp, and diff
- [x] **Medicine Catalog Management** — View and manage the medicine database
- [x] **Support Ticket System** — Handle escalated customer issues

### ✅ Doctor Features

- [x] **Digital Prescription** — Create and issue digital prescriptions to patients

### ✅ Platform Features

- [x] **Multi-Tenant Architecture** — Role-based views (patient, pharmacy, admin, doctor)
- [x] **Architecture Documentation View** — In-app technical architecture visualization
- [x] **Responsive Design** — Mobile-first responsive layout
- [x] **Toast Notification System** — Global success/info/warning/error notifications
- [x] **Sample Prescription Data** — Three built-in clinical prescription samples (cardio, antibiotic, gastro)

---

## Pending Features

### 🔲 High Priority

- [ ] **Real Database Integration** — Replace in-memory mock data with persistent storage (PostgreSQL / MongoDB)
- [ ] **User Authentication Backend** — Server-side auth with JWT/sessions (currently client-side only)
- [ ] **Real Pharmacy API Integration** — Connect to actual pharmacy inventory/pricing APIs
- [ ] **Payment Gateway Integration** — Razorpay / Stripe for actual payment processing

### 🔲 Medium Priority

- [ ] **Email Notifications** — Order confirmations, prescription status updates, delivery alerts
- [ ] **Search Autocomplete** — Typeahead suggestions for medicine search
- [ ] **Medicine Interaction Checker** — AI-powered drug interaction warnings
- [ ] **Patient Medical History** — Persistent health records and medication history
- [ ] **Pharmacy Onboarding Flow** — Self-service pharmacy registration and verification
- [ ] **Rating & Review System** — Patient reviews for pharmacies

### 🔲 Low Priority

- [ ] **PWA Support** — Offline capability and installable web app
- [ ] **Multi-Language Support** — Hindi, Tamil, Telugu, and other regional languages
- [ ] **Admin Analytics Dashboard** — Advanced analytics with data export
- [ ] **Delivery Partner Integration** — Real-time delivery tracking with third-party logistics
- [ ] **Chatbot / AI Assistant** — In-app customer support chatbot

---

## API Endpoints

### Server: `server.ts` (Express, Port 3000)

| Method | Endpoint                      | Purpose                           | Auth | Request Body                                    | Response                          |
|--------|-------------------------------|-----------------------------------|------|-------------------------------------------------|-----------------------------------|
| `GET`  | `/api/health`                 | Health check                      | No   | —                                               | `{ status, timestamp, geminiKeyConfigured }` |
| `POST` | `/api/prescription/analyze`   | AI prescription image analysis    | No   | `{ image, mimeType?, sampleId?, notes? }`       | `PrescriptionAnalysisResult`      |

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2026-09-08T09:00:00.000Z",
  "geminiKeyConfigured": true
}
```

### Prescription Analysis Flow

1. If `sampleId` is provided and no API key → return built-in sample data.
2. If API key + image → call Gemini 3.8 Flash vision API with structured output schema.
3. Fallback → return default sample data (`sample-cardio`).

### Built-in Sample IDs

| Sample ID            | Specialty       | Medicines                           |
|----------------------|-----------------|-------------------------------------|
| `sample-cardio`      | Cardiology      | Atorvastatin 10mg, Metformin 500mg  |
| `sample-antibiotic`  | Pulmonology     | Amoxicillin 500mg, Montelukast 10mg |
| `sample-gastro`      | Internal Med    | Pantoprazole 40mg, Paracetamol 650mg|

---

## Data Schema Summary

> All types defined in [`src/types.ts`](file:///c:/Users/Yash/Downloads/Generic-Med-Web/src/types.ts)

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
