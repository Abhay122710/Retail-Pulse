import { Request, Response } from 'express';
import { SegmentationService } from '../services/segmentationService.js';

export class SegmentationController {
  public static getSegmentation(req: Request, res: Response): void {
    try {
      const source = typeof req.query.source === 'string' ? req.query.source : undefined;
      const dateFrom = typeof req.query.date_from === 'string' ? req.query.date_from : undefined;
      const dateTo = typeof req.query.date_to === 'string' ? req.query.date_to : undefined;

      const report = SegmentationService.getSegmentationAnalytics({
        source,
        dateFrom,
        dateTo
      });

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (err: any) {
      console.error('[SegmentationController] Error generating segmentation report:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate segmentation analytics',
        error: err.message
      });
    }
  }
}
