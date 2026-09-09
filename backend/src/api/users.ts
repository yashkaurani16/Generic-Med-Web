import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';
import { mockUsers } from './auth';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * GET /api/users
 * Admin only — list all users.
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    try {
      const users = await db.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, pharmacyId: true, pharmacyName: true,
          licenseNumber: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ users, total: users.length });
      return;
    } catch {
      const safeUsers = mockUsers.map(({ passwordHash, ...u }) => u);
      res.json({ users: safeUsers, total: safeUsers.length });
    }
  })
);

/**
 * GET /api/users/me/profile
 * Return own profile (any authenticated user).
 */
router.get(
  '/me/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const user = await db.user.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, address: true, avatarUrl: true,
          licenseNumber: true, clinicHospital: true,
          pharmacyId: true, pharmacyName: true, createdAt: true,
        },
      });

      if (user) {
        res.json({ user });
        return;
      }
    } catch { /* DB offline fallback */ }

    const mock = mockUsers.find((u) => u.id === req.session.userId);
    if (mock) {
      const { passwordHash: _, ...safeUser } = mock;
      res.json({ user: safeUser });
      return;
    }

    res.status(404).json({ error: 'Not Found', message: 'User not found.' });
  })
);

/**
 * PUT /api/users/me/profile
 * Update own profile (any authenticated user).
 */
router.put(
  '/me/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, address, avatarUrl } = req.body;

    try {
      const user = await db.user.update({
        where: { id: req.session.userId },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, address: true, avatarUrl: true, createdAt: true,
        },
      });

      if (name) req.session.userName = name;
      res.json({ user, message: 'Profile updated successfully.' });
      return;
    } catch { /* DB offline fallback */ }

    const mock = mockUsers.find((u) => u.id === req.session.userId);
    if (mock) {
      if (name) { mock.name = name; req.session.userName = name; }
      if (phone !== undefined) mock.phone = phone;
      if (address !== undefined) mock.address = address;
      const { passwordHash: _, ...safeUser } = mock;
      res.json({ user: safeUser, message: 'Profile updated successfully.' });
      return;
    }

    res.status(404).json({ error: 'Not Found', message: 'User not found.' });
  })
);

export default router;
