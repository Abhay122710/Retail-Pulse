import { Request, Response } from 'express';
import { db } from '../models/database.js';
import { TimeSeriesService } from '../predictive/timeSeriesService.js';

export class PredictiveController {
  private static pythonUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://127.0.0.1:8000';

  public static setPythonServiceUrl(url: string) {
    PredictiveController.pythonUrl = url;
  }

  public static resetPythonServiceUrl() {
    PredictiveController.pythonUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://127.0.0.1:8000';
  }

  /**
   * Helper to query Python ML service with a timeout.
   */
  private static async queryPythonService<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      const res = await fetch(`${PredictiveController.pythonUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // Python ML service is offline or timed out
    }
    return null;
  }

  /**
   * GET /api/predictive/forecasts
   * STRICT PYTHON-POWERED: Queries retailpulse-ml. If offline, serves cached Python forecast or 503.
   */
  public static async getForecasts(req: Request, res: Response): Promise<void> {
    try {
      const source = (req.query.source as string) || 'ALL SOURCES';
      const productId = (req.query.productId as string) || null;
      const horizonDays = parseInt((req.query.horizonDays as string) || '7', 10);
      const targetMetric = (req.query.targetMetric as 'UNITS' | 'REVENUE') || 'UNITS';

      // 1. Attempt Python ML service query
      const pyParams = new URLSearchParams({
        source,
        horizonDays: String(horizonDays),
        targetMetric
      });
      if (productId) pyParams.set('productId', productId);

      const pyData = await PredictiveController.queryPythonService<any>(
        `/api/predictive/forecasts?${pyParams.toString()}`
      );

      if (pyData) {
        // Persist newly computed Python forecast into database
        db.saveForecast(pyData);
        res.status(200).json({
          status: 'success',
          data: pyData,
          engine: 'Python-FastAPI',
          source: 'LIVE_MODEL'
        });
        return;
      }

      // 2. Python is offline: check for previously stored Python forecast
      const stored = db
        .getForecasts({ source, product_id: productId })
        .find((f) => f.horizon_days === horizonDays);

      if (stored) {
        res.status(200).json({
          status: 'success',
          data: stored,
          engine: 'Python-FastAPI',
          source: 'STORED_CACHE',
          warning: `Python ML service (port 8000) is currently offline. Serving previously computed Python forecast generated at ${stored.created_at}.`
        });
        return;
      }

      // 3. No stored forecast available: Return explicit 503 Service Unavailable
      res.status(503).json({
        status: 'error',
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message:
          'The Python ML service (port 8000) is unreachable and no previously computed Python forecasts are cached. Please start retailpulse-ml service.'
      });
    } catch (err: any) {
      console.error('[Predictive] Error in getForecasts:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error processing forecast request',
        error: err.message
      });
    }
  }

  /**
   * POST /api/predictive/forecasts/generate
   * STRICT PYTHON-POWERED: Triggers model training in Python ML service.
   */
  public static async generateForecast(req: Request, res: Response): Promise<void> {
    try {
      const { source, productId, horizonDays, targetMetric } = req.body;
      const horizon = horizonDays ? parseInt(horizonDays, 10) : 7;
      const metric = targetMetric || 'UNITS';
      const src = source || 'ALL SOURCES';

      const pyData = await PredictiveController.queryPythonService<any>(
        '/api/predictive/forecasts/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: src,
            product_id: productId || null,
            horizon_days: horizon,
            target_metric: metric
          })
        }
      );

      if (pyData) {
        db.saveForecast(pyData);
        res.status(200).json({
          status: 'success',
          message: 'Model trained and forecast generated successfully via Python ML service',
          data: pyData,
          engine: 'Python-FastAPI'
        });
        return;
      }

      res.status(503).json({
        status: 'error',
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message:
          'Cannot train or project demand forecast: Python ML service (port 8000) is offline. All ML computations must run in Python.'
      });
    } catch (err: any) {
      console.error('[Predictive] Error in generateForecast:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to trigger model training',
        error: err.message
      });
    }
  }

  /**
   * GET /api/predictive/inventory
   * STRICT PYTHON-POWERED: Queries Python inventory optimization engine.
   */
  public static async getInventoryRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const source = req.query.source as string | undefined;
      const queryParam = source ? `?source=${encodeURIComponent(source)}` : '';

      const pyData = await PredictiveController.queryPythonService<any>(
        `/api/predictive/inventory${queryParam}`
      );

      if (pyData) {
        if (pyData.recommendations) {
          db.saveInventoryRecommendations(pyData.recommendations);
        }
        res.status(200).json({
          status: 'success',
          data: pyData,
          engine: 'Python-FastAPI',
          source: 'LIVE_MODEL'
        });
        return;
      }

      // If Python is offline, check for stored recommendations
      const stored = db.getInventoryRecommendations(source);
      if (stored && stored.length > 0) {
        res.status(200).json({
          status: 'success',
          data: {
            recommendations: stored,
            inventory_items: [],
            summary: {
              total_skus: stored.length,
              critical_stockouts: stored.filter((r) => r.stockout_risk_level === 'CRITICAL').length,
              high_risk: stored.filter((r) => r.stockout_risk_level === 'HIGH').length,
              reorders_recommended: stored.filter((r) => r.suggested_reorder_qty > 0).length
            },
            timestamp: stored[0]?.created_at || new Date().toISOString()
          },
          engine: 'Python-FastAPI',
          source: 'STORED_CACHE',
          warning: 'Python ML service is currently offline. Serving previously computed recommendations.'
        });
        return;
      }

      res.status(503).json({
        status: 'error',
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message:
          'The Python ML service (port 8000) is unreachable and no previously computed inventory recommendations exist.'
      });
    } catch (err: any) {
      console.error('[Predictive] Error generating inventory recommendations:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate inventory recommendations',
        error: err.message
      });
    }
  }

  /**
   * GET /api/predictive/anomalies
   * STRICT PYTHON-POWERED: Queries Python anomaly detection engine.
   */
  public static async getAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const source = req.query.source as string | undefined;
      const metric = req.query.metric as string | undefined;
      const severity = req.query.severity as string | undefined;

      const params = new URLSearchParams();
      if (source) params.set('source', source);
      if (metric) params.set('metric', metric);
      if (severity) params.set('severity', severity);

      const pyData = await PredictiveController.queryPythonService<any>(
        `/api/predictive/anomalies?${params.toString()}`
      );

      if (pyData && pyData.anomalies) {
        db.saveAnomalies(pyData.anomalies);
        res.status(200).json({
          status: 'success',
          data: pyData,
          engine: 'Python-FastAPI',
          source: 'LIVE_MODEL'
        });
        return;
      }

      // If Python is offline, check for stored anomalies
      const stored = db.getAnomalies({ source, metric, severity });
      if (stored && stored.length > 0) {
        res.status(200).json({
          status: 'success',
          data: {
            anomalies: stored,
            summary: {
              total: stored.length,
              critical: stored.filter((a) => a.severity === 'CRITICAL').length,
              warning: stored.filter((a) => a.severity === 'WARNING').length,
              info: stored.filter((a) => a.severity === 'INFO').length,
              unacknowledged: stored.filter((a) => !a.acknowledged).length
            }
          },
          engine: 'Python-FastAPI',
          source: 'STORED_CACHE',
          warning: 'Python ML service is currently offline. Serving previously detected anomalies.'
        });
        return;
      }

      res.status(503).json({
        status: 'error',
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message:
          'The Python ML service (port 8000) is unreachable and no previously detected anomalies are stored.'
      });
    } catch (err: any) {
      console.error('[Predictive] Error detecting anomalies:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve anomalies',
        error: err.message
      });
    }
  }

  /**
   * POST /api/predictive/anomalies/:id/ack
   */
  public static async acknowledgeAnomaly(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const success = db.acknowledgeAnomaly(id);

      // Forward acknowledgment to Python service as well
      PredictiveController.queryPythonService(`/api/predictive/anomalies/${id}/ack`, {
        method: 'POST'
      }).catch(() => {});

      if (!success) {
        res.status(404).json({
          status: 'error',
          message: `Anomaly with ID '${id}' not found`
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: `Anomaly '${id}' successfully acknowledged`
      });
    } catch (err: any) {
      console.error('[Predictive] Error acknowledging anomaly:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to acknowledge anomaly',
        error: err.message
      });
    }
  }

  /**
   * GET /api/predictive/evaluation
   * STRICT PYTHON-POWERED: Queries Python model evaluation metrics.
   */
  public static async getModelEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const source = (req.query.source as string) || 'ALL SOURCES';
      const productId = (req.query.productId as string) || null;

      const pyParams = new URLSearchParams({ source });
      if (productId) pyParams.set('productId', productId);

      const pyData = await PredictiveController.queryPythonService<any>(
        `/api/predictive/forecasts/evaluation?${pyParams.toString()}`
      );

      if (pyData) {
        res.status(200).json({
          status: 'success',
          data: pyData,
          engine: 'Python-FastAPI',
          source: 'LIVE_MODEL'
        });
        return;
      }

      // Check for stored forecast evaluation
      const stored = db.getForecasts({ source, product_id: productId })[0];
      if (stored?.evaluation) {
        res.status(200).json({
          status: 'success',
          data: {
            model_name: stored.model_name,
            model_version: stored.model_version,
            status: stored.status,
            warnings: stored.warnings,
            evaluation: stored.evaluation
          },
          engine: 'Python-FastAPI',
          source: 'STORED_CACHE',
          warning: 'Python ML service is currently offline. Serving previously computed evaluation metrics.'
        });
        return;
      }

      res.status(503).json({
        status: 'error',
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message: 'The Python ML service is unreachable and no stored evaluation metrics are available.'
      });
    } catch (err: any) {
      console.error('[Predictive] Error fetching model evaluation:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch model evaluation',
        error: err.message
      });
    }
  }

  /**
   * GET /api/predictive/timeseries
   * Continuous daily time-series data for charting (data preparation service).
   */
  public static async getTimeSeries(req: Request, res: Response): Promise<void> {
    try {
      const source = req.query.source as string | undefined;
      const productId = req.query.productId as string | undefined;

      if (productId) {
        const productSeries = TimeSeriesService.getProductDailyTimeSeries(productId, source);
        res.status(200).json({
          status: 'success',
          data: productSeries
        });
        return;
      }

      const series = TimeSeriesService.getDailyTimeSeries(source);
      res.status(200).json({
        status: 'success',
        data: series
      });
    } catch (err: any) {
      console.error('[Predictive] Error fetching time series:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch daily time series',
        error: err.message
      });
    }
  }
}
