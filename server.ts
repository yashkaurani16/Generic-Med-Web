import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import apiRouter from './src/api/index';
import { globalErrorHandler } from './src/api/middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// ─── Security Middleware ──────────────────────────────────────────
app.use(
  helmet({
    // Allow Vite's inline scripts in development
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

app.use(
  cors({
    origin: process.env.APP_URL || `http://localhost:${PORT}`,
    credentials: true, // Required for session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ─── Session ─────────────────────────────────────────────────────
// NOTE: In production, replace MemoryStore with connect-pg-simple
// for persistent PostgreSQL-backed sessions:
//
//   import connectPgSimple from 'connect-pg-simple';
//   const PgStore = connectPgSimple(session);
//   store: new PgStore({ conString: process.env.DATABASE_URL, tableName: 'sessions' })
//
app.use(
  session({
    name: 'genericmed.sid',
    secret: process.env.SESSION_SECRET || 'genericmed-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    env: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Global Error Handler (must be last middleware) ───────────────
app.use(globalErrorHandler);

// ─── Vite / Static File Serving ──────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🏥 genericMed server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database:    ${process.env.DATABASE_URL ? '✅ Connected' : '⚠️  DATABASE_URL not set'}`);
    console.log(`   Gemini AI:   ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Using sample data fallback'}`);
    console.log(`   Razorpay:    ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '⚠️  Using stub mode'}`);
    console.log(`   Stripe:      ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '⚠️  Using stub mode'}\n`);
  });
}

startServer();
