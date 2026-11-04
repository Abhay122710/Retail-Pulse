import { Request, Response, NextFunction } from 'express';

/**
 * RetailPulse Security Middleware Suite
 * Enforces OWASP-recommended HTTP security headers, CORS origin allowlists,
 * and adaptive in-memory rate limiting against resource abuse and DoS.
 */

// 1. HTTP Security Headers
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:* http://127.0.0.1:*; frame-ancestors 'none';"
  );
  next();
}

// 2. Adaptive In-Memory Rate Limiter
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  skipInTests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute default
  const maxRequests = options.maxRequests || (process.env.NODE_ENV === 'test' ? 10000 : 300);
  const skipInTests = options.skipInTests ?? (process.env.NODE_ENV === 'test');

  return (req: Request, res: Response, next: NextFunction): void => {
    if (skipInTests && (req.headers['x-test-rate-limit-bypass'] || process.env.NODE_ENV === 'test')) {
      return next();
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let bucket = rateLimitStore.get(clientIp);
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(clientIp, bucket);
    } else {
      bucket.count++;
    }

    const remaining = Math.max(0, maxRequests - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', maxRequests.toString());
    res.setHeader('RateLimit-Remaining', remaining.toString());
    res.setHeader('RateLimit-Reset', resetSeconds.toString());

    if (bucket.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds.toString());
      res.status(429).json({
        success: false,
        error_category: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests. Please slow down and try again later.'
      });
      return;
    }

    next();
  };
}

// Clear store utility (useful for testing)
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
