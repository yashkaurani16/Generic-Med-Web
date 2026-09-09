import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter: 100 requests per minute per IP.
 * Applied globally to all /api routes.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 1 minute.',
    retryAfter: 60,
  },
});

/**
 * Auth rate limiter: 10 requests per minute per IP.
 * Applied to /api/auth/* to prevent brute force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please wait 1 minute before trying again.',
    retryAfter: 60,
  },
});

/**
 * Prescription analysis limiter: 20 requests per minute per IP.
 * AI inference is expensive — protect from abuse.
 */
export const prescriptionAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Prescription analysis rate limit reached. Please wait 1 minute.',
    retryAfter: 60,
  },
});
