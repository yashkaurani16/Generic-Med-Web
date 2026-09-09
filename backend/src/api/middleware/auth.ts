import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../types';


// Extend Express Request to include session user
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: UserRole;
    userName: string;
    pharmacyId?: string;
  }
}

/**
 * Middleware: require an authenticated session.
 * Rejects with 401 if no valid session exists.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be signed in to access this resource.',
    });
    return;
  }
  next();
}

/**
 * Middleware factory: require authenticated session + specific roles.
 * Rejects with 403 if the user's role is not in the allowed list.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be signed in to access this resource.',
      });
      return;
    }

    const userRole = req.session.userRole as UserRole;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}.`,
        yourRole: userRole,
      });
      return;
    }

    next();
  };
}
