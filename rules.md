# 📏 Project Rules

> **Purpose:** Canonical rules that AI assistants **must always follow** when working on the **genericMed** codebase.
> Violating any rule without explicit user approval is prohibited.

---

## Table of Contents

- [1. Coding Standards](#1-coding-standards)
- [2. Folder Structure Rules](#2-folder-structure-rules)
- [3. Naming Conventions](#3-naming-conventions)
- [4. UI/UX Consistency Rules](#4-uiux-consistency-rules)
- [5. Git Commit Rules](#5-git-commit-rules)
- [6. Security & Environment Variable Rules](#6-security--environment-variable-rules)
- [7. Safety & Regression Rules](#7-safety--regression-rules)

---

## 1. Coding Standards

### Language & Typing

- All source code **must** be written in **TypeScript** (`.ts` / `.tsx`). No plain `.js` / `.jsx` files.
- Enable and respect `strict` mode in `tsconfig.json`. Do not suppress errors with `@ts-ignore` or `any` unless absolutely necessary (and document why).
- Use explicit return types on all exported functions and components.
- Prefer `interface` over `type` for object shapes. Use `type` only for unions, intersections, and aliases.

### React

- Use **functional components** exclusively. No class components.
- Use React hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`) for state and side effects.
- All shared state must flow through `AppContext` — do not create ad-hoc contexts without documenting a decision in `decisions.md`.
- Keep components focused: one component per file, one concern per component.
- All interactive elements must have unique `id` attributes for testability.

### Imports & Dependencies

- Use named imports, not default imports (except for the root `App` component).
- Sort imports in this order:
  1. React / framework imports
  2. Third-party libraries
  3. Local components (`./components/`)
  4. Local context / hooks / utils
  5. Types
  6. Data / assets
- Do not add new npm dependencies without documenting the reason in `decisions.md`.

### Error Handling

- All API calls must have `try/catch` with meaningful error messages.
- Use the global toast system (`addToast`) for user-facing errors.
- Log detailed errors to `console.error` for debugging.
- Server endpoints must return proper HTTP status codes and JSON error objects.

### Code Quality

- Maximum function length: **50 lines** (prefer smaller, composable functions).
- Maximum file length: **500 lines** (split into smaller modules if exceeded).
- No commented-out code in production files. Use Git history for old code.
- All magic numbers must be extracted to named constants.

---

## 2. Folder Structure Rules

```
Generic-Med-Web/
├── index.html                  # SPA entry point
├── server.ts                   # Express backend (API + Vite middleware)
├── vite.config.ts              # Vite build configuration (Tailwind, PWA)
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── metadata.json               # Project metadata for AI Studio
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Multi-container orchestration (app, postgres, redis)
├── .dockerignore               # Docker build exclusions
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── decisions.md                # ← Technical decision log
├── rules.md                    # ← This file (project rules)
├── memory.md                   # ← Long-term project memory
├── changelog.md                # ← Chronological change history
├── phases.md                   # ← Development phases tracking
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # PostgreSQL Prisma schema
│   └── seed.ts                 # Database seed script
├── public/                     # Static assets, PWA manifest, Service Worker
│   ├── manifest.json           # Web App Manifest
│   ├── sw.js                   # Custom Service Worker
│   └── icon.svg, icon-*.png    # PWA App icons
└── src/
    ├── main.tsx                # React app bootstrap & analytics init
    ├── App.tsx                 # Root component with view routing
    ├── index.css               # Global CSS / Tailwind entry
    ├── types.ts                # All TypeScript interfaces & types
    ├── api/                    # Modular Express HTTP routers
    │   ├── index.ts            # Central router mounting all routes
    │   ├── auth.ts             # Auth & session endpoints
    │   ├── medicines.ts        # Medicine catalog endpoints
    │   ├── offers.ts           # Pharmacy seller offers
    │   ├── prescriptions.ts    # Prescription upload, AI OCR, review
    │   ├── orders.ts           # Order creation & fulfillment
    │   ├── users.ts            # User profile endpoints
    │   ├── audit.ts            # Audit logging queries
    │   ├── tickets.ts          # Customer support tickets
    │   ├── payments.ts         # Razorpay & Stripe integration
    │   ├── pharmacies.ts       # Pharmacy directory & ratings
    │   ├── interactions.ts     # Clinical drug interaction checker
    │   ├── medical-history.ts  # Patient medical timeline
    │   ├── bulk-upload.ts      # CSV batch inventory upload
    │   ├── analytics.ts        # Admin business intelligence
    │   ├── emails.ts           # Email test endpoints
    │   ├── settlements.ts      # Marketplace commissions & escrow
    │   ├── logistics.ts        # 3PL shipping rates & live tracking
    │   ├── compliance.ts       # DISHA/HIPAA reports & data erasure
    │   └── middleware/         # Gateway, Auth, RBAC, validate, rateLimit, error
    ├── services/               # Decoupled domain service layer
    │   ├── catalogService.ts   # Search, pack normalization, promoted rank
    │   ├── orderService.ts     # Order state machine, returns, escrow
    │   ├── marketplaceService.ts # Tiered commissions & settlement ledger
    │   ├── logisticsService.ts # 3PL multi-carrier & live GPS simulation
    │   └── complianceService.ts # DISHA/HIPAA reports & data erasure
    ├── components/             # React UI components (one per file)
    │   ├── Header.tsx          # App header with language selector
    │   ├── Footer.tsx
    │   ├── MedicineComparisonView.tsx
    │   ├── SearchAutocomplete.tsx
    │   ├── DrugInteractionChecker.tsx
    │   ├── MedicalHistoryView.tsx
    │   ├── PharmacyProfileView.tsx
    │   ├── BulkPriceUpload.tsx
    │   ├── DeliveryTrackingModal.tsx # Real-time driver GPS tracking modal
    │   ├── PrescriptionUploadView.tsx
    │   ├── AIPrescriptionScanner.tsx
    │   ├── OrderTrackingView.tsx
    │   ├── PharmacyPortalView.tsx
    │   ├── AdminDashboardView.tsx
    │   ├── DoctorPrescribeView.tsx
    │   ├── ArchitectureView.tsx
    │   ├── AuthView.tsx
    │   ├── CartCheckoutDrawer.tsx
    │   ├── ContentArea.tsx
    │   ├── HistoricalPriceTrendChart.tsx
    │   ├── ThemeToggle.tsx
    │   └── ToastContainer.tsx
    ├── context/                # React context providers
    │   └── AppContext.tsx      # Main application state & API wiring
    ├── hooks/                  # Custom React hooks
    │   ├── useTheme.ts
    │   └── useApi.ts           # Generic typed API query hook
    ├── lib/                    # Shared client & server libraries
    │   ├── db.ts               # Prisma singleton client
    │   ├── email.ts            # Resend email templates & dispatcher
    │   ├── analytics.ts        # PostHog analytics wrapper
    │   ├── logger.ts           # Centralized structured JSON logger
    │   ├── eventBus.ts         # Asynchronous domain event bus
    │   ├── logistics.ts        # 3PL carrier definitions & coordinates
    │   └── compliance.ts       # Healthcare compliance interfaces
    ├── i18n/                   # Multi-language localization
    │   ├── index.ts            # i18next configuration
    │   └── locales/            # Language dictionaries (en, hi, ta, te)
    ├── utils/                  # Utility / helper modules
    │   ├── pdfGenerator.ts
    │   └── prescriptionMatcher.ts
    └── __tests__/              # Automated test suites
        ├── setup.ts
        ├── utils/
        └── api/
```

### Rules

- **Components:** All React components go in `src/components/`. One component per file.
- **Services:** Pure domain logic lives in `src/services/` (`*Service.ts`). Controllers must delegate heavy business rules to services.
- **Event Bus:** Asynchronous domain events are published via `eventBus` (`src/lib/eventBus.ts`). Do not block API requests with slow side effects.
- **Types:** All shared TypeScript interfaces and types go in `src/types.ts`. Component-local types can stay in the component file.
- **Context:** All context providers go in `src/context/`. Do not scatter contexts across random directories.
- **Hooks:** All custom hooks go in `src/hooks/`. Hook files must start with `use` (e.g., `useTheme.ts`, `useApi.ts`).
- **Utils:** All utility/helper functions go in `src/utils/`. No business logic in utils — only pure helper functions.
- **Libraries:** Shared infrastructure adapters (DB client, email, analytics, logger, eventBus) go in `src/lib/`.
- **API Routers:** Server routes go in `src/api/` and mount through `src/api/index.ts`.
- **Localization:** Translation bundles go in `src/i18n/locales/<lang>/common.json`.
- **Database:** Prisma schema and seed scripts live in `prisma/`.
- **Containers:** Multi-stage builds in `Dockerfile`, services orchestration in `docker-compose.yml`.
- **Do not create** new top-level directories without documenting in `decisions.md`.

---

## 3. Naming Conventions

### Files

| Type                   | Convention                    | Example                           |
|------------------------|-------------------------------|-----------------------------------|
| React component        | PascalCase `.tsx`             | `MedicineComparisonView.tsx`      |
| Custom hook            | camelCase with `use` prefix   | `useTheme.ts`                     |
| Utility module         | camelCase `.ts`               | `pdfGenerator.ts`                 |
| Type/interface file    | camelCase `.ts`               | `types.ts`                        |
| Data file              | camelCase `.ts`               | `mockData.ts`                     |
| Config file            | lowercase with dots           | `vite.config.ts`, `tsconfig.json` |
| Documentation          | lowercase with hyphens `.md`  | `decisions.md`, `changelog.md`    |

### Code

| Element                | Convention           | Example                                     |
|------------------------|----------------------|---------------------------------------------|
| Component names        | PascalCase           | `CartCheckoutDrawer`, `AdminDashboardView`  |
| Hook names             | camelCase `use*`     | `useTheme`, `useApp`                        |
| Function names         | camelCase            | `getOffersForMedicinePack`, `addToast`      |
| Interface names        | PascalCase           | `Medicine`, `SellerOffer`, `UserAccount`    |
| Type aliases           | PascalCase           | `UserRole`, `OrderStatus`, `PaymentStatus`  |
| Enum-like unions       | PascalCase strings   | `'patient' \| 'pharmacy' \| 'admin' \| 'doctor'` |
| Constants              | UPPER_SNAKE_CASE     | `INITIAL_MEDICINES`, `PORT`                 |
| CSS classes            | Tailwind utilities   | `bg-zinc-50 dark:bg-zinc-950`               |
| HTML `id` attributes   | kebab-case           | `app-root`, `main-workspace`                |
| API endpoint paths     | lowercase kebab-case | `/api/prescription/analyze`                 |
| Environment variables  | UPPER_SNAKE_CASE     | `GEMINI_API_KEY`, `APP_URL`                 |

### Component Naming Patterns

- **View components** (full-page sections): `*View` suffix — e.g., `MedicineComparisonView`, `OrderTrackingView`
- **Drawer/Modal components**: `*Drawer` or `*Modal` suffix — e.g., `CartCheckoutDrawer`
- **Container components**: `*Container` suffix — e.g., `ToastContainer`
- **Generic UI components**: descriptive name, no suffix — e.g., `Header`, `Footer`, `ThemeToggle`

---

## 4. UI/UX Consistency Rules

### Theme System

- Support **dark mode** and **light mode** via Tailwind's `dark:` variant.
- Theme preference is stored in `localStorage` under the key `apex_layout_theme`.
- Always provide both light and dark variants for backgrounds, text, borders, and interactive states.
- Color palette anchor: **Emerald** (`emerald-500`, `emerald-600`) for primary actions and branding.
- Neutral palette: **Zinc** (`zinc-50` through `zinc-950`) for backgrounds and text.

### Layout

- Maximum content width: `max-w-7xl` (80rem / 1280px).
- Horizontal padding: `px-4 sm:px-6 lg:px-8` (responsive).
- Vertical padding: `py-6 sm:py-8` (responsive).
- Use `flex` and `grid` layouts. No floats.

### Typography

- Use the system font stack via Tailwind's default `font-sans`.
- Apply `antialiased` text rendering globally.
- Text selection color: `selection:bg-emerald-500/20`.

### Transitions & Animations

- Use `motion` (Framer Motion) library for component animations.
- All color transitions: `transition-colors duration-200`.
- Prefer subtle, functional animations — no gratuitous motion.

### Accessibility

- All interactive elements must be keyboard-accessible.
- Use semantic HTML (`<main>`, `<header>`, `<footer>`, `<nav>`, `<section>`).
- All images must have `alt` attributes.
- All form inputs must have associated `<label>` elements.
- Color contrast must meet WCAG 2.1 AA standards.

### Icons

- Use **Lucide React** (`lucide-react`) for all iconography.
- Do not mix icon libraries. If a needed icon doesn't exist in Lucide, discuss in `decisions.md`.

### Toast Notifications

- Use the global `addToast` function from `AppContext` for all user-facing notifications.
- Toast types: `success`, `info`, `warning`, `error`.
- Each toast must have both a `title` and a `message`.

---

## 5. Git Commit Rules

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Usage                                                    |
|------------|----------------------------------------------------------|
| `feat`     | A new feature                                            |
| `fix`      | A bug fix                                                |
| `docs`     | Documentation changes (including `.md` context files)    |
| `style`    | Code style changes (formatting, whitespace)              |
| `refactor` | Code restructuring (no feature or fix)                   |
| `perf`     | Performance improvement                                  |
| `test`     | Adding or updating tests                                 |
| `build`    | Build system or dependency changes                       |
| `ci`       | CI/CD configuration changes                              |
| `chore`    | Miscellaneous tasks                                      |

### Scopes

Use the affected module as scope: `server`, `auth`, `cart`, `prescription`, `pharmacy`, `admin`, `doctor`, `ui`, `types`, `data`, `utils`, `config`.

### Examples

```
feat(prescription): add AI-powered prescription image scanner
fix(cart): correct quantity validation on checkout
docs(memory): update completed features list
refactor(server): extract prescription analysis into separate module
```

### Rules

- Every commit must compile without errors (`npm run lint` should pass).
- Do not commit `.env` files, `node_modules/`, or build artifacts.
- Keep commits atomic — one logical change per commit.
- Write commit messages in the imperative mood ("add", not "added").

---

## 6. Security & Environment Variable Rules

### Environment Variables

- **Never** commit `.env` files to Git. Only `.env.example` (with placeholder values) is tracked.
- All environment variables must be documented in `.env.example` with descriptions.
- Access environment variables on the server via `process.env.VARIABLE_NAME`.
- **Do not** expose server-side environment variables to the client bundle.

### Current Variables

| Variable                      | Purpose                                       | Required | Default / Fallback                                     |
|-------------------------------|-----------------------------------------------|----------|--------------------------------------------------------|
| `DATABASE_URL`                | PostgreSQL connection URL with pool size      | Yes      | Required for Prisma DB queries                         |
| `SESSION_SECRET`              | express-session cookie encryption secret      | Yes      | In dev falls back to default dev secret                |
| `PORT`                        | Server HTTP listening port                    | No       | `3000`                                                 |
| `NODE_ENV`                    | Runtime environment (`development`/`production`)| No     | `development`                                          |
| `GEMINI_API_KEY`              | Google Gemini AI API key                      | No*      | Falls back to clinical sample prescription data        |
| `RESEND_API_KEY`              | Resend transactional email API key            | No*      | Falls back to console log email stub                   |
| `RESEND_FROM_EMAIL`           | Verified sender email address                 | No       | `onboarding@resend.dev`                                |
| `VITE_POSTHOG_KEY`            | PostHog project API key                       | No*      | Falls back to console log analytics stub               |
| `VITE_POSTHOG_HOST`           | PostHog analytics ingestion host              | No       | `https://us.i.posthog.com`                              |
| `RAZORPAY_KEY_ID`             | Razorpay public merchant key                  | No*      | Falls back to simulated test payment stub              |
| `RAZORPAY_KEY_SECRET`         | Razorpay secret signature key                 | No*      | Falls back to simulated test payment stub              |
| `STRIPE_SECRET_KEY`           | Stripe backend secret API key                 | No*      | Falls back to simulated test payment stub              |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe frontend publishable key               | No*      | Falls back to simulated test payment stub              |
| `APP_URL`                     | Deployment URL for the app                    | No       | `http://localhost:3000`                                |
| `DISABLE_HMR`                 | Disable Vite HMR (AI Studio sandbox)          | No       | `false`                                                |

\* The app is designed to degrade gracefully in local development: if third-party keys (Gemini, Resend, Razorpay, Stripe, PostHog) are omitted, safe simulation stubs activate without crashing.

### API Security

- All API endpoints must validate input (type, length, required fields).
- Set appropriate request size limits (`express.json({ limit: '25mb' })`).
- Sanitize all user-provided data before processing.
- When a real database is added, use parameterized queries — never string concatenation for SQL.

### Secrets in Code

- **Never** hardcode API keys, passwords, tokens, or credentials in source files.
- **Never** log sensitive data (API keys, patient data) to console in production.
- Medical/patient data handling must comply with applicable privacy regulations.

---

## 7. Safety & Regression Rules

> ⚠️ **Golden Rule: Never break existing functionality unless explicitly requested by the user.**

### Before Making Changes

- [ ] Read `memory.md` to understand current project state.
- [ ] Read `decisions.md` to check for relevant past decisions.
- [ ] Understand the full impact of the proposed change on existing features.
- [ ] If a change conflicts with a past decision, flag it and get approval before proceeding.

### After Making Changes

- [ ] Verify the app still compiles: `npm run lint`
- [ ] Verify the dev server starts without errors: `npm run dev`
- [ ] Test affected views/components manually in the browser.
- [ ] Update `memory.md` if features, APIs, or schema changed.
- [ ] Update `changelog.md` with what was added/changed/fixed.
- [ ] Update `decisions.md` if a new architectural decision was made.

### Prohibited Actions (Without Explicit Approval)

- ❌ Deleting existing components or files.
- ❌ Changing the build system or dev server configuration.
- ❌ Removing or modifying existing API endpoints.
- ❌ Changing the role-based architecture or authentication flow.
- ❌ Adding new npm dependencies (document in `decisions.md` first).
- ❌ Modifying `types.ts` in ways that break existing component contracts.
- ❌ Removing Tailwind CSS classes that affect layout or theming.

---

> **Maintenance Rule:** When adding a new rule, append it under the appropriate section. If creating a new section, add it to the Table of Contents and assign it the next sequential number.
