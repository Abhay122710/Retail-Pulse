import { Request, Response } from 'express';
import { InsightService } from '../services/insightService.js';

export class InsightsController {
  public static handleGetInsights(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const insights = InsightService.getInsights(source);

      res.status(200).json({
        success: true,
        insights
      });
    } catch (err: any) {
      console.error('[InsightsController] Error generating insights:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }
}
