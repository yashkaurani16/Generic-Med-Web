/**
 * Integration tests for /api/auth endpoints.
 *
 * NOTE: These tests require a running PostgreSQL database.
 * Set TEST_DATABASE_URL in .env.test to run against a test database.
 *
 * Run: npm test -- auth.test
 */
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { json } from 'express';

// We mock the DB to avoid needing a real database for unit tests
jest.mock('../../lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    pharmacy: {
      findUnique: jest.fn(),
    },
  },
}));

import authRouter from '../../api/auth';
import { globalErrorHandler } from '../../api/middleware/errorHandler';
import { db } from '../../lib/db';

const mockDb = db as jest.Mocked<typeof db>;

function buildTestApp() {
  const app = express();
  app.use(json());
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use('/api/auth', authRouter);
  app.use(globalErrorHandler);
  return app;
}

describe('POST /api/auth/register', () => {
  const app = buildTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      password: 'Password123!',
      role: 'patient',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
      role: 'patient',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('password');
  });

  it('should return 409 when email already exists', async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
      role: 'patient',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Conflict');
  });

  it('should return 201 and create user on valid input', async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null); // no existing user
    (mockDb.user.create as jest.Mock).mockResolvedValue({
      id: 'new-user-id',
      name: 'New Patient',
      email: 'new@example.com',
      role: 'patient',
      phone: null,
      pharmacyId: null,
      pharmacyName: null,
      address: null,
      createdAt: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'New Patient',
      email: 'new@example.com',
      password: 'Password123!',
      role: 'patient',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});

describe('POST /api/auth/login', () => {
  const app = buildTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('should return 401 when user not found', async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should return 401 when password is wrong', async () => {
    // bcrypt hash of 'CorrectPassword123!'
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('CorrectPassword123!', 12);

    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'usr-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'patient',
      passwordHash: hash,
      pharmacyId: null,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('should return 200 and session on correct credentials', async () => {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('Password123!', 12);

    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'usr-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'patient',
      passwordHash: hash,
      pharmacyId: null,
      phone: null,
      address: null,
      avatarUrl: null,
      licenseNumber: null,
      clinicHospital: null,
      pharmacyName: null,
      createdAt: new Date(),
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});

describe('GET /api/auth/me', () => {
  it('should return 401 when not authenticated', async () => {
    const app = buildTestApp();

    // Mock db.user.findUnique for the requireAuth check
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
