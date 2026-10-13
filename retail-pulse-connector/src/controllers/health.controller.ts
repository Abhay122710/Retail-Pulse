import { Request, Response } from 'express';

export class HealthController {
  public static handleHealthCheck(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'OK',
      service: 'Retail Pulse Connector',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
}
