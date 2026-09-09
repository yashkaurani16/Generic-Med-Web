import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

const bulkRowSchema = z.object({
  medicineId: z.string(),
  packId: z.string(),
  price: z.number().positive('Price must be greater than 0'),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be non-negative'),
  inStock: z.boolean().optional(),
});

const bulkUploadSchema = z.object({
  pharmacyId: z.string().optional(),
  rows: z.array(bulkRowSchema).min(1, 'At least one offer update is required').max(500, 'Max 500 rows per batch'),
});

/**
 * POST /api/bulk-upload
 * Bulk update pharmacy medicine offers (prices and stock quantities).
 * Pharmacy (for their own offers) and Admin only.
 */
router.post(
  '/',
  requireAuth,
  requireRole('pharmacy', 'admin'),
  validateBody(bulkUploadSchema),
  asyncHandler(async (req, res) => {
    const { rows } = req.body;
    const targetPharmacyId = req.session.userRole === 'admin'
      ? req.body.pharmacyId || req.session.pharmacyId
      : req.session.pharmacyId;

    if (!targetPharmacyId) {
      res.status(400).json({ error: 'Bad Request', message: 'No pharmacy ID associated with this request.' });
      return;
    }

    const results: Array<{
      medicineId: string;
      packId: string;
      status: 'success' | 'failed';
      message: string;
      offerId?: string;
    }> = [];

    let successCount = 0;
    let failureCount = 0;

    for (const row of rows) {
      try {
        const existingOffer = await db.sellerOffer.findFirst({
          where: {
            pharmacyId: targetPharmacyId,
            medicineId: row.medicineId,
            packId: row.packId,
          },
        });

        const inStock = row.inStock !== undefined ? row.inStock : row.stockQuantity > 0;

        if (existingOffer) {
          const updated = await db.sellerOffer.update({
            where: { id: existingOffer.id },
            data: {
              price: row.price,
              stockQuantity: row.stockQuantity,
              inStock,
              lastUpdated: new Date(),
              freshnessMinutesAgo: 0,
              freshnessStatus: 'fresh',
            },
          });
          results.push({
            medicineId: row.medicineId,
            packId: row.packId,
            status: 'success',
            message: 'Offer updated successfully',
            offerId: updated.id,
          });
          successCount++;
        } else {
          // If offer doesn't exist, create it if medicine & pack exist
          const medicine = await db.medicine.findUnique({ where: { id: row.medicineId } });
          const pack = await db.medicinePack.findUnique({ where: { id: row.packId } });

          if (!medicine || !pack) {
            results.push({
              medicineId: row.medicineId,
              packId: row.packId,
              status: 'failed',
              message: 'Invalid medicineId or packId',
            });
            failureCount++;
            continue;
          }

          const created = await db.sellerOffer.create({
            data: {
              pharmacyId: targetPharmacyId,
              medicineId: row.medicineId,
              packId: row.packId,
              price: row.price,
              mrp: row.price * 1.3, // default estimated MRP
              inStock,
              stockQuantity: row.stockQuantity,
              deliveryEstimate: 'Standard Delivery (2-4 hrs)',
              deliveryFee: 29.0,
              freshnessStatus: 'fresh',
            },
          });
          results.push({
            medicineId: row.medicineId,
            packId: row.packId,
            status: 'success',
            message: 'Offer created successfully',
            offerId: created.id,
          });
          successCount++;
        }
      } catch (err: any) {
        results.push({
          medicineId: row.medicineId,
          packId: row.packId,
          status: 'failed',
          message: err.message || 'Database error',
        });
        failureCount++;
      }
    }

    // Record audit entry
    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: req.session.userRole === 'pharmacy' ? 'Pharmacy Partner' : 'Admin Console',
        action: 'BULK_PRICE_STOCK_UPLOAD',
        target: `Pharmacy #${targetPharmacyId}`,
        source: req.session.userRole === 'pharmacy' ? 'PartnerPortal' : 'AdminConsole',
        reason: `Bulk catalog upload processed: ${successCount} successful, ${failureCount} failed out of ${rows.length} total rows.`,
        correlationId: `bulk-${Date.now().toString(36)}`,
      },
    });

    res.json({
      message: `Bulk processing complete: ${successCount} updated/created, ${failureCount} failed.`,
      totalRows: rows.length,
      successCount,
      failureCount,
      results,
    });
  })
);

export default router;
