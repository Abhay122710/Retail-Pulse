export type SourceId = 'ShopPulse' | 'TechMart';
export type SourceSelection = 'ShopPulse' | 'TechMart' | 'ALL SOURCES';

export type DashboardTab = 
  | 'extraction'
  | 'live-stream'
  | 'overview'
  | 'predictive'
  | 'pipeline'
  | 'profitability'
  | 'benchmarking'
  | 'simulator'
  | 'segmentation'
  | 'reports'
  | 'pulse-ai'
  | 'sources'
  | 'extracted-data'
  | 'insights'
  | 'settings';

export type ExtractionStep = 'idle' | 'connecting' | 'fetching' | 'processing' | 'complete';

export interface SourceSummary {
  id: SourceId;
  name: string;
  type: string;
  description: string;
  availableRecords: number;
  dataAvailable: string[];
  status: 'Available' | 'Connected';
  icon: string;
  primaryColor: string;
}

export interface ShopPulseRecord {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  category: string;
  quantity: number;
  amount: number;
  orderDate: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
}

export interface TechMartRecord {
  id: string;
  transactionId: string;
  user: string;
  sku: string;
  product: string;
  units: number;
  grossValue: number;
  netValue: number;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
}

export type ExtractedRecord = ShopPulseRecord | TechMartRecord;

export interface ExtractionResult {
  source: SourceSelection | string;
  recordsExtracted: number;
  dataTypes: string[];
  extractionTime: string;
  timestamp: string;
  status: 'Successful' | 'SUCCESS';
  extractionId?: string;
  data?: any;
}

export interface InsightKPI {
  title: string;
  value: string;
  subtext: string;
  change?: string;
  isPositive?: boolean;
  iconName: string;
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  count: number;
}

export interface CategoryBreakdownPoint {
  name: string;
  revenue: number;
  count: number;
  percentage: number;
  color: string;
}

export interface TopProductPoint {
  rank: number;
  name: string;
  categoryOrDept: string;
  unitsSold: number;
  revenue: number;
}

export interface StatusDistributionPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface UserFunnelPoint {
  step: string;
  count: number;
  conversion: string;
}

export interface CartBehaviorStats {
  cartAdditions: number;
  cartRemovals: number;
  cartViews: number;
  checkoutStarts: number;
  completedOrders: number;
  abandonmentRate: string;
}

export interface SearchInsightItem {
  query: string;
  count: number;
  noResultsCount: number;
}

export interface SourceInsights {
  source: SourceSelection;
  totalRevenue: string;
  totalOrdersOrTx: string;
  topProduct: string;
  topCategoryOrDept: string;
  avgValue: string;
  topLocationOrStock: string;
  abandonmentRate?: string;
  conversionRate?: string;
  avgDwellSeconds?: number;
  kpis: InsightKPI[];
  funnel?: UserFunnelPoint[];
  cartBehavior?: CartBehaviorStats;
  searchInsights?: SearchInsightItem[];
  revenueTrend: RevenueTrendPoint[];
  categoryBreakdown: CategoryBreakdownPoint[];
  topProducts: TopProductPoint[];
  statusDistribution: StatusDistributionPoint[];
}

export interface GlobalFiltersState {
  searchQuery: string;
  selectedDataType: string;
  selectedStatus: string;
}

// --- Predictive Analytics Interfaces (Part 3) ---

export interface ForecastPoint {
  date: string;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ModelEvaluation {
  mae: number;
  wape: number;
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
  source: string;
  product_id: string | null;
  product_name: string | null;
  target_metric: 'UNITS' | 'REVENUE';
  horizon_days: number;
  forecast_points: ForecastPoint[];
  model_name: string;
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
  target_service_level: number;
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
  expected_demand_lead_time: number;
  safety_stock: number;
  reorder_point: number;
  suggested_reorder_qty: number;
  stockout_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stockout_risk_percentage: number;
  urgency: 'IMMEDIATE' | 'UPCOMING' | 'ADEQUATE';
  explanation: string;
  assumptions: string[];
  created_at: string;
}

export interface AnomalyRecord {
  anomaly_id: string;
  source: string;
  metric: string;
  observation_date: string;
  observed_value: number;
  expected_baseline: number;
  expected_range: { lower: number; upper: number };
  deviation_percentage: number;
  z_score: number | null;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  direction: 'SPIKE' | 'DROP';
  detection_method: string;
  explanation: string;
  acknowledged: boolean;
  created_at: string;
}

