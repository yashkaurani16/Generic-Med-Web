import { Request, Response, NextFunction } from 'express';
import { logger } from '../../lib/logger';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

export function gatewayMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 1. Correlation ID
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    `corr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  // 2. High-precision timing
  const startHrTime = process.hrtime();
  req.startTime = Date.now();

  // 3. Cache control for idempotent catalog queries
  if (req.method === 'GET') {
    if (req.path.startsWith('/medicines') || req.path.startsWith('/offers')) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }

  // 4. Response hook to log telemetry & set response header
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = Math.round(elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6);

    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', `${elapsedMs}ms`);
      } catch { /* headers already sent */ }
    }

    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${elapsedMs}ms)`, {
      module: 'Gateway',
      correlationId,
      status: res.statusCode,
      durationMs: elapsedMs,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
