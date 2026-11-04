import { Request, Response } from 'express';
import { db } from '../models/database.js';
import { PredictiveController } from './predictive.controller.js';
import { SimulatorScenario } from '../models/types.js';

export class SimulationController {
  public static async simulateScenario(req: Request, res: Response): Promise<void> {
    try {
      const {
        source = 'ALL SOURCES',
        productId,
        price_change_pct = 0.0,
        demand_change_pct = 0.0,
        price_elasticity = -1.2,
        inventory_delta_pct = 0.0,
        lead_time_days_delta = 0,
        min_order_quantity_override,
        horizon_days = 7
      } = req.body;

      // Validate bounds
      if (typeof price_change_pct !== 'number' || price_change_pct < -80 || price_change_pct > 200) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'price_change_pct must be a number between -80% and +200%'
        });
        return;
      }

      if (typeof demand_change_pct !== 'number' || demand_change_pct < -80 || demand_change_pct > 300) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'demand_change_pct must be a number between -80% and +300%'
        });
        return;
      }

      if (typeof inventory_delta_pct !== 'number' || inventory_delta_pct < -90 || inventory_delta_pct > 500) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'inventory_delta_pct must be a number between -90% and +500%'
        });
        return;
      }

      // Query Python ML service
      const pyData = await (PredictiveController as any).queryPythonService('/api/predictive/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          product_id: productId || null,
          price_change_pct,
          demand_change_pct,
          price_elasticity,
          inventory_delta_pct,
          lead_time_days_delta,
          min_order_quantity_override,
          horizon_days
        })
      });

      if (pyData) {
        res.status(200).json({
          success: true,
          engine: 'Python-FastAPI',
          source: 'LIVE_MODEL',
          data: pyData
        });
        return;
      }

      // Python service offline
      res.status(503).json({
        success: false,
        error: 'PYTHON_ML_SERVICE_UNAVAILABLE',
        message: 'The Python ML service (port 8000) is unreachable. Scenario simulations require active Python forecasting and elasticity computation.'
      });
    } catch (err: any) {
      console.error('[SimulationController] Error running simulation:', err);
      res.status(500).json({
        success: false,
        message: 'Internal error running scenario simulation',
        error: err.message
      });
    }
  }

  public static getSavedScenarios(_req: Request, res: Response): void {
    try {
      const scenarios = db.getScenarios();
      res.status(200).json({
        success: true,
        count: scenarios.length,
        scenarios
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static saveScenario(req: Request, res: Response): void {
    try {
      const scenario: SimulatorScenario = req.body;
      if (!scenario || !scenario.name || !scenario.assumptions || !scenario.results) {
        res.status(400).json({
          success: false,
          message: 'Invalid scenario payload: name, assumptions, and results are required.'
        });
        return;
      }

      if (!scenario.id) {
        scenario.id = `SCEN-SAVED-${Date.now().toString(36)}`;
      }
      if (!scenario.created_at) {
        scenario.created_at = new Date().toISOString();
      }

      db.saveScenario(scenario);
      res.status(201).json({
        success: true,
        scenario
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static deleteScenario(req: Request, res: Response): void {
    try {
      const id = String(req.params.id);
      const success = db.deleteScenario(id);
      if (success) {
        res.status(200).json({ success: true, message: `Scenario ${id} deleted` });
      } else {
        res.status(404).json({ success: false, message: `Scenario ${id} not found` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
