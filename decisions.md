# 📋 Technical & Product Decisions Log

> **Purpose:** Document every important technical and product decision made during the development of **genericMed**.
> AI assistants must consult this file before proposing changes that conflict with past decisions.

---

## Decision Template

<!--
Copy this template for each new decision:

### DEC-XXX: [Title]

| Field                | Detail |
|----------------------|--------|
| **Date**             | YYYY-MM-DD |
| **Status**           | ✅ Accepted / ⏳ Pending / ❌ Superseded |
| **Decision Maker**   | Name / Role |

**Context / Problem:**
_What prompted this decision?_

**Decision:**
_What was decided?_

**Reasoning:**
_Why was this chosen?_

**Alternatives Considered:**
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Alt A       |      |      |              |
| Alt B       |      |      |              |

**Impact on Project:**
_What parts of the codebase or product are affected?_

---
-->

---

## Active Decisions

### DEC-001: Vite + React + TypeScript as Frontend Stack

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Needed a modern, fast-building frontend framework with strong typing support for a complex multi-view medical platform.

**Decision:**
Use **Vite 6** as the build tool with **React 19** and **TypeScript 5.8** for the entire frontend application.

**Reasoning:**
- Vite offers near-instant HMR and fast cold starts, critical during rapid prototyping.
- React 19 provides the latest concurrent features and hooks API.
- TypeScript adds compile-time safety essential for medical/pharmaceutical data handling.

**Alternatives Considered:**
| Alternative     | Pros                        | Cons                              | Why Rejected                         |
|-----------------|-----------------------------|-----------------------------------|--------------------------------------|
| Next.js         | SSR, routing, full-stack    | Heavier, opinionated structure    | SPA model sufficient; Express backend already chosen |
| Webpack + React | Mature ecosystem            | Slower builds, complex config     | Vite is faster and simpler           |
| Svelte          | Smaller bundles, less code  | Smaller ecosystem, team unfamiliar | React expertise on team              |

**Impact on Project:**
All frontend code, build pipeline, and development workflow depend on this choice. Changing would require full rewrite of 16+ components.

---

### DEC-002: Express.js Backend with Embedded Vite Dev Server

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Needed a lightweight backend to serve API endpoints (prescription analysis) and integrate with Gemini AI, while keeping the development experience seamless with HMR.

**Decision:**
Use a single `server.ts` Express app that embeds Vite's dev middleware in development mode and serves static `dist/` in production.

**Reasoning:**
- Single-process architecture simplifies deployment and development.
- Express is lightweight and sufficient for the current API surface (health check + prescription analysis).
- Embedding Vite avoids needing a separate dev server or proxy configuration.

**Alternatives Considered:**
| Alternative        | Pros                       | Cons                                | Why Rejected                    |
|--------------------|----------------------------|-------------------------------------|---------------------------------|
| Separate API + SPA | Clean separation           | CORS handling, two processes        | Complexity overhead not justified |
| Fastify            | Faster, schema validation  | Less ecosystem familiarity          | Express is more battle-tested    |
| tRPC               | Type-safe API calls        | Coupling frontend/backend types     | Only 1-2 endpoints; overkill     |

**Impact on Project:**
All API endpoints live in `server.ts`. Build script produces both Vite static output and bundled `server.cjs` via esbuild.

---

### DEC-003: Tailwind CSS v4 for Styling

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Needed a styling approach that enables rapid UI development across 16+ components with consistent dark/light theme support.

**Decision:**
Use **Tailwind CSS v4** via the `@tailwindcss/vite` plugin with utility-first classes throughout all components.

**Reasoning:**
- Utility-first approach accelerates UI development.
- Built-in dark mode support via `dark:` variants.
- v4 integrates natively with Vite as a plugin (no PostCSS config required).
- Consistent design tokens across the entire application.

**Alternatives Considered:**
| Alternative    | Pros                        | Cons                               | Why Rejected                      |
|----------------|-----------------------------|------------------------------------|-----------------------------------|
| Vanilla CSS    | Full control, no dependency | Slower development, no tokens      | Speed of development prioritized  |
| CSS Modules    | Scoped styles, no conflicts | Verbose, no utility classes        | Tailwind faster for prototyping   |
| Styled Components | CSS-in-JS, co-located  | Runtime overhead, bundle size      | Performance concerns              |

**Impact on Project:**
All 16 components use Tailwind utility classes. Removing Tailwind would require restyling the entire application.

---

