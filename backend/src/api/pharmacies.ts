import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

import { INITIAL_PHARMACIES, INITIAL_OFFERS } from '../data/mockData';

const router = Router();

const updatePharmacySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  slaMinutes: z.number().int().min(15).max(1440).optional(),
});

const submitRatingSchema = z.object({
  pharmacyId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

/**
 * GET /api/pharmacies
 * List all active pharmacies — public endpoint.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { city, verified } = req.query as Record<string, string>;

    try {
      const pharmacies = await db.pharmacy.findMany({
        where: {
          isActive: true,
          ...(city && { city: { contains: city, mode: 'insensitive' } }),
          ...(verified === 'true' && { verified: true }),
        },
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      });

      res.json({ pharmacies, total: pharmacies.length });
      return;
    } catch {
      let filtered = [...INITIAL_PHARMACIES];
      if (city) filtered = filtered.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));
      if (verified === 'true') filtered = filtered.filter((p) => p.verified);
      res.json({ pharmacies: filtered, total: filtered.length });
    }
  })
);

/**
 * GET /api/pharmacies/:id
 * Pharmacy detail with offer stats.
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      const pharmacy = await db.pharmacy.findUnique({
        where: { id: req.params.id },
        include: {
          offers: {
            where: { inStock: true },
            include: {
              medicine: { select: { id: true, name: true, genericName: true, strength: true } },
              pack: true,
            },
            orderBy: { price: 'asc' },
            take: 20,
          },
          _count: {
            select: { offers: true, orders: true },
          },
        },
      });

      if (pharmacy) {
        res.json({ pharmacy });
        return;
      }
    } catch { /* DB offline fallback */ }

    const fallback = INITIAL_PHARMACIES.find((p) => p.id === req.params.id);
    if (!fallback) {
      res.status(404).json({ error: 'Not Found', message: 'Pharmacy not found.' });
      return;
    }
    const offers = INITIAL_OFFERS.filter((o) => o.pharmacyId === req.params.id);
    res.json({
      pharmacy: {
        ...fallback,
        offers,
        _count: { offers: offers.length, orders: 12 },
      },
    });
  })
);

/**
 * PUT /api/pharmacies/:id
 * Update pharmacy profile. Admin or owning pharmacy.
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'pharmacy'),
  validateBody(updatePharmacySchema),
  asyncHandler(async (req, res) => {
    const { name, address, city, slaMinutes } = req.body;

    if (req.session.userRole === 'pharmacy' && req.session.pharmacyId !== req.params.id) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only update your own pharmacy.' });
      return;
    }

    const pharmacy = await db.pharmacy.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(slaMinutes !== undefined && { slaMinutes }),
      },
    });

    res.json({ pharmacy, message: 'Pharmacy updated successfully.' });
  })
);

/**
 * POST /api/pharmacies/ratings
 * Patient submits a rating for a pharmacy.
 */
router.post(
  '/ratings',
  requireAuth,
  requireRole('patient'),
  validateBody(submitRatingSchema),
  asyncHandler(async (req, res) => {
    const { pharmacyId, rating } = req.body;

    const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) {
      res.status(404).json({ error: 'Not Found', message: 'Pharmacy not found.' });
      return;
    }

    // Weighted average: (existing_rating * review_count + new_rating) / (review_count + 1)
    const newReviewCount = pharmacy.reviewCount + 1;
    const newRating = +((pharmacy.rating * pharmacy.reviewCount + rating) / newReviewCount).toFixed(1);

    const updated = await db.pharmacy.update({
      where: { id: pharmacyId },
      data: { rating: newRating, reviewCount: newReviewCount },
    });

    res.json({ pharmacy: updated, message: 'Rating submitted. Thank you for your feedback!' });
  })
);

export default router;
