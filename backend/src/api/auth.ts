import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../lib/db';
import { sendWelcomeEmail } from '../lib/email';
import { authLimiter } from './middleware/rateLimit';
import { validateBody } from './middleware/validate';
import { requireAuth } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';
import { INITIAL_USERS } from '../data/mockData';
import { UserAccount } from '../types';

const router = Router();

export interface MockUser extends UserAccount {
  passwordHash?: string;
}

// In-memory user store for dev/offline resilience
export const mockUsers: MockUser[] = [...INITIAL_USERS];

// ─── Validation Schemas ────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'pharmacy', 'doctor', 'admin']),
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
 * Works seamlessly online (MongoDB) and offline (in-memory mock store).
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, licenseNumber, clinicHospital, pharmacyId, address } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const existing = await db.user.findUnique({ where: { email: cleanEmail } });
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

      const user = await db.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
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

      sendWelcomeEmail(user.name, user.email, user.role).catch((err) =>
        console.error('[EMAIL ERROR] sendWelcomeEmail:', err.message)
      );

      res.status(201).json({ message: 'Account created successfully.', user });
      return;
    } catch {
      // Offline fallback: save to in-memory store
      const existing = mockUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists.',
        });
        return;
      }

      const newUser: MockUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        phone,
        licenseNumber,
        clinicHospital,
        pharmacyId,
        address,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);

      req.session.userId = newUser.id;
      req.session.userRole = newUser.role as any;
      req.session.userName = newUser.name;
      if (newUser.pharmacyId) req.session.pharmacyId = newUser.pharmacyId;

      sendWelcomeEmail(newUser.name, newUser.email, newUser.role).catch((err) =>
        console.error('[EMAIL ERROR] sendWelcomeEmail:', err.message)
      );

      const { passwordHash: _, ...safeUser } = newUser;
      res.status(201).json({ message: 'Account created successfully.', user: safeUser });
    }
  })
);

/**
 * POST /api/auth/login
 * Authenticate with email + password, create session.
 * Supports both MongoDB and in-memory offline fallback.
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = await db.user.findUnique({
        where: { email: cleanEmail },
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

      if (user && user.passwordHash) {
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (passwordMatch) {
          req.session.userId = user.id;
          req.session.userRole = user.role as any;
          req.session.userName = user.name;
          if (user.pharmacyId) req.session.pharmacyId = user.pharmacyId;

          const { passwordHash: _, ...safeUser } = user;
          res.json({ message: 'Signed in successfully.', user: safeUser });
          return;
        }
      }
    } catch { /* DB offline fallback */ }

    // Fallback: check in-memory users
    const mockUser = mockUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (mockUser) {
      const passwordMatch = mockUser.passwordHash
        ? await bcrypt.compare(password, mockUser.passwordHash)
        : password.length >= 6; // Allow default seed users
      if (passwordMatch) {
        req.session.userId = mockUser.id;
        req.session.userRole = mockUser.role as any;
        req.session.userName = mockUser.name;
        if (mockUser.pharmacyId) req.session.pharmacyId = mockUser.pharmacyId;

        const { passwordHash: _, ...safeUser } = mockUser;
        res.json({ message: 'Signed in successfully.', user: safeUser });
        return;
      }
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password.',
    });
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
    try {
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

      if (user) {
        res.json({ user });
        return;
      }
    } catch { /* DB offline fallback */ }

    const mockUser = mockUsers.find((u) => u.id === req.session.userId);
    if (mockUser) {
      const { passwordHash: _, ...safeUser } = mockUser;
      res.json({ user: safeUser });
      return;
    }

    req.session.destroy(() => {});
    res.status(401).json({ error: 'Unauthorized', message: 'Session expired. Please sign in again.' });
  })
);

export default router;
