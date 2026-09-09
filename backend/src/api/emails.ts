import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';
import { sendWelcomeEmail } from '../lib/email';

const router = Router();

const testEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().default('Test User'),
});

/**
 * POST /api/emails/test
 * Admin only: send a test email to verify Resend configuration.
 */
router.post(
  '/test',
  requireAuth,
  requireRole('admin'),
  validateBody(testEmailSchema),
  asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    await sendWelcomeEmail(name, email, 'admin');
    res.json({ success: true, message: `Test email dispatched to ${email}` });
  })
);

export default router;