### DEC-004: Google Gemini AI for Prescription OCR Analysis

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Core product feature requires extracting structured medication data from prescription images (OCR + medical NLP).

**Decision:**
Use **Google Gemini 3.8 Flash** via `@google/genai` SDK with structured JSON output schema for prescription analysis.

**Reasoning:**
- Gemini Flash offers fast multimodal (vision + text) inference at low cost.
- Structured output schema (`responseMimeType: 'application/json'`) ensures reliable parsing.
- Built-in fallback to sample prescriptions when API key is unavailable, ensuring demo-ability.

**Alternatives Considered:**
| Alternative       | Pros                       | Cons                           | Why Rejected                      |
|-------------------|----------------------------|--------------------------------|-----------------------------------|
| GPT-4 Vision      | Strong OCR capabilities    | Higher cost, OpenAI dependency | Gemini integration with AI Studio |
| Tesseract + NLP   | Open source, no API cost   | Poor handwriting OCR, complex  | Accuracy insufficient for Rx      |
| AWS Textract      | Enterprise-grade OCR       | AWS lock-in, higher cost       | Gemini offers multimodal in one   |

**Impact on Project:**
`server.ts` POST `/api/prescription/analyze` endpoint, `AIPrescriptionScanner.tsx` component, and all prescription-related flows depend on this.

---

### DEC-005: Multi-Tenant Role-Based Architecture (Patient, Pharmacy, Admin, Doctor)

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Platform serves multiple stakeholder types — patients comparing prices, pharmacies managing inventory, admins auditing, and doctors prescribing.

**Decision:**
Implement a **four-role architecture** (`patient | pharmacy | admin | doctor`) with role-based view switching in a single SPA, managed via React Context (`AppContext`).

**Reasoning:**
- Single codebase reduces maintenance overhead.
- Context-based role switching enables rapid demo and testing of all user flows.
- Each role gets dedicated views and navigation tabs.

**Alternatives Considered:**
| Alternative             | Pros                          | Cons                              | Why Rejected                    |
|-------------------------|-------------------------------|-----------------------------------|---------------------------------|
| Separate apps per role  | Clean separation, smaller bundles | Multiple codebases, shared logic duplication | Maintenance burden too high |
| Micro-frontends         | Independent deployments       | Complex orchestration             | Over-engineering at this stage  |

**Impact on Project:**
`UserRole` type, `AppContext`, `Header` navigation, and all role-specific views are built around this decision.

---

### DEC-006: Client-Side Mock Data for MVP

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ⏳ Pending (to be replaced with real database) |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Need to demonstrate full platform functionality without a real database during the MVP/demo phase.

**Decision:**
Use comprehensive client-side mock data (`src/data/mockData.ts`, `src/data/priceHistoryData.ts`) managed through React Context state, with all CRUD operations performed in-memory.

**Reasoning:**
- Enables rapid iteration without database setup.
- Full-fidelity demo of all features (medicines, offers, prescriptions, orders, audits, tickets).
- Easy to replace with API calls when backend is ready.

**Alternatives Considered:**
| Alternative     | Pros                    | Cons                                | Why Rejected                    |
|-----------------|-------------------------|-------------------------------------|---------------------------------|
| SQLite + Prisma | Real persistence        | Setup overhead, migration management | MVP speed prioritized           |
| JSON Server     | Quick REST API          | Limited querying, no relationships  | Mock data is more flexible      |
| Firebase        | Real-time, hosted       | Vendor lock-in, cost               | Want to keep options open        |

**Impact on Project:**
All data is ephemeral — refreshing the page resets state. Must be replaced with persistent storage before production.

---

### DEC-007: jsPDF for Client-Side PDF Generation

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Founding Team |

**Context / Problem:**
Users need to download prescription analysis reports, order summaries, and comparison reports as PDFs.

**Decision:**
Use **jsPDF** for client-side PDF generation (`src/utils/pdfGenerator.ts`).

**Reasoning:**
- No server-side rendering needed — reduces backend load.
- Works offline once the page is loaded.
- Full control over PDF layout and content.

**Alternatives Considered:**
| Alternative        | Pros                     | Cons                         | Why Rejected                   |
|--------------------|--------------------------|------------------------------|--------------------------------|
| Puppeteer (server) | HTML-to-PDF, high fidelity | Server-side, heavy dependency | Client-side preferred          |
| react-pdf          | React components as PDF  | Complex setup, rendering quirks | jsPDF is simpler for our needs |

**Impact on Project:**
`pdfGenerator.ts` utility is used by prescription scanner and order tracking views.

---

