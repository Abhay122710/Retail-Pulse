import { Request, Response } from 'express';
import { ReportService } from '../services/reportService.js';

export class ReportController {
  public static getExecutiveReport(req: Request, res: Response): void {
    try {
      const source = typeof req.query.source === 'string' ? req.query.source : undefined;
      const days = req.query.days ? Number(req.query.days) : 30;

      const report = ReportService.generateExecutiveReport({ source, days });

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (err: any) {
      console.error('[ReportController] Error generating executive report:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate executive report',
        error: err.message
      });
    }
  }

  public static exportCsv(req: Request, res: Response): void {
    try {
      const rawSection = typeof req.query.section === 'string' ? req.query.section : 'kpis';
      const safeSection = ['products', 'inventory', 'profitability', 'kpis'].includes(rawSection)
        ? rawSection
        : 'kpis';
      const source = typeof req.query.source === 'string' ? req.query.source : undefined;

      const csvContent = ReportService.exportCsv(safeSection, source);
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `retailpulse_${safeSection}_${dateStr}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (err: any) {
      console.error('[ReportController] Error exporting CSV:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to export CSV report',
        error: err.message
      });
    }
  }
}
