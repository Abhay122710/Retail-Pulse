import express from 'express';
import cors from 'cors';
import apiRoutes from '../routes/api.routes.js';

const app = express();

// CORS setup for local development across Vite ports (e.g. 5173, 5174, 5175, 3000, 5000, 8080)
app.use(
  cors({
    origin: '*', // Allow all dev ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  })
);

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Connector Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