### DEC-008: PostgreSQL and Prisma for the Phase 2 Data Layer

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Engineering Team |

**Context / Problem:**
Phase 2 requires durable, relational storage for accounts, pharmacies, catalog data, prescriptions, orders, payments, and audit records. The MVP keeps all of this in browser memory.

**Decision:**
Use **PostgreSQL** as the production database and **Prisma** as the ORM and migration system. The initial schema will preserve the existing domain identifiers so the current mock data can become a deterministic seed set during the migration.

**Reasoning:**
- Orders, inventory offers, prescription reviews, payments, and audits are strongly relational and need transactions and referential integrity.
- PostgreSQL provides mature constraints, JSON support for audit diffs, and connection pooling support.
- Prisma supplies typed queries, declarative migrations, and a safe path from the existing TypeScript data model.

**Alternatives Considered:**
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| MongoDB + Mongoose | Flexible documents, fast prototyping | Weaker relational constraints and transactional modeling for this domain | The transactional model is a better fit for PostgreSQL |
| Raw `pg` queries | Minimal abstraction | More boilerplate and less type safety | Prisma improves migration safety and maintainability |
| SQLite | Easy local setup | Not a suitable production multi-user deployment target | PostgreSQL is required for the production path |

**Impact on Project:**
Adds `prisma/` schema, migration, and seed assets; backend repositories/routes will use Prisma; the client-side mock collections will be replaced in successive API migration slices.

---

### DEC-009: JWT Access Tokens with Rotating Refresh Tokens

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Engineering Team |

**Context / Problem:**
The MVP authentication flow trusts client-side state and does not verify passwords or enforce roles on the server.

**Decision:**
Use short-lived signed JWT access tokens, a rotating refresh token persisted as a hash in PostgreSQL, and `bcryptjs` password hashing. Refresh tokens are delivered in HTTP-only, same-site cookies; access tokens are intended to remain in memory and be sent as bearer tokens.

**Reasoning:**
- A short-lived access token keeps REST endpoints stateless and straightforward for the SPA.
- Refresh token rotation enables revocation and reduces replay exposure.
- HTTP-only cookies avoid exposing the long-lived credential to JavaScript.
- `bcryptjs` works consistently in the existing Node toolchain without native build requirements.

**Alternatives Considered:**
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Server sessions | Simple revocation model | Requires session storage and CSRF-first integration | JWT supports the planned API architecture with scoped refresh storage |
| Long-lived JWT only | Less code | Cannot safely revoke or rotate sessions | Insufficient for medical and commerce data |
| Client-side role switching | Fast demo behavior | No server-side trust boundary | Insecure and only retained temporarily for the MVP UI |

**Impact on Project:**
Adds auth endpoints and middleware. Server-side RBAC becomes the authority; the current UI role switcher remains a temporary demo affordance until the client data migration is completed.

---

### DEC-010: Vitest for Phase 2 Automated Testing

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Engineering Team |

**Context / Problem:**
The MVP has no automated test framework, while Phase 2 requires coverage for security-sensitive utility, API, and component paths.

**Decision:**
Adopt **Vitest** for unit and API-adjacent tests. React Testing Library and Supertest will be added with their respective test slices; browser E2E remains a later Phase 2 task.

**Reasoning:**
- Vitest integrates directly with Vite and TypeScript.
- It supports fast isolated tests and can grow into component coverage without a separate transform pipeline.

**Alternatives Considered:**
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Jest | Mature ecosystem | Extra Vite/ESM configuration | Vitest is a closer fit for this Vite application |
| No automated tests | No setup cost | Does not meet Phase 2 quality requirements | Not acceptable for production readiness |

**Impact on Project:**
Adds a test script and initial coverage for new validation and authentication utilities before broader client migration work.

---

### DEC-011: Payment Provider Deferred Until Merchant Ownership Is Confirmed

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-08 |
| **Status**           | ⏳ Pending |
| **Decision Maker**   | Product Owner Required |

**Context / Problem:**
Phase 2 needs a live payment provider, but no merchant entity, operating country, settlement account, webhook domain, or provider credentials have been supplied.

**Decision:**
Build the database payment model and server-side payment boundary now. Choose and activate Razorpay, Stripe, or another provider only after the product owner confirms the merchant and deployment details.

**Impact on Project:**
Prevents an irreversible provider integration from being guessed. Checkout remains explicitly simulated until a provider decision and credentials are available.

---

