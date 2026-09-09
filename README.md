# 🏥 genericMed

> Transparent medicine price comparison, prescription OCR matching, and verified pharmacy marketplace.

genericMed connects patients, pharmacies, doctors, and platform administrators to ensure medicine purchasing is transparent, accessible, and compliant with regulatory standards.

---

## 📁 Repository Structure

The project is cleanly decoupled into two standalone applications:

```text
Generic-Med-Web/
├── backend/                  # Standalone Express API Server
│   ├── prisma/               # PostgreSQL Prisma schema and seed script
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── api/              # REST routes & middleware (auth, orders, medicines, etc.)
│   │   ├── data/             # Mock datasets & seeding data
│   │   ├── lib/              # Database client, emailer, event bus, logger, logistics
│   │   ├── services/         # Business logic (catalog, order, compliance, marketplace)
│   │   ├── __tests__/        # API integration test suites (Supertest + Jest)
│   │   ├── server.ts         # Pure Express HTTP server entry point (Port 5000)
│   │   └── types.ts          # Backend domain type definitions
│   ├── .env.example          # Backend environment variable template
│   ├── package.json          # Backend-only dependencies & scripts
│   └── tsconfig.json         # Node/TypeScript configuration
│
├── frontend/                 # Standalone React + Vite Client
│   ├── public/               # PWA icons, manifest, service worker, assets
│   ├── src/
│   │   ├── components/       # UI views and widgets across all 4 user roles
│   │   ├── context/          # AppContext state & API fetcher
│   │   ├── data/             # Price history trend data
│   │   ├── hooks/            # Custom hooks (useApi, useTheme)
│   │   ├── i18n/             # Multi-language translation packs (EN, HI, TA, TE)
│   │   ├── lib/              # Analytics client (PostHog)
│   │   ├── utils/            # Client-side PDF receipt generator & prescription matcher
│   │   ├── App.tsx           # Main application routing & shell
│   │   ├── main.tsx          # React 19 bootstrap entry
│   │   ├── index.css         # Tailwind v4 theme & custom utilities
│   │   └── types.ts          # Frontend data models & UI interfaces
│   ├── .env.example          # Frontend environment variable template
│   ├── index.html            # Vite HTML template
│   ├── package.json          # Frontend-only dependencies & scripts
│   ├── tsconfig.json         # Browser/React TypeScript configuration
│   └── vite.config.ts        # Vite build config with /api reverse proxy
│
├── package.json              # Root workspace scripts & dev orchestrator
├── tsconfig.json             # Root TypeScript project references
├── .gitignore                # Root gitignore covering both projects
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js**: v18 or higher (v24 LTS recommended)
- **npm**: v9 or higher
- **MongoDB**: MongoDB Atlas Cluster (or local MongoDB instance)

> **Note for Windows Users**: Always execute commands using `npm.cmd` or `npx.cmd` if your PowerShell execution policy restricts `.ps1` scripts.

---

### 2. Dependency Installation

You can install dependencies for both the backend and frontend simultaneously from the project root:

```bash
# Install all dependencies (backend + frontend + root tools)
npm run install:all
```

Alternatively, install individually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Environment Configuration

Copy the example environment files to create your local `.env` files:

#### Backend (`backend/.env`):
```bash
# In backend/
cp .env.example .env
```
Key variables:
- `PORT=5000` — Port on which the API server listens.
- `DATABASE_URL` — MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/genericmed?retryWrites=true&w=majority`).
- `SESSION_SECRET` — Session encryption key.
- `GEMINI_API_KEY` — Google Gemini API key for prescription OCR (optional; built-in fallback active if blank).
- `RAZORPAY_KEY_ID` / `STRIPE_SECRET_KEY` — Payment gateways (optional; runs in stub mode if blank).

#### Frontend (`frontend/.env`):
```bash
# In frontend/
cp .env.example .env
```
Key variables:
- `VITE_BACKEND_URL="http://localhost:5000"` — URL of the backend API server. Vite proxies `/api/*` requests to this address during local development.

---

### 4. Database Setup (MongoDB Atlas)

> **Important (MongoDB Atlas Network Access)**:
> Before pushing schema or connecting, ensure your current IP address (or `0.0.0.0/0` for access from anywhere) is whitelisted in **MongoDB Atlas > Network Access > IP Access List**.

From the `backend/` directory:

```bash
cd backend

# 1. Generate Prisma Client for MongoDB
npm run db:generate

# 2. Push schema models and indexes to MongoDB Atlas
npm run db:push

# 3. Seed demo medicines, pharmacies, accounts, and offers into Atlas
npm run db:seed
```

---

### 5. Running the Application

#### Option A: Run Both Together (Recommended)
From the project root, run:

```bash
npm run dev
```
This starts:
- **Backend API Server**: `http://localhost:5000`
- **Frontend Vite Client**: `http://localhost:5173`
- All frontend calls to `/api/*` are automatically forwarded to the backend on port 5000.

#### Option B: Run Separately

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

---

## 🧪 Testing

### Backend Integration Tests
The backend includes automated integration tests covering authentication, order placement, and marketplace economics using Jest and Supertest with mock databases:

```bash
# Run all backend tests
npm test

# Or run directly in backend/
cd backend
npm test

# Run with coverage report
npm run test:coverage
```

---

## 🏗️ Production Build

To produce production bundles for both projects:

```bash
# Build both
npm run build

# Or individually
npm run build:backend   # Generates dist/server.cjs in backend/
npm run build:frontend  # Generates dist/ SPA assets in frontend/
```

To run the production backend:
```bash
cd backend
npm start
```

---

## 👥 Supported Roles

1. **Patient**: Search medications, compare generic alternatives, scan prescriptions with AI, place orders, and track live deliveries.
2. **Pharmacy Partner**: Manage inventory stock, update live prices, process incoming prescriptions, and track order fulfillment.
3. **Doctor**: Issue digitally signed e-prescriptions, search pharmacological database, and monitor active patient medications.
4. **Platform Admin**: Monitor marketplace telemetry, commission settlements, escrow balances, regulatory audits, and support tickets.

---

## 🛡️ Architecture & Security Highlights

- **Complete Decoupling**: Frontend has no access to backend secrets, databases, or filesystem. All data exchange is performed over authenticated HTTP APIs (`/api/*`).
- **Reverse Proxy**: In development, Vite seamlessly forwards `/api` requests to Express on port 5000, eliminating CORS friction while preserving standard cookie sessions.
- **Session Management**: Secure HTTP-only cookies with configurable persistent PostgreSQL storage (`connect-pg-simple`).
- **Security Headers & Rate Limiting**: Built with Helmet CSP and sliding-window rate limiters on sensitive endpoints.
