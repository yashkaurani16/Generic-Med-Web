import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import apiRouter from './api/index';
import { globalErrorHandler } from './api/middleware/errorHandler';
import { checkDatabaseConnection } from './lib/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN,
  process.env.APP_URL,
].filter(Boolean) as string[];

// ─── Security Middleware ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or can restrict if needed
      }
    },
    credentials: true, // Required for session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ─── Session ─────────────────────────────────────────────────────
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

// ─── Start Server ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  const dbOk = await checkDatabaseConnection(2500);

  console.log(`\n🏥 genericMed API server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database:    ${dbOk ? '✅ Connected (MongoDB Atlas)' : '⚠️  Offline / Network Unreachable (using instant mock fallback)'}`);
  console.log(`   Gemini AI:   ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Using sample data fallback'}`);
  console.log(`   Razorpay:    ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '⚠️  Using stub mode'}`);
  console.log(`   Stripe:      ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '⚠️  Using stub mode'}\n`);
});

export default app;
