import { Request, Response } from 'express';
import { ProfitabilityService } from '../services/profitabilityService.js';

export class ProfitabilityController {
  public static getProfitability(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const category = req.query.category as string | undefined;

      const data = ProfitabilityService.getProfitabilityAnalytics(source, category);
      res.status(200).json(data);
    } catch (err: any) {
      console.error('[ProfitabilityController] Error retrieving profitability metrics:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product profitability analytics',
        error: err.message
      });
    }
  }
}