### DEC-008: PostgreSQL + Prisma ORM for Persistent Database

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Phase 2 requires replacing in-memory mock data with a real persistent database. All entities (users, medicines, orders, prescriptions, audit logs) must survive page refreshes and be accessible server-side.

**Decision:**
Use **PostgreSQL** as the database and **Prisma v6** as the ORM/query builder.

**Reasoning:**
- PostgreSQL's relational model maps cleanly to the domain: medicines → packs (1:N), orders → items (1:N), tickets → messages (1:N).
- Prisma provides auto-generated TypeScript types from schema, eliminating runtime type mismatches.
- `prisma migrate` makes schema evolution safe and auditable.
- Prisma Studio gives a GUI for data inspection during development.

**Alternatives Considered:**
| Alternative     | Pros                      | Cons                             | Why Rejected                   |
|-----------------|---------------------------|----------------------------------|--------------------------------|
| MongoDB/Mongoose| Flexible schema            | Weak relational integrity         | Medical data needs strict joins |
| Drizzle ORM     | SQL-like, lightweight      | Smaller ecosystem, less tooling  | Prisma's DX is superior        |
| SQLite          | Zero-config, file-based    | Not suitable for production scale| Production path is PostgreSQL   |

**Impact on Project:**
All data access now goes through `src/lib/db.ts` (Prisma singleton). `src/data/mockData.ts` is preserved for reference but no longer the source of truth.

---

### DEC-009: Session-Based Authentication with bcrypt

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Need server-side authentication that enforces role-based access control on API endpoints, replacing the client-side-only auth that could be trivially bypassed.

**Decision:**
Use **express-session** with server-side session store and **bcrypt** (cost factor 12) for password hashing.

**Reasoning:**
- Session-based auth is simpler than JWT — no token refresh logic, no client-side token storage vulnerabilities.
- Cookies with `httpOnly: true` prevent XSS-based token theft.
- bcrypt cost factor 12 provides strong protection against brute force while keeping login latency acceptable.
- Session store will be upgraded from MemoryStore → `connect-pg-simple` (PostgreSQL) for production persistence.

**Alternatives Considered:**
| Alternative     | Pros                        | Cons                              | Why Rejected                    |
|-----------------|-----------------------------|-----------------------------------|---------------------------------|
| JWT             | Stateless, scalable         | Token revocation complexity, XSS risk with localStorage | Sessions simpler for our scale |
| Auth0/Clerk     | Fastest to implement        | Cost at scale, vendor lock-in     | Want full control of auth data  |
| Passport.js     | Strategy ecosystem          | Extra abstraction layer            | express-session is sufficient   |

**Impact on Project:**
`src/api/auth.ts`, `src/api/middleware/auth.ts`, all API routes that use `requireAuth` / `requireRole`. `SESSION_SECRET` env var is now required.

---

### DEC-010: Dual Payment Gateway (Razorpay + Stripe)

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
The platform needs real payment processing. India-focused users primarily use UPI/NetBanking while international users may prefer cards.

**Decision:**
Integrate both **Razorpay** (India-native) and **Stripe** (international) with graceful stub mode when keys are not configured.

**Reasoning:**
- Razorpay natively supports UPI, NetBanking, and INR — critical for Indian pharmacy market.
- Stripe provides excellent developer experience and international card support.
- Lazy imports (`await import('razorpay')`) mean neither SDK loads unless actually needed.
- Stub mode ensures the dev experience is unaffected without real payment credentials.

**Impact on Project:**
`src/api/payments.ts`, `CartCheckoutDrawer.tsx` (frontend checkout flow), `.env.example` (4 new payment env vars).

---

### DEC-011: Modular Express API Architecture

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
The monolithic `server.ts` (281 lines) was unscalable — all logic in one file made it hard to add, test, or maintain endpoints.

**Decision:**
Decompose server into modular Express routers under `src/api/`, each responsible for a single domain. `server.ts` becomes a 60-line entry point.

**Reasoning:**
- Each module (`auth.ts`, `orders.ts`, etc.) is independently testable with Supertest.
- Shared middleware (auth, validate, errorHandler, rateLimit) avoids repetition.
- Follows Single Responsibility Principle — one router per domain entity.

**Impact on Project:**
New `src/api/` directory with 9 route modules + 4 middleware files. Old inline routes in `server.ts` removed.

### DEC-012: Resend for Transactional Email Delivery

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Patients and pharmacies need timely email notifications for order confirmations, prescription acceptance/rejection, dispatch updates, and account registration.

**Decision:**
Use **Resend** as the transactional email provider with a developer-friendly stub fallback when `RESEND_API_KEY` is not present in local environments.

