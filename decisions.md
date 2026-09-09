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

---

## Superseded Decisions

_No superseded decisions yet._

---

> **Maintenance Rule:** Every new decision must be added above with the next sequential `DEC-XXX` number. If a decision is reversed, move it to "Superseded Decisions" and reference the new decision that replaced it.
