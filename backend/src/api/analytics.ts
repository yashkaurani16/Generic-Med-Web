import { Router } from 'express';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';

const router = Router();

/**
 * GET /api/analytics/summary
 * KPI summary for admin dashboard: total orders, total revenue, active users, pending prescriptions
 */
router.get(
  '/summary',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const [totalOrders, activeUsers, pendingPrescriptions, allOrders] = await Promise.all([
      db.order.count(),
      db.user.count(),
      db.prescription.count({ where: { status: 'PendingReview' } }),
      db.order.findMany({
        where: {
          orderStatus: { notIn: ['Cancelled', 'Refunded'] },
        },
        select: { total: true },
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeUsers,
      pendingPrescriptions,
    });
  })
);

/**
 * GET /api/analytics/orders-over-time
 * Aggregated orders and revenue for the last 30 days
 */
router.get(
  '/orders-over-time',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        orderStatus: { notIn: ['Cancelled'] },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day YYYY-MM-DD
    const dailyMap: Record<string, { date: string; orders: number; revenue: number }> = {};

    // Seed all past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const display = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[key] = { date: display, orders: 0, revenue: 0 };
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        dailyMap[key].revenue += o.total;
      }
    });

    const data = Object.values(dailyMap).map((d) => ({
      ...d,
      revenue: Math.round(d.revenue),
    }));

    res.json(data);
  })
);

/**
 * GET /api/analytics/top-medicines
 * Top 10 most ordered medicines with order count and total spend
 */
router.get(
  '/top-medicines',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const items = await db.orderItem.findMany({
      select: {
        medicineId: true,
        medicineName: true,
        genericName: true,
        quantity: true,
        totalPrice: true,
      },
    });

    const medMap: Record<string, { name: string; generic: string; count: number; revenue: number }> = {};

    items.forEach((item) => {
      if (!medMap[item.medicineId]) {
        medMap[item.medicineId] = {
          name: item.medicineName,
          generic: item.genericName,
          count: 0,
          revenue: 0,
        };
      }
      medMap[item.medicineId].count += item.quantity;
      medMap[item.medicineId].revenue += item.totalPrice;
    });

    const sorted = Object.values(medMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((m) => ({
        ...m,
        revenue: Math.round(m.revenue),
      }));

    res.json(sorted);
  })
);

/**
 * GET /api/analytics/pharmacy-performance
 * Performance statistics per partner pharmacy
 */
router.get(
  '/pharmacy-performance',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const pharmacies = await db.pharmacy.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            orderStatus: true,
          },
        },
      },
    });

    const result = pharmacies.map((p) => {
      const validOrders = p.orders.filter((o) => o.orderStatus !== 'Cancelled');
      const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        id: p.id,
        name: p.name,
        city: p.city,
        rating: p.rating,
        reviewCount: p.reviewCount,
        slaMinutes: p.slaMinutes,
        totalOrders: p.orders.length,
        totalRevenue: Math.round(totalRevenue),
      };
    });

    res.json(result);
  })
);

export default router;
