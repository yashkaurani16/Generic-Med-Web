import type { Request, Response, NextFunction } from 'express';

/**
 * Global async error handler — must be registered as the LAST middleware on the Express app.
 * Catches all errors thrown from async route handlers.
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message, err.stack);

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists.',
        field: prismaErr.meta?.target,
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested record was not found.',
      });
      return;
    }
  }

  // Default 500
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
  });
}

/**
 * Wraps an async Express route handler to automatically forward thrown errors
 * to Express's error handling chain (so globalErrorHandler catches them).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
