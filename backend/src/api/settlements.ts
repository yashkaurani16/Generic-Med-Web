import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';
import { MarketplaceService } from '../services/marketplaceService';
import { z } from 'zod';
import { validateBody } from './middleware/validate';

const router = Router();

const payoutSchema = z.object({
  amount: z.number().positive(),
  bankAccountRef: z.string().min(4),
});

/**
 * GET /api/settlements/summary
 * Fetch marketplace financial summary and escrow balances
 */
router.get(
  '/summary',
  requireAuth,
  requireRole('admin', 'pharmacy'),
  asyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.session.userRole === 'pharmacy' ? req.session.pharmacyId : undefined;
    const summary = MarketplaceService.getSettlementSummary(pharmacyId);
    res.json(summary);
  })
);

/**
 * GET /api/settlements/ledger
 * List itemized settlement entries
 */
router.get(
  '/ledger',
  requireAuth,
  requireRole('admin', 'pharmacy'),
  asyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.session.userRole === 'pharmacy' ? req.session.pharmacyId : undefined;
    const ledger = MarketplaceService.getLedger(pharmacyId);
    res.json(ledger);
  })
);

/**
 * POST /api/settlements/payout
 * Request a payout disbursement to pharmacy bank account
 */
router.post(
  '/payout',
  requireAuth,
  requireRole('pharmacy', 'admin'),
  validateBody(payoutSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.session.pharmacyId || 'pharm-1';
    const { amount, bankAccountRef } = req.body;

    const request = MarketplaceService.requestPayout(pharmacyId, amount, bankAccountRef);
    res.status(201).json({
      success: true,
      message: 'Payout request initiated successfully',
      payout: request,
    });
  })
);

export default router;
