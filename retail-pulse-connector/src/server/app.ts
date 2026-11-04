import express from 'express';
import cors from 'cors';
import apiRoutes from '../routes/api.routes.js';
import { securityHeaders, createRateLimiter } from '../middleware/security.middleware.js';

const app = express();

// Disable information disclosure headers
app.disable('x-powered-by');

// Enforce OWASP security headers
app.use(securityHeaders);

// CORS setup: restrict to trusted origins in production, permit dev ports
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

const customOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (tools, curl, SSR, subagents)
      if (!origin) return callback(null, true);
      const allowed = customOrigins || defaultAllowedOrigins;
      if (process.env.NODE_ENV !== 'production' || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy rejection: Origin "${origin}" is not authorized.`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-correlation-id', 'x-test-rate-limit-bypass']
  })
);

// Bounded body parser (mitigate resource exhaustion / oversized payloads)
app.use(express.json({ limit: '1mb' }));

// Adaptive rate limiter for /api routes
app.use('/api', createRateLimiter({ maxRequests: 300, windowMs: 60000 }));

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      error_category: 'INVALID_JSON',
      message: 'Malformed JSON payload: ' + err.message
    });
    return;
  }
  if (err?.message?.includes('CORS policy rejection')) {
    res.status(403).json({
      success: false,
      error_category: 'CORS_FORBIDDEN',
      message: err.message
    });
    return;
  }
  console.error('[Connector Server Error]:', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    message: isProd ? 'Internal Server Error' : err.message || 'Internal Server Error'
  });
});

export default app;
