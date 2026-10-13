const API_BASE_URL = (import.meta as any).env?.VITE_CONNECTOR_URL || 'http://localhost:5000/api';

export interface ApiCanonicalEvent {
  event_id: string;
  source: 'ShopPulse' | 'TechMart';
  source_type: string;
  event_type: string;
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
  payload: string;
  created_at: string;
}

export interface ApiSourceRecord {
  source_id: 'ShopPulse' | 'TechMart';
  source_name: string;
  source_type: string;
  status: 'Connected' | 'Offline';
  last_seen: string;
  event_count: number;
}

export interface ApiExtractionRecord {
  extraction_id: string;
  source: string;
  data_type: string;
  records_extracted: number;
  started_at: string;
  completed_at: string;
  status: 'SUCCESS' | 'FAILED';
}

export const retailPulseApiService = {
  async getHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      return data && (data.status === 'OK' || data.status === 'ok' || data.status?.toUpperCase() === 'OK');
    } catch {
      return false;
    }
  },

  async getSources(): Promise<ApiSourceRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sources`);
      const data = await res.json();
      return data.sources || [];
    } catch (err) {
      console.warn('[Dashboard API] Error fetching sources:', err);
      return [];
    }
  },

  async getEvents(source?: string, limit = 50): Promise<ApiCanonicalEvent[]> {
    try {
      const url = new URL(`${API_BASE_URL}/events`);
      if (source && source !== 'ALL SOURCES' && source !== 'All') {
        url.searchParams.append('source', source);
      }
      url.searchParams.append('limit', limit.toString());

      const res = await fetch(url.toString());
      const data = await res.json();
      return data.events || [];
    } catch (err) {
      console.warn('[Dashboard API] Error fetching events:', err);
      return [];
    }
  },

  async getInsights(source?: string): Promise<any> {
    try {
      const url = new URL(`${API_BASE_URL}/insights`);
      if (source && source !== 'ALL SOURCES' && source !== 'All') {
        url.searchParams.append('source', source);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      return data.insights || null;
    } catch (err) {
      console.warn('[Dashboard API] Error fetching insights:', err);
      return null;
    }
  },

  async getExtractions(source?: string): Promise<ApiExtractionRecord[]> {
    try {
      const url = new URL(`${API_BASE_URL}/extractions`);
      if (source && source !== 'ALL SOURCES' && source !== 'All') {
        url.searchParams.append('source', source);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      return data.extractions || [];
    } catch (err) {
      console.warn('[Dashboard API] Error fetching extractions:', err);
      return [];
    }
  },

  async runExtraction(source: string, dataTypes: string[]): Promise<ApiExtractionRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, data_types: dataTypes })
      });
      const data = await res.json();
      return data.success ? data : null;
    } catch (err) {
      console.warn('[Dashboard API] Error triggering extraction:', err);
      return null;
    }
  },

  async sendTestEvent(source: 'ShopPulse' | 'TechMart'): Promise<ApiCanonicalEvent | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/test-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
      });
      const data = await res.json();
      return data.event || null;
    } catch (err) {
      console.warn('[Dashboard API] Error sending test event:', err);
      return null;
    }
  }
};
