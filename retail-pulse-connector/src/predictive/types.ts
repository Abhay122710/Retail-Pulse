/**
 * RetailPulse Predictive Analytics Engine Types
 * Definitions for Demand Forecasting, Inventory Optimization, and Anomaly Detection.
 */

export interface DailyTimeSeriesPoint {
  date: string; // YYYY-MM-DD
  revenue_gross: number;
  revenue_net: number;
  order_count: number;
  units_sold: number;
  cancelled_orders: number;
  checkout_starts: number;
  product_views: number;
  cart_additions: number;
  is_interpolated_zero: boolean; // true if no events occurred on this date
}

export interface ProductDailyTimeSeries {
  product_id: string;
  product_name: string;
  source: string;
  points: Array<{
    date: string;
    units: number;
    revenue: number;
    views: number;
  }>;
}

export interface ForecastPoint {
  date: string; // YYYY-MM-DD
  predicted_demand: number; // >= 0
  lower_bound: number; // >= 0
  upper_bound: number; // >= predicted_demand
}

export interface ModelEvaluation {
  mae: number;
  wape: number; // Percentage
  rmse?: number;
  baseline_mae: number;
  baseline_rmse?: number;
  improvement_percentage: number;
  train_period: {
    start_date: string;
    end_date: string;
    sample_size_days: number;
  };
  test_period: {
    start_date: string;
    end_date: string;
    test_days: number;
  };
  actual_vs_predicted_test: Array<{
    date: string;
    actual: number;
    predicted: number;
    baseline: number;
    error: number;
  }>;
  model_comparison?: Array<{
    model_name: string;
    role: string;
    mae: number;
    rmse: number;
    wape: number;
    improvement_vs_baseline_pct: number;
    status: string;
  }>;
}

export interface ForecastRecord {
  forecast_id: string;
  source: string; // 'ShopPulse' | 'TechMart' | 'ALL SOURCES'
  product_id: string | null; // null represents aggregate store demand
  product_name: string | null;
  target_metric: 'UNITS' | 'REVENUE';
  horizon_days: number; // 7 or 30
  forecast_points: ForecastPoint[];
  model_name: 'Holt-Linear' | 'Holt-Winters' | 'Seasonal-Naive';
  model_version: string;
  evaluation: ModelEvaluation | null;
  status: 'SUFFICIENT_DATA' | 'LIMITED_DATA' | 'INSUFFICIENT_DATA';
  warnings: string[];
  created_at: string;
}

export interface InventoryItemInfo {
  product_id: string;
  product_name: string;
  source: string;
  category: string;
  unit_price: number;
  current_stock: number;
  stock_data_source: 'DEMO_ESTIMATED' | 'LIVE_CONNECTOR';
  supplier_lead_time_days: number;
  min_order_quantity: number;
  target_service_level: number; // e.g. 0.95
}

export interface InventoryRecommendation {
  recommendation_id: string;
  product_id: string;
  product_name: string;
  source: string;
  category: string;
  current_stock: number;
  stock_data_source: 'DEMO_ESTIMATED' | 'LIVE_CONNECTOR';
  supplier_lead_time_days: number;
  daily_forecast_rate: number;
  expected_demand_lead_time: number; // LTD
  safety_stock: number; // SS
  reorder_point: number; // ROP
  suggested_reorder_qty: number; // ROQ
  stockout_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stockout_risk_percentage: number;
  urgency: 'IMMEDIATE' | 'UPCOMING' | 'ADEQUATE';
  explanation: string;
  assumptions: string[];
  created_at: string;
}

export type AnomalyMetric = 
  | 'DAILY_REVENUE' 
  | 'ORDER_VOLUME' 
  | 'PRODUCT_DEMAND' 
  | 'CANCELLATION_RATE' 
  | 'ABANDONMENT_RATE';

export interface AnomalyRecord {
  anomaly_id: string;
  source: string;
  metric: AnomalyMetric;
  observation_date: string;
  observed_value: number;
  expected_baseline: number;
  expected_range: { lower: number; upper: number };
  deviation_percentage: number;
  z_score: number | null;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  direction: 'SPIKE' | 'DROP';
  detection_method: 'ROLLING_ZSCORE' | 'PERCENTAGE_DEVIATION';
  explanation: string;
  acknowledged: boolean;
  created_at: string;
}
