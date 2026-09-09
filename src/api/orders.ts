import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string(),
    packId: z.string(),
    offerId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Cart must have at least one item'),
  deliveryAddress: z.string().min(10, 'Please provide a complete delivery address'),
  deliveryPhone: z.string().min(10, 'Please provide a valid phone number'),
  paymentMethod: z.enum(['CreditDebitCard', 'UPIInstantPay', 'NetBanking', 'CashOnDelivery']),
  prescriptionId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Created', 'Paid', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']),
  note: z.string().optional(),
});

/**
 * GET /api/orders
 * Patient: their own orders.
 * Pharmacy: orders for their pharmacy.
 * Admin: all orders.
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const role = req.session.userRole;
    const userId = req.session.userId!;

    const orders = await db.order.findMany({
      where:
        role === 'patient'
          ? { patientId: userId }
          : role === 'pharmacy'
          ? { pharmacyId: req.session.pharmacyId }
          : {}, // admin sees all
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
        pharmacy: { select: { id: true, name: true, city: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders, total: orders.length });
  })
);

/**
 * GET /api/orders/:id
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await db.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
        pharmacy: { select: { id: true, name: true, city: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    // Enforce access
    if (req.session.userRole === 'patient' && order.patientId !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
      return;
    }

    res.json({ order });
  })
);

/**
 * POST /api/orders
 * Create a new order from cart. Patient only.
 * Validates stock availability and prescription requirements.
 */
router.post(
  '/',
  requireAuth,
  requireRole('patient'),
  validateBody(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { items, deliveryAddress, deliveryPhone, paymentMethod, prescriptionId } = req.body;

    // Validate all offers exist and are in stock
    let subtotal = 0;
    let deliveryFee = 0;
    let primaryPharmacyId = '';
    let primaryPharmacyName = '';
    const orderItems: any[] = [];

    for (const item of items) {
      const offer = await db.sellerOffer.findUnique({
        where: { id: item.offerId },
        include: { medicine: true, pack: true, pharmacy: true },
      });

      if (!offer) {
        res.status(400).json({ error: 'Bad Request', message: `Offer ${item.offerId} not found.` });
        return;
      }

      if (!offer.inStock) {
        res.status(400).json({ error: 'Bad Request', message: `${offer.medicine.name} from ${offer.pharmacy.name} is currently out of stock.` });
        return;
      }

      if (offer.medicine.isPrescriptionRequired && !prescriptionId) {
        res.status(400).json({ error: 'Bad Request', message: `A valid prescription is required for ${offer.medicine.name}.` });
        return;
      }

      if (!primaryPharmacyId) {
        primaryPharmacyId = offer.pharmacyId;
        primaryPharmacyName = offer.pharmacy.name;
        deliveryFee = offer.deliveryFee;
      }

      const itemTotal = +(offer.price * item.quantity).toFixed(2);
      subtotal += itemTotal;

      orderItems.push({
        medicineId: offer.medicineId,
        medicineName: offer.medicine.name,
        genericName: offer.medicine.genericName,
        packId: offer.packId,
        quantity: item.quantity,
        unitPrice: offer.price,
        totalPrice: itemTotal,
        isPrescriptionRequired: offer.medicine.isPrescriptionRequired,
      });
    }

    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + deliveryFee + tax).toFixed(2);
    const orderNumber = `GM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-${primaryPharmacyId.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        patientId: req.session.userId!,
        deliveryAddress,
        deliveryPhone,
        pharmacyId: primaryPharmacyId,
        subtotal: +subtotal.toFixed(2),
        deliveryFee,
        tax,
        total,
        prescriptionId,
        paymentMethod,
        paymentStatus: paymentMethod === 'CashOnDelivery' ? 'Pending' : 'Success',
        paymentReference: `PAY-REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        orderStatus: 'Paid',
        trackingNumber,
        items: { create: orderItems },
        statusHistory: {
          create: [
            { status: 'Created', actor: req.session.userName },
            { status: 'Paid', actor: `Payment Gateway (${paymentMethod})` },
          ],
        },
      },
      include: { items: true, statusHistory: { orderBy: { timestamp: 'asc' } } },
    });

    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: 'Patient',
        action: 'ORDER_PLACED_AND_PAID',
        target: `Order #${order.orderNumber}`,
        source: 'WebUI',
        reason: `Patient completed checkout for ₹${total.toFixed(2)} via ${paymentMethod}`,
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      },
    });

    res.status(201).json({ order, message: `Order ${orderNumber} placed successfully.` });
  })
);

/**
 * PUT /api/orders/:id/status
 * Update order status. Pharmacy/Admin only.
 */
router.put(
  '/:id/status',
  requireAuth,
  requireRole('pharmacy', 'admin'),
  validateBody(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const existing = await db.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    if (req.session.userRole === 'pharmacy' && existing.pharmacyId !== req.session.pharmacyId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only update orders for your pharmacy.' });
      return;
    }

    const order = await db.order.update({
      where: { id: req.params.id },
      data: {
        orderStatus: status,
        statusHistory: { create: { status, actor: req.session.userName, note } },
      },
      include: { items: true, statusHistory: { orderBy: { timestamp: 'asc' } } },
    });

    await db.auditRecord.create({
      data: {
        actorId: req.session.userId,
        actorName: req.session.userName,
        role: req.session.userRole === 'pharmacy' ? 'Pharmacy Partner' : 'Admin / Operations',
        action: 'ORDER_FULFILLMENT_STATE_CHANGED',
        target: `Order #${existing.orderNumber}`,
        source: req.session.userRole === 'pharmacy' ? 'PartnerPortal' : 'AdminConsole',
        reason: note || `State transitioned to ${status}`,
        correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
        diffField: 'orderStatus',
        diffBefore: existing.orderStatus,
        diffAfter: status,
      },
    });

    res.json({ order, message: `Order status updated to ${status}.` });
  })
);

/**
 * POST /api/orders/:id/cancel
 * Cancel an order. Patient (own orders), Pharmacy, or Admin.
 */
router.post(
  '/:id/cancel',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const existing = await db.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    if (req.session.userRole === 'patient' && existing.patientId !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only cancel your own orders.' });
      return;
    }

    if (['Shipped', 'Delivered'].includes(existing.orderStatus)) {
      res.status(400).json({ error: 'Bad Request', message: 'Cannot cancel an order that has already been shipped or delivered.' });
      return;
    }

    const order = await db.order.update({
      where: { id: req.params.id },
      data: {
        orderStatus: 'Cancelled',
        statusHistory: { create: { status: 'Cancelled', actor: req.session.userName, note: reason || 'Cancelled by user' } },
      },
      include: { statusHistory: { orderBy: { timestamp: 'asc' } } },
    });

    res.json({ order, message: 'Order cancelled successfully.' });
  })
);

export default router;