**Reasoning:**
- Modern, clean TypeScript SDK with first-class DX.
- Generous free tier (3,000 emails/month, 100/day).
- Clean HTML templates with branded design and responsive tables.
- Dev stub prevents runtime crashes when keys are omitted.

**Impact on Project:**
`src/lib/email.ts`, `src/api/emails.ts`, hooks into `orders.ts`, `prescriptions.ts`, and `auth.ts`.

---

### DEC-013: react-i18next for Multi-Language Localization

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
India has 22 scheduled languages. For wide healthcare adoption, generic medicine comparison must be accessible in regional languages starting with Hindi, Tamil, and Telugu alongside English.

**Decision:**
Use **react-i18next** with `i18next-browser-languagedetector` and JSON locale bundles for English, Hindi, Tamil, and Telugu.

**Reasoning:**
- Industry-standard React i18n ecosystem with fast bundle sizes.
- Automatic browser language detection with persistent user choice via `localStorage`.
- Support for interpolation, pluralization, and namespace organization.

**Impact on Project:**
`src/i18n/`, `src/i18n/locales/{en,hi,ta,te}/common.json`, `Header.tsx` language dropdown selector.

---

### DEC-014: Progressive Web App (PWA) Strategy

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Patients need quick access on mobile devices without the overhead of publishing separate native iOS/Android apps to app stores in Phase 3.

**Decision:**
Adopt a **Progressive Web App (PWA)** strategy using `vite-plugin-pwa`, `public/manifest.json`, and custom service worker (`public/sw.js`).

**Reasoning:**
- Single codebase for web, Android, and iOS.
- "Add to Home Screen" installable prompt with standalone window.
- Offline support via stale-while-revalidate for static assets and network-first for APIs.
- Zero app store fees, instant deployment of updates.

**Impact on Project:**
`public/manifest.json`, `public/sw.js`, `public/icon.svg`, `index.html`, `vite.config.ts`.

---

### DEC-015: PostHog for Product Analytics and User Insights

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Understanding user conversion funnels (search → price comparison → cart → prescription upload → order completion) is essential for product growth.

**Decision:**
Integrate **PostHog** (`posthog-js`) with client-side event tracking, user identification, and server-side aggregation for admin business intelligence charts.

**Reasoning:**
- Open-source, privacy-friendly, self-hostable product analytics with session replay.
- Simple client wrapper with dev stub mode when `VITE_POSTHOG_KEY` is not set.
- Server-side BI aggregation endpoints (`/api/analytics/*`) feed the interactive Admin Recharts dashboard.

**Impact on Project:**
`src/lib/analytics.ts`, `src/main.tsx`, `src/api/analytics.ts`, `AdminDashboardView.tsx`.

---

### DEC-016: Service Layer Decomposition & Event-Driven Architecture

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
As business logic expanded (escrow holding, 3PL dispatch, automated emails, stock reservation), controller functions in `src/api/` risked becoming tightly coupled monoliths.

**Decision:**
Decompose business logic into dedicated service classes under `src/services/` (`CatalogService`, `OrderService`, `MarketplaceService`, `LogisticsService`, `ComplianceService`) and orchestrate asynchronous domain side-effects using a typed in-process event bus (`src/lib/eventBus.ts`).

**Reasoning:**
- Decouples HTTP route validation from core domain business rules.
- Enables asynchronous execution of non-blocking side effects (emails, webhooks, audit logging, escrow holding).
- Event bus architecture can easily transition to Redis PubSub or RabbitMQ for multi-instance scaling.

**Impact on Project:**
`src/services/`, `src/lib/eventBus.ts`, `src/api/orders.ts`, `src/api/settlements.ts`.

---

### DEC-017: Multi-Stage Containerization with Docker & Compose Orchestration

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Deploying to production and cloud environments requires reproducible, isolated, and scalable environments encompassing Node.js, PostgreSQL, and Redis caching.

**Decision:**
Create an optimized multi-stage `Dockerfile` (dependencies → builder → runner) based on `node:22-alpine` with non-root user execution, paired with `docker-compose.yml` for unified local, staging, and enterprise deployment.

**Reasoning:**
- Multi-stage build minimizes final image size by discarding TypeScript build toolchains and source files.
- Non-root user adheres to enterprise container security benchmarks.
- Compose setup provides instant full-stack spin-up including health checks and persistent volumes.

**Impact on Project:**
`Dockerfile`, `docker-compose.yml`, `.dockerignore`.

---

