import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody, validateQuery } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

const offerQuerySchema = z.object({
  medicineId: z.string().optional(),
  packId: z.string().optional(),
  pharmacyId: z.string().optional(),
  inStockOnly: z.enum(['true', 'false']).optional(),
});

const updatePriceSchema = z.object({
  price: z.number().positive('Price must be positive'),
  reason: z.string().min(5, 'Please provide a reason for the price change'),
});

const updateStockSchema = z.object({
  inStock: z.boolean(),
  stockQuantity: z.number().int().min(0),
});

/**
 * GET /api/offers
 * Return seller offers with optional filters.
 * Public endpoint.
 */
router.get(
  '/',
  validateQuery(offerQuerySchema),
  asyncHandler(async (req, res) => {
    const { medicineId, packId, pharmacyId, inStockOnly } = req.query as any;

    const offers = await db.sellerOffer.findMany({
      where: {
        ...(medicineId && { medicineId }),
        ...(packId && { packId }),
        ...(pharmacyId && { pharmacyId }),
        ...(inStockOnly === 'true' && { inStock: true }),
      },
      include: {
        pharmacy: {
          select: { id: true, name: true, rating: true, verified: true, slaMinutes: true, city: true },
        },
        medicine: {
          select: { id: true, name: true, genericName: true, strength: true, dosageForm: true },
        },
        pack: true,
      },
      orderBy: [{ inStock: 'desc' }, { price: 'asc' }],
    });

    res.json({ offers, total: offers.length });
  })
);

/**
 * GET /api/offers/lowest
 * Return the cheapest in-stock offer for a medicine+pack combo.
 */
router.get(
  '/lowest',
  asyncHandler(async (req, res) => {
    const { medicineId, packId } = req.query as { medicineId?: string; packId?: string };

    if (!medicineId || !packId) {
      res.status(400).json({ error: 'Bad Request', message: 'medicineId and packId are required.' });
      return;
    }

    const offer = await db.sellerOffer.findFirst({
      where: { medicineId, packId, inStock: true },
      orderBy: { price: 'asc' },
      include: {
        pharmacy: { select: { id: true, name: true, rating: true, verified: true } },
        pack: true,
      },
    });

    res.json({ offer });
  })
);

/**
 * PUT /api/offers/:id/price
 * Pharmacy updates the price of their offer. Audit logged.
 */
router.put(
  '/:id/price',
  requireAuth,
  requireRole('pharmacy', 'admin'),
  validateBody(updatePriceSchema),
  asyncHandler(async (req, res) => {
    const { price, reason } = req.body;

    const existing = await db.sellerOffer.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Offer not found.' });
      return;
    }

    // Pharmacy can only update their own offers
    if (req.session.userRole === 'pharmacy' && existing.pharmacyId !== req.session.pharmacyId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only update your own pharmacy offers.' });
      return;
    }

    const updated = await db.sellerOffer.update({
      where: { id: req.params.id },
      data: { price, freshnessMinutesAgo: 0, freshnessStatus: 'fresh' },
    });

    // Audit log
    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: 'Pharmacy Operator',
        action: 'OFFER_PRICE_CHANGED',
        target: `Offer #${req.params.id}`,
        source: 'PartnerPortal',
        reason,
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
        diffField: 'price',
        diffBefore: String(existing.price),
        diffAfter: String(price),
      },
    });

    res.json({ offer: updated, message: 'Price updated successfully.' });
  })
);

/**
 * PUT /api/offers/:id/stock
 * Pharmacy updates stock quantity and availability.
 */
router.put(
  '/:id/stock',
  requireAuth,
  requireRole('pharmacy', 'admin'),
  validateBody(updateStockSchema),
  asyncHandler(async (req, res) => {
    const { inStock, stockQuantity } = req.body;

    const existing = await db.sellerOffer.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Offer not found.' });
      return;
    }

    if (req.session.userRole === 'pharmacy' && existing.pharmacyId !== req.session.pharmacyId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only update your own pharmacy offers.' });
      return;
    }

    const updated = await db.sellerOffer.update({
      where: { id: req.params.id },
      data: { inStock, stockQuantity, freshnessMinutesAgo: 0, freshnessStatus: 'fresh' },
    });

    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: 'Pharmacy Operator',
        action: 'OFFER_STOCK_CHANGED',
        target: `Offer #${req.params.id}`,
        source: 'PartnerPortal',
        reason: 'Inventory stock sync adjustment',
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
        diffField: 'stockQuantity',
        diffBefore: String(existing.stockQuantity),
        diffAfter: String(stockQuantity),
      },
    });

    res.json({ offer: updated, message: 'Stock updated successfully.' });
  })
);

export default router;
