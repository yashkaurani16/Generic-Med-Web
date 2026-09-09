import { Router } from 'express';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

/**
 * GET /api/audit
 * Admin only. Returns full audit trail, newest first.
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { action, actor, source, limit = '100', offset = '0' } = req.query as Record<string, string>;

    const records = await db.auditRecord.findMany({
      where: {
        ...(action && { action: { contains: action, mode: 'insensitive' } }),
        ...(actor && { actorName: { contains: actor, mode: 'insensitive' } }),
        ...(source && { source: source as any }),
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const total = await db.auditRecord.count();

    res.json({ records, total });
  })
);

export default router;
