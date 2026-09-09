import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __dbConnected: boolean | undefined;
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

let isDbConnected: boolean = global.__dbConnected ?? false;
let isChecked = false;

/**
 * Probe DB connectivity with a fast timeout (2.5s default).
 * Prevents Prisma from stalling requests for 30s when MongoDB Atlas IP is not whitelisted.
 */
export async function checkDatabaseConnection(timeoutMs = 2500): Promise<boolean> {
  if (isChecked) return isDbConnected;
  if (!process.env.DATABASE_URL) {
    isDbConnected = false;
    isChecked = true;
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
  } catch {
    isDbConnected = false;
  } finally {
    isChecked = true;
    global.__dbConnected = isDbConnected;
  }
  return isDbConnected;
}

export function isDatabaseReady(): boolean {
  return isDbConnected;
}

/**
 * Proxied DB client: if DB is unreachable/offline, queries fail fast immediately (0ms)
 * allowing all endpoints to instantly fallback to in-memory mock datasets without hanging.
 */
export const db: PrismaClient = new Proxy(rawPrisma, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && (prop.startsWith('$') || prop === 'then')) {
      return Reflect.get(target, prop, receiver);
    }
    if (isChecked && !isDbConnected) {
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
