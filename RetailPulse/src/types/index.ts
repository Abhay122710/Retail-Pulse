export type SourceId = 'ShopPulse' | 'TechMart';
export type SourceSelection = 'ShopPulse' | 'TechMart' | 'ALL SOURCES';

export type DashboardTab = 
  | 'overview'
  | 'sources'
  | 'extraction'
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
  source: SourceSelection;
  recordsExtracted: number;
  dataTypes: string[];
  extractionTime: string;
  timestamp: string;
  status: 'Successful';
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
