import { Router } from 'express';
import { db } from '../lib/db';
import { requireAuth } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

/**
 * GET /api/medical-history
 * Returns the aggregated medical history and medication timeline for the current patient.
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const patientId = (req.query.patientId as string) || req.session.userId!;

    // Enforce patient access restriction: patients can only access their own history
    if (req.session.userRole === 'patient' && patientId !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
      return;
    }

    const [orders, prescriptions, user] = await Promise.all([
      db.order.findMany({
        where: { patientId },
        include: {
          items: true,
          pharmacy: { select: { id: true, name: true, city: true } },
          statusHistory: { orderBy: { timestamp: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.prescription.findMany({
        where: { patientId },
        orderBy: { uploadedAt: 'desc' },
      }),
      db.user.findUnique({
        where: { id: patientId },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      }),
    ]);

    // Build chronological timeline
    const timeline: Array<{
      id: string;
      date: string;
      type: 'prescription' | 'order';
      title: string;
      subtitle: string;
      status: string;
      details: string[];
    }> = [];

    prescriptions.forEach((p) => {
      timeline.push({
        id: `rx-${p.id}`,
        date: p.uploadedAt.toISOString(),
        type: 'prescription',
        title: `Prescription by ${p.doctorName}`,
        subtitle: `${p.clinicHospital} · Valid until ${p.validUntil}`,
        status: p.status,
        details: p.prescribedMedicines,
      });
    });

    orders.forEach((o) => {
      timeline.push({
        id: `ord-${o.id}`,
        date: o.createdAt.toISOString(),
        type: 'order',
        title: `Order #${o.orderNumber}`,
        subtitle: `Fulfilled by ${o.pharmacy.name} · ₹${o.total.toFixed(2)}`,
        status: o.orderStatus,
        details: o.items.map((i) => `${i.medicineName} (${i.quantity} units)`),
      });
    });

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Extract unique active medications
    const uniqueMedsMap = new Map<string, { medicineName: string; genericName: string; lastOrdered: string; orderCount: number }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = uniqueMedsMap.get(item.medicineId);
        if (existing) {
          existing.orderCount += item.quantity;
        } else {
          uniqueMedsMap.set(item.medicineId, {
            medicineName: item.medicineName,
            genericName: item.genericName,
            lastOrdered: o.createdAt.toISOString(),
            orderCount: item.quantity,
          });
        }
      });
    });

    res.json({
      patient: user,
      timeline,
      totalOrders: orders.length,
      totalPrescriptions: prescriptions.length,
      activeMedications: Array.from(uniqueMedsMap.values()),
    });
  })
);

export default router;
