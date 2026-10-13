import { Request, Response } from 'express';
import { db } from '../models/database.js';

export class SourcesController {
  public static handleGetSources(_req: Request, res: Response): void {
    try {
      const sources = db.getSources();
      res.status(200).json({
        success: true,
        sources
      });
    } catch (err: any) {
      console.error('[SourcesController] Error fetching sources:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleGetSummary(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const events = db.getEvents({ source });
      const sources = db.getSources();

      let targetSource = sources.find((s) => s.source_id === source);
      if (!targetSource && source !== 'ALL SOURCES' && source !== 'All') {
        targetSource = sources[0];
      }

      res.status(200).json({
        success: true,
        source: source || 'ALL SOURCES',
        status: targetSource ? targetSource.status : 'Connected',
        last_seen: targetSource ? targetSource.last_seen : new Date().toISOString(),
        events_count: events.length,
        sources
      });
    } catch (err: any) {
      console.error('[SourcesController] Error fetching summary:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }
}
