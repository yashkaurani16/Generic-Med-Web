import { Router, Request, Response } from 'express';
import { asyncHandler } from './middleware/errorHandler';
import { LogisticsService } from '../services/logisticsService';
import { z } from 'zod';
import { validateBody } from './middleware/validate';

const router = Router();

const estimateSchema = z.object({
  carrierId: z.string(),
  isColdChainRequired: z.boolean().default(false),
  distanceKm: z.number().positive().default(5),
});

const webhookSchema = z.object({
  trackingNumber: z.string(),
  status: z.string(),
  eventTimestamp: z.string(),
  carrier: z.string(),
});

/**
 * GET /api/logistics/carriers
 * List available 3PL partners and service levels
 */
router.get(
  '/carriers',
  asyncHandler(async (_req: Request, res: Response) => {
    const carriers = LogisticsService.getCarriers();
    res.json({ carriers });
  })
);

/**
 * POST /api/logistics/estimate
 * Calculate estimated shipping rates
 */
router.post(
  '/estimate',
  validateBody(estimateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { carrierId, isColdChainRequired, distanceKm } = req.body;
    const estimate = LogisticsService.estimateShipping(carrierId, isColdChainRequired, distanceKm);
    res.json(estimate);
  })
);

/**
 * GET /api/logistics/track/:trackingNumber
 * Fetch real-time simulated driver GPS coordinates, ETA and vehicle info
 */
router.get(
  '/track/:trackingNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;
    const liveTracking = LogisticsService.getLiveTracking(trackingNumber);
    res.json(liveTracking);
  })
);

/**
 * POST /api/logistics/webhook
 * Carrier dispatch/delivery status webhook simulator
 */
router.post(
  '/webhook',
  validateBody(webhookSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = LogisticsService.handleCarrierWebhook(req.body);
    res.json(result);
  })
);

export default router;
