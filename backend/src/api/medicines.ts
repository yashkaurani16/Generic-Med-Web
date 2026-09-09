import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateQuery } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

import { INITIAL_MEDICINES } from '../data/mockData';
import { CatalogService } from '../services/catalogService';

const router = Router();

const querySchema = z.object({
  search: z.string().optional(),
  therapeuticClass: z.string().optional(),
  dosageForm: z.string().optional(),
  rxRequired: z.enum(['true', 'false']).optional(),
});

/**
 * GET /api/medicines
 * List medicines with optional filters for search, category, and prescription status.
 * Public endpoint — no auth required.
 */
router.get(
  '/',
  validateQuery(querySchema),
  asyncHandler(async (req, res) => {
    const { search, therapeuticClass, dosageForm, rxRequired } = req.query as any;

    try {
      const medicines = await db.medicine.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { genericName: { contains: search, mode: 'insensitive' } },
                    { brandName: { contains: search, mode: 'insensitive' } },
                    { activeIngredient: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
            therapeuticClass && therapeuticClass !== 'all'
              ? { therapeuticClass: { contains: therapeuticClass, mode: 'insensitive' } }
              : {},
            dosageForm ? { dosageForm: dosageForm as any } : {},
            rxRequired !== undefined ? { isPrescriptionRequired: rxRequired === 'true' } : {},
          ],
        },
        include: {
          packs: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({ medicines, total: medicines.length });
      return;
    } catch {
      const medicines = await CatalogService.searchMedicines({
        search,
        category: therapeuticClass !== 'all' ? therapeuticClass : undefined,
        prescriptionOnly: rxRequired !== undefined ? rxRequired === 'true' : undefined,
      });
      res.json({ medicines, total: medicines.length });
    }
  })
);

/**
 * GET /api/medicines/:id
 * Return a single medicine with packs and available offers.
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      const medicine = await db.medicine.findUnique({
        where: { id: req.params.id },
        include: {
          packs: true,
          offers: {
            where: { inStock: true },
            include: {
              pharmacy: {
                select: { id: true, name: true, rating: true, verified: true, slaMinutes: true },
              },
            },
            orderBy: { price: 'asc' },
          },
        },
      });

      if (medicine) {
        res.json({ medicine });
        return;
      }
    } catch { /* DB offline fallback */ }

    const fallback = INITIAL_MEDICINES.find((m) => m.id === req.params.id);
    if (!fallback) {
      res.status(404).json({ error: 'Not Found', message: 'Medicine not found.' });
      return;
    }
    const offers = await CatalogService.getOffersForMedicine(req.params.id);
    res.json({ medicine: { ...fallback, offers } });
  })
);

/**
 * PUT /api/medicines/:id
 * Update medicine details. Admin only.
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { name, brandName, genericName, description, therapeuticClass, isPrescriptionRequired, manufacturer } = req.body;

    const medicine = await db.medicine.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(brandName && { brandName }),
        ...(genericName && { genericName }),
        ...(description && { description }),
        ...(therapeuticClass && { therapeuticClass }),
        ...(isPrescriptionRequired !== undefined && { isPrescriptionRequired }),
        ...(manufacturer && { manufacturer }),
      },
      include: { packs: true },
    });

    res.json({ medicine, message: 'Medicine updated successfully.' });
  })
);

export default router;
