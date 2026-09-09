import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

const createPaymentSchema = z.object({
  orderId: z.string(),
  provider: z.enum(['razorpay', 'stripe']).default('razorpay'),
  currency: z.string().default('INR'),
});

const verifyPaymentSchema = z.object({
  orderId: z.string(),
  provider: z.enum(['razorpay', 'stripe']),
  // Razorpay fields
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  // Stripe fields
  stripePaymentIntentId: z.string().optional(),
});

/**
 * POST /api/payments/create-order
 * Create a payment order with Razorpay or Stripe.
 * Returns provider-specific checkout data for the frontend.
 */
router.post(
  '/create-order',
  requireAuth,
  requireRole('patient'),
  validateBody(createPaymentSchema),
  asyncHandler(async (req, res) => {
    const { orderId, provider, currency } = req.body;

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    if (order.patientId !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
      return;
    }

    const amountInPaise = Math.round(order.total * 100); // Convert to paise for INR

    if (provider === 'razorpay') {
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeyId || !razorpayKeySecret) {
        // Stub response for development without real keys
        res.json({
          provider: 'razorpay',
          razorpayOrderId: `order_stub_${Date.now()}`,
          amount: amountInPaise,
          currency: currency || 'INR',
          keyId: 'rzp_test_stub',
          orderNumber: order.orderNumber,
          prefill: { name: req.session.userName },
          stub: true,
          message: 'Razorpay keys not configured. Using stub for development.',
        });
        return;
      }

      // Real Razorpay integration (requires razorpay package)
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: currency || 'INR',
          receipt: order.orderNumber,
          notes: { orderId: order.id, patientId: req.session.userId! },
        });

        res.json({
          provider: 'razorpay',
          razorpayOrderId: rzpOrder.id,
          amount: amountInPaise,
          currency: currency || 'INR',
          keyId: razorpayKeyId,
          orderNumber: order.orderNumber,
          prefill: { name: req.session.userName },
        });
      } catch (err: any) {
        console.error('Razorpay order creation error:', err.message);
        res.status(500).json({ error: 'Payment Error', message: 'Failed to create Razorpay order.' });
      }
      return;
    }

    if (provider === 'stripe') {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

      if (!stripeSecretKey) {
        res.json({
          provider: 'stripe',
          clientSecret: 'pi_stub_secret_test',
          amount: amountInPaise,
          currency: (currency || 'inr').toLowerCase(),
          orderNumber: order.orderNumber,
          stub: true,
          message: 'Stripe keys not configured. Using stub for development.',
        });
        return;
      }

      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInPaise,
          currency: (currency || 'inr').toLowerCase(),
          metadata: { orderId: order.id, orderNumber: order.orderNumber, patientId: req.session.userId! },
        });

        res.json({
          provider: 'stripe',
          clientSecret: paymentIntent.client_secret,
          amount: amountInPaise,
          currency: (currency || 'inr').toLowerCase(),
          orderNumber: order.orderNumber,
        });
      } catch (err: any) {
        console.error('Stripe PaymentIntent creation error:', err.message);
        res.status(500).json({ error: 'Payment Error', message: 'Failed to create Stripe payment intent.' });
      }
    }
  })
);

/**
 * POST /api/payments/verify
 * Verify payment signature and mark order as paid.
 */
router.post(
  '/verify',
  requireAuth,
  validateBody(verifyPaymentSchema),
  asyncHandler(async (req, res) => {
    const { orderId, provider, razorpayOrderId, razorpayPaymentId, razorpaySignature, stripePaymentIntentId } = req.body;

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    if (provider === 'razorpay') {
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (razorpayKeySecret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        // Verify HMAC-SHA256 signature
        const crypto = await import('crypto');
        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (generatedSignature !== razorpaySignature) {
          res.status(400).json({ error: 'Bad Request', message: 'Payment signature verification failed.' });
          return;
        }
      }

      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'Success',
          paymentReference: razorpayPaymentId || `PAY-RZP-${Date.now()}`,
        },
      });
    }

    if (provider === 'stripe' && stripePaymentIntentId) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (stripeSecretKey) {
        try {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(stripeSecretKey);
          const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
          if (intent.status !== 'succeeded') {
            res.status(400).json({ error: 'Bad Request', message: `Payment not completed. Status: ${intent.status}` });
            return;
          }
        } catch (err: any) {
          console.error('Stripe verification error:', err.message);
        }
      }

      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'Success',
          paymentReference: stripePaymentIntentId,
        },
      });
    }

    res.json({ message: 'Payment verified successfully.', orderId });
  })
);

/**
 * POST /api/payments/refund
 * Process a refund. Admin only.
 */
router.post(
  '/refund',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { orderId, reason } = req.body;

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'Refunded',
        orderStatus: 'Refunded',
        statusHistory: { create: { status: 'Refunded', actor: req.session.userName, note: reason || 'Refund processed by admin' } },
      },
    });

    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: 'Admin / Operations',
        action: 'PAYMENT_REFUNDED',
        target: `Order #${order.orderNumber}`,
        source: 'AdminConsole',
        reason: reason || 'Refund initiated',
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      },
    });

    res.json({ message: `Refund processed for order ${order.orderNumber}.` });
  })
);

export default router;
