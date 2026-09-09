import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const rawPrisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = rawPrisma;
}

// Default to false until explicitly verified by checkDatabaseConnection
let isDbConnected = false;

/**
 * Probe DB connectivity with a fast timeout (2.5s default).
 * Prevents Prisma from stalling requests for 30s when MongoDB Atlas IP is not whitelisted.
 */
export async function checkDatabaseConnection(timeoutMs = 2500): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    isDbConnected = false;
    return false;
  }
  try {
    await Promise.race([
      rawPrisma.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB connection timed out')), timeoutMs)
      ),
    ]);
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    return false;
  }
}

export function isDatabaseReady(): boolean {
  return isDbConnected;
}

/**
 * Proxied DB client: if DB is not verified connected, queries fail fast immediately (0ms)
 * so every API endpoint instantly falls back to mock data without stalling or throwing unhandled errors.
 */
export const db: PrismaClient = new Proxy(rawPrisma, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && (prop.startsWith('$') || prop === 'then')) {
      return Reflect.get(target, prop, receiver);
    }
    // If database connection is not confirmed, fail immediately with zero latency
    if (!isDbConnected) {
      return new Proxy({}, {
        get() {
          return () => Promise.reject(new Error('Database offline; fast fallback'));
        },
      });
    }
    return Reflect.get(target, prop, receiver);
  },
});

export const prisma = db;
