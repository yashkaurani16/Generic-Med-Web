import request from 'supertest';
import express, { json } from 'express';
import session from 'express-session';

// Mock DB
jest.mock('../../lib/db', () => ({
  db: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    sellerOffer: {
      findUnique: jest.fn(),
    },
    auditRecord: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Email
jest.mock('../../lib/email', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
  sendDeliveryUpdate: jest.fn().mockResolvedValue(undefined),
}));

import ordersRouter from '../../api/orders';
import { globalErrorHandler } from '../../api/middleware/errorHandler';
import { db } from '../../lib/db';

const mockDb = db as jest.Mocked<typeof db>;

function buildTestApp(sessionData: Record<string, any> = {}) {
  const app = express();
  app.use(json());
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    })
  );

  // Middleware to inject mock session
  app.use((req, _res, next) => {
    Object.assign(req.session, sessionData);
    next();
  });

  app.use('/api/orders', ordersRouter);
  app.use(globalErrorHandler);
  return app;
}

describe('Orders API (/api/orders)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects order creation if unauthenticated (401)', async () => {
    const app = buildTestApp({});
    const res = await request(app).post('/api/orders').send({
      items: [{ medicineId: 'med-1', packId: 'pack-1', offerId: 'off-1', quantity: 1 }],
      deliveryAddress: '123 Test Street, Bengaluru',
      deliveryPhone: '+91 9876543210',
      paymentMethod: 'UPIInstantPay',
    });

    expect(res.status).toBe(401);
  });

  it('rejects order creation with empty cart (400)', async () => {
    const app = buildTestApp({ userId: 'user-1', userRole: 'patient', userName: 'Test' });
    const res = await request(app).post('/api/orders').send({
      items: [],
      deliveryAddress: '123 Test Street, Bengaluru',
      deliveryPhone: '+91 9876543210',
      paymentMethod: 'UPIInstantPay',
    });

    expect(res.status).toBe(400);
  });

  it('successfully creates an order for available in-stock items (201)', async () => {
    const app = buildTestApp({ userId: 'user-1', userRole: 'patient', userName: 'Test Patient' });

    (mockDb.sellerOffer.findUnique as jest.Mock).mockResolvedValue({
      id: 'off-1',
      price: 150,
      deliveryFee: 30,
      inStock: true,
      pharmacyId: 'pharm-1',
      medicineId: 'med-1',
      packId: 'pack-1',
      medicine: { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', isPrescriptionRequired: false },
      pack: { id: 'pack-1' },
      pharmacy: { name: 'Apollo Pharmacy' },
    });

    (mockDb.order.create as jest.Mock).mockResolvedValue({
      id: 'ord-123',
      orderNumber: 'GM-2026-9999',
      patientId: 'user-1',
      total: 187.5,
      deliveryAddress: '123 Test Street, Bengaluru',
      trackingNumber: 'TRK-APOL-123456',
      orderStatus: 'Paid',
      items: [{ medicineName: 'Atorvastatin 10mg', quantity: 1, totalPrice: 150 }],
    });

    (mockDb.auditRecord.create as jest.Mock).mockResolvedValue({});
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: 'Test Patient' });

    const res = await request(app).post('/api/orders').send({
      items: [{ medicineId: 'med-1', packId: 'pack-1', offerId: 'off-1', quantity: 1 }],
      deliveryAddress: '123 Test Street, Bengaluru',
      deliveryPhone: '+91 9876543210',
      paymentMethod: 'UPIInstantPay',
    });

    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.orderNumber).toBe('GM-2026-9999');
  });

  it('prevents patients from updating order status directly (403)', async () => {
    const app = buildTestApp({ userId: 'user-1', userRole: 'patient', userName: 'Test Patient' });
    const res = await request(app).put('/api/orders/ord-123/status').send({
      status: 'Delivered',
    });

    expect(res.status).toBe(403);
  });
});
