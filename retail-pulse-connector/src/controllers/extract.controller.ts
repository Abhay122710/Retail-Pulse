import { Request, Response } from 'express';
import { ExtractionService } from '../services/extractionService.js';
import { db } from '../models/database.js';

export class ExtractController {
  public static handlePostExtract(req: Request, res: Response): void {
    try {
      const { source, data_types } = req.body;
      if (!source || !data_types || !Array.isArray(data_types)) {
        res.status(400).json({
          success: false,
          message: 'Invalid payload: source and data_types array are required.'
        });
        return;
      }

      const record = ExtractionService.runExtraction({ source, data_types });

      res.status(200).json({
        success: true,
        source: record.source,
        records_extracted: record.records_extracted,
        extraction_id: record.extraction_id,
        timestamp: record.completed_at
      });
    } catch (err: any) {
      console.error('[ExtractController] Error executing extraction:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleGetExtractions(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const extractions = db.getExtractions(source);

      res.status(200).json({
        success: true,
        count: extractions.length,
        extractions
      });
    } catch (err: any) {
      console.error('[ExtractController] Error fetching extractions:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }
}
