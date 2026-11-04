import { Request, Response } from 'express';
import { BenchmarkService } from '../services/benchmarkService.js';

export class BenchmarkController {
  public static getBenchmark(_req: Request, res: Response): void {
    try {
      const data = BenchmarkService.getCrossStoreBenchmark();
      res.status(200).json(data);
    } catch (err: any) {
      console.error('[BenchmarkController] Error generating cross-store benchmark:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate cross-store benchmark analytics',
        error: err.message
      });
    }
  }
}
