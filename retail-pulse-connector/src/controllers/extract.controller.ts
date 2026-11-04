import { Request, Response } from 'express';
import { ExtractionService } from '../services/extractionService.js';
import { db } from '../models/database.js';
import { Logger } from '../utils/logger.js';

export class ExtractController {
  public static handlePostExtract(req: Request, res: Response): void {
    const correlationId = (req.headers['x-correlation-id'] as string) || `EXT-${Date.now().toString(36)}`;
    try {
      const { source, data_types } = req.body;
      if (!source || !data_types || !Array.isArray(data_types)) {
        Logger.warn('EXTRACTION', 'Missing source or data_types in extraction request', correlationId);
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Invalid payload: source and data_types array are required.'
        });
        return;
      }

      const validSources = ['ShopPulse', 'TechMart', 'ALL SOURCES', 'All'];
      if (!validSources.includes(source)) {
        Logger.warn('EXTRACTION', `Rejected extraction for unsupported source "${source}"`, correlationId);
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: `Unsupported source "${source}". Must be one of: ShopPulse, TechMart, ALL SOURCES`
        });
        return;
      }

      const record = ExtractionService.runExtraction({ source, data_types });

      Logger.info(
        'EXTRACTION', 
        `Extraction completed successfully for [${record.source}]: ${record.records_extracted} records`, 
        correlationId
      );

      res.status(200).json({
        success: true,
        source: record.source,
        records_extracted: record.records_extracted,
        extraction_id: record.extraction_id,
        timestamp: record.completed_at,
        data: record.extracted_data
      });
    } catch (err: any) {
      Logger.error('EXTRACTION', `Error executing extraction: ${err.message}`, correlationId, 'EXTRACTION_ERROR');
      res.status(500).json({
        success: false,
        error_category: 'EXTRACTION_ERROR',
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
      Logger.error('EXTRACTION', `Error fetching extractions: ${err.message}`, 'GET-EXT', 'DATABASE_ERROR');
      res.status(500).json({
        success: false,
        error_category: 'DATABASE_ERROR',
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleDownloadExtraction(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const extractions = db.getExtractions();
      const record = id === 'latest' 
        ? extractions[0] 
        : extractions.find(e => e.extraction_id === id);

      if (!record || !record.extracted_data) {
        res.status(404).json({
          success: false,
          error_category: 'NOT_FOUND',
          message: 'Extraction record not found'
        });
        return;
      }

      const filename = `retail_pulse_${record.source.replace(/\s+/g, '_').toLowerCase()}_${record.extraction_id}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(JSON.stringify(record.extracted_data, null, 2));
    } catch (err: any) {
      Logger.error('EXTRACTION', `Error downloading extraction: ${err.message}`, 'DOWNLOAD-EXT', 'INTERNAL_ERROR');
      res.status(500).json({
        success: false,
        error_category: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error'
      });
    }
  }
}
