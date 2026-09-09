import { Router } from 'express';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../lib/db';
import { validateBody } from './middleware/validate';
import { requireAuth } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';
import { authLimiter } from './middleware/rateLimit';

const router = Router();

// ─── Zod Schemas ──────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'pharmacy', 'admin', 'doctor']).default('patient'),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
  clinicHospital: z.string().optional(),
  pharmacyId: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Routes ───────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Create a new user account with bcrypt-hashed password.
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, licenseNumber, clinicHospital, pharmacyId, address } = req.body;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // Validate pharmacy exists if pharmacyId provided
    let pharmacyName: string | undefined;
    if (pharmacyId) {
      const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
      if (!pharmacy) {
        res.status(400).json({ error: 'Bad Request', message: 'Invalid pharmacy ID.' });
        return;
      }
      pharmacyName = pharmacy.name;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role,
        phone,
        licenseNumber,
        clinicHospital,
        pharmacyId,
        pharmacyName,
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        licenseNumber: true,
        clinicHospital: true,
        pharmacyId: true,
        pharmacyName: true,
        address: true,
        createdAt: true,
      },
    });

    // Auto-login: create session
    req.session.userId = user.id;
    req.session.userRole = user.role as any;
    req.session.userName = user.name;
    if (user.pharmacyId) req.session.pharmacyId = user.pharmacyId;

    res.status(201).json({ message: 'Account created successfully.', user });
  })
);

/**
 * POST /api/auth/login
 * Authenticate with email + password, create session.
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        phone: true,
        licenseNumber: true,
        clinicHospital: true,
        pharmacyId: true,
        pharmacyName: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Create session
    req.session.userId = user.id;
    req.session.userRole = user.role as any;
    req.session.userName = user.name;
    if (user.pharmacyId) req.session.pharmacyId = user.pharmacyId;

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user;
    res.json({ message: 'Signed in successfully.', user: safeUser });
  })
);

/**
 * POST /api/auth/logout
 * Destroy the current session.
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Server Error', message: 'Failed to end session.' });
        return;
      }
      res.clearCookie('genericmed.sid');
      res.json({ message: 'Signed out successfully.' });
    });
  })
);

/**
 * GET /api/auth/me
 * Return the currently authenticated user (for session restore on page load).
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await db.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        licenseNumber: true,
        clinicHospital: true,
        pharmacyId: true,
        pharmacyName: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'Unauthorized', message: 'Session expired. Please sign in again.' });
      return;
    }

    res.json({ user });
  })
);

export default router;
