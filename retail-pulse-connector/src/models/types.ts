export type SourceId = 'ShopPulse' | 'TechMart';

export type EventType = 
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'SEARCH'
  | 'CATEGORY_VIEW'
  | 'PRODUCT_HOVER'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CART_VIEW'
  | 'WISHLIST_ADD'
  | 'WISHLIST_REMOVE'
  | 'CHECKOUT_STARTED'
  | 'CHECKOUT_COMPLETED'
  | 'ORDER_CREATED'
  | 'ORDER_CANCELLED'
  | 'ORDER_DELIVERED'
  | 'REVIEW_SUBMITTED'
  | 'CLICKBAIT_CLICK'
  | 'BANNER_CLICK'
  | 'PROMO_CLICK'
  | 'LOGIN'
  | 'LOGOUT';

export interface RawEventPayload {
  event_type: EventType | string;
  source: SourceId | string;
  source_type?: string;
  session_id?: string;
  user_id?: string;
  customer_id?: string;
  user_code?: string;
  product_id?: string;
  sku?: string;
  product_name?: string;
  item_title?: string;
  category?: string;
  department?: string;
  order_id?: string;
  transaction_id?: string;
  search_query?: string;
  results_count?: number;
  view_duration_seconds?: number;
  quantity?: number;
  units?: number;
  unit_price?: number;
  total_amount?: number;
  net_value?: number;
  gross_value?: number;
  cart_value?: number;
  item_count?: number;
  rating?: number;
  payment_method?: string;
  payment_channel?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface CanonicalEvent {
  event_id: string;
  source: SourceId;
  source_type: string;
  event_type: EventType;
  session_id: string;
  user_id: string | null;
  canonical_user_id: string | null;
  product_id: string | null;
  canonical_product_id: string | null;
  product_name: string | null;
  category: string | null;
  order_id: string | null;
  canonical_transaction_id: string | null;
  search_query: string | null;
  results_count: number | null;
  view_duration_seconds: number | null;
  quantity: number | null;
  unit_price: number | null;
  total_amount: number | null;
  cart_value: number | null;
  item_count: number | null;
  rating: number | null;
  payment_method: string | null;
  timestamp: string;
  payload: string; // JSON string of original raw payload
  created_at: string;
}

export interface SourceRecord {
  source_id: SourceId;
  source_name: string;
  source_type: string;
  status: 'Connected' | 'Available' | 'Offline';
  last_seen: string | null;
  event_count: number;
}

export interface ExtractionRecord {
  extraction_id: string;
  source: SourceId | string;
  data_type: string;
  records_extracted: number;
  started_at: string;
  completed_at: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  extracted_data?: any;
}

export interface SessionRecord {
  session_id: string;
  source: SourceId;
  user_id: string | null;
  started_at: string;
  last_activity: string;
}

export interface DataExtractionRequest {
  source: SourceId | string;
  data_types: string[];
}

export interface PipelineAuditEntry {
  audit_id: string;
  timestamp: string;
  source: SourceId | string;
  stage: 'INGESTION' | 'VALIDATION' | 'TRANSFORMATION' | 'PERSISTENCE';
  status: 'ACCEPTED' | 'REJECTED' | 'DEDUPLICATED';
  event_type?: string;
  error_details?: string[];
  correlation_id: string;
}

export interface PipelineCounters {
  total_processed: number;
  records_accepted: number;
  records_rejected: number;
  records_deduplicated: number;
  validation_errors: number;
  last_successful_ingestion: string | null;
  last_failed_ingestion: string | null;
}

export interface SimulatorScenario {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  assumptions: {
    source: string;
    price_change_pct: number;
    demand_change_pct: number;
    inventory_delta_pct: number;
    lead_time_days?: number;
    min_order_quantity?: number;
  };
  results: {
    baseline_revenue: number;
    scenario_revenue: number;
    revenue_pct_change: number;
    baseline_units: number;
    scenario_units: number;
    units_pct_change: number;
    stockout_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    stock_requirements: number;
    estimated_profit_impact?: number | null;
    profit_margin_pct?: number | null;
  };
}