### DEC-018: Tiered Marketplace Monetization, Escrow, and Payout Ledger

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
genericMed connects patients with third-party pharmacies. A scalable monetization model is required that provides fair commission rates, protects patient payments, and incentivizes high-SLA pharmacy partners.

**Decision:**
Implement a 3-tier subscription model (`Basic`: 8%, `Verified`: 5%, `Enterprise`: 3%) combined with an automated escrow release mechanism that holds customer funds until orders transition to `Delivered`.

**Reasoning:**
- Tiered commission incentivizes pharmacies to improve fulfillment SLAs and maintain verified CDSCO status.
- Escrow holding prevents payment fraud and eliminates refund disputes.
- Itemized payout ledger provides transparency for pharmacy partners and platform administrators.

**Impact on Project:**
`src/services/marketplaceService.ts`, `src/api/settlements.ts`, `src/components/AdminDashboardView.tsx`.

---

### DEC-019: Multi-Carrier 3PL Logistics & Live Driver GPS Tracking

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Patients purchasing urgent medications require accurate delivery ETAs and visibility into courier transit, including temperature-sensitive handling for certain drugs.

**Decision:**
Create a unified 3PL logistics provider adapter supporting Dunzo Express (2-hr hyperlocal), Shiprocket (intercity), and Shadowfax (cold-chain), accompanied by real-time driver GPS tracking modal with interactive route waypoints and carrier webhook integration.

**Reasoning:**
- Single unified API abstracts away individual carrier integration differences.
- Live GPS tracking modal increases patient trust and reduces support tickets.
- Cold-chain routing ensures compliance for insulin and temperature-sensitive biologics.

**Impact on Project:**
`src/lib/logistics.ts`, `src/services/logisticsService.ts`, `src/api/logistics.ts`, `src/components/DeliveryTrackingModal.tsx`, `src/components/OrderTrackingView.tsx`.

---

### DEC-020: DISHA & HIPAA Healthcare Compliance Architecture

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
Operating a prescription and pharmacy platform in India and globally mandates compliance with healthcare data protection standards (DISHA, HIPAA, and GDPR patient privacy).

**Decision:**
Implement automated regulatory compliance reporting, CDSCO pharmacy drug license validation, k-anonymized research dataset extraction, and an automated patient right-to-erasure workflow with cryptographic erasure tokens.

**Reasoning:**
- Regulatory compliance readiness is mandatory before hospital and enterprise pharmacy onboarding.
- CDSCO license verification ensures only legal, licensed chemists dispense prescription drugs.
- De-identified data sharing unlocks valuable public health insights while safeguarding patient anonymity.

**Impact on Project:**
`backend/src/lib/compliance.ts`, `backend/src/services/complianceService.ts`, `backend/src/api/compliance.ts`.

---

### DEC-021: Decoupled Frontend & Backend Monorepo Architecture

| Field                | Detail |
|----------------------|--------|
| **Date**             | 2026-09-09 |
| **Status**           | ✅ Accepted |
| **Decision Maker**   | Yash Kaurani |

**Context / Problem:**
The original repository was a hybrid monolithic project where frontend React code and Express server code resided in the same root package. Dependencies, type configurations, and build scripts were intermixed, making deployment and independent scaling difficult.

**Decision:**
Completely separate the repository into two independent subfolders:
1. `backend/`: Standalone Node.js/Express API server listening on port 5000, managing PostgreSQL via Prisma, session cookies, and business services.
2. `frontend/`: Standalone React 19 + Vite 6 client listening on port 5173, with Vite reverse proxy forwarding `/api` calls to port 5000 in dev.
3. Root `package.json`: Lightweight workspace orchestrator using `concurrently` to run both services together or separately.

**Reasoning:**
- Independent dependency trees eliminate client bundle bloat and backend-only dependency pollution.
- Standardized microservice deployment patterns with separate Dockerfiles for API and static Nginx.
- Enables frontend and backend to be deployed to separate hosts (e.g., Vercel/Netlify for frontend and AWS/Render/Fly for backend) without architectural changes.
- Eliminates cross-boundary code coupling while preserving a frictionless local development experience through Vite proxying.

**Impact on Project:**
`frontend/`, `backend/`, `package.json`, `README.md`, `docker-compose.yml`.

---

## Superseded Decisions

_No superseded decisions yet._

---

> **Maintenance Rule:** Every new decision must be added above with the next sequential `DEC-XXX` number. If a decision is reversed, move it to "Superseded Decisions" and reference the new decision that replaced it.
