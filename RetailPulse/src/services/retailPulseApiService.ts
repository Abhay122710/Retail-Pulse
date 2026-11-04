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
  data?: any;
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
      if (!data || !data.success) return null;
      return {
        extraction_id: data.extraction_id,
        source: data.source,
        data_type: dataTypes.join(', '),
        records_extracted: data.records_extracted,
        started_at: data.timestamp || new Date().toISOString(),
        completed_at: data.timestamp || new Date().toISOString(),
        status: 'SUCCESS',
        data: data.data
      };
    } catch (err) {
      console.warn('[Dashboard API] Error triggering extraction:', err);
      return null;
    }
  },

  getExtractionDownloadUrl(extractionId: string): string {
    return `${API_BASE_URL}/extractions/${extractionId}/download`;
  },

  downloadJsonFile(data: any, filename: string): void {
    try {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Dashboard API] Error downloading JSON file:', err);
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
  },

  // --- Predictive Analytics APIs (Part 3) ---

  async getForecasts(params: {
    source?: string;
    productId?: string | null;
    horizonDays?: number;
    targetMetric?: 'UNITS' | 'REVENUE';
  }): Promise<{ data: any; engine?: string } | null> {
    try {
      const search = new URLSearchParams();
      if (params.source) search.set('source', params.source);
      if (params.productId) search.set('productId', params.productId);
      if (params.horizonDays) search.set('horizonDays', String(params.horizonDays));
      if (params.targetMetric) search.set('targetMetric', params.targetMetric);

      const res = await fetch(`${API_BASE_URL}/predictive/forecasts?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching forecasts:', err);
      return null;
    }
  },

  async triggerGenerateForecast(params: {
    source?: string;
    productId?: string | null;
    horizonDays?: number;
    targetMetric?: 'UNITS' | 'REVENUE';
  }): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/forecasts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error generating forecast:', err);
      return null;
    }
  },

  async getInventory(source?: string): Promise<{ data: any; engine?: string } | null> {
    try {
      const query = source ? `?source=${encodeURIComponent(source)}` : '';
      const res = await fetch(`${API_BASE_URL}/predictive/inventory${query}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching inventory:', err);
      return null;
    }
  },

  async getAnomalies(filter?: {
    source?: string;
    metric?: string;
    severity?: string;
  }): Promise<{ data: any; engine?: string } | null> {
    try {
      const search = new URLSearchParams();
      if (filter?.source) search.set('source', filter.source);
      if (filter?.metric) search.set('metric', filter.metric);
      if (filter?.severity) search.set('severity', filter.severity);

      const res = await fetch(`${API_BASE_URL}/predictive/anomalies?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching anomalies:', err);
      return null;
    }
  },

  async acknowledgeAnomaly(anomalyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/anomalies/${encodeURIComponent(anomalyId)}/ack`, {
        method: 'POST'
      });
      return res.ok;
    } catch (err) {
      console.warn('[Dashboard API] Error acknowledging anomaly:', err);
      return false;
    }
  },

  async getModelEvaluation(source?: string, productId?: string | null): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source) search.set('source', source);
      if (productId) search.set('productId', productId);

      const res = await fetch(`${API_BASE_URL}/predictive/evaluation?${search.toString()}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('[Dashboard API] Error fetching model evaluation:', err);
      return null;
    }
  },

  async getTimeSeries(source?: string, productId?: string | null): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source) search.set('source', source);
      if (productId) search.set('productId', productId);

      const res = await fetch(`${API_BASE_URL}/predictive/timeseries?${search.toString()}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('[Dashboard API] Error fetching time series:', err);
      return null;
    }
  },

  async getPipelineMonitoring(source?: string): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source && source !== 'ALL SOURCES' && source !== 'All') {
        search.set('source', source);
      }
      const res = await fetch(`${API_BASE_URL}/pipeline/monitoring?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching pipeline monitoring:', err);
      return null;
    }
  },

  async getBenchmark(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/benchmark`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching benchmark analytics:', err);
      return null;
    }
  },

  async getProfitability(source?: string, category?: string): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source && source !== 'ALL SOURCES' && source !== 'All') search.set('source', source);
      if (category && category !== 'ALL') search.set('category', category);

      const res = await fetch(`${API_BASE_URL}/analytics/profitability?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching profitability analytics:', err);
      return null;
    }
  },

  async simulateScenario(params: {
    source?: string;
    productId?: string | null;
    price_change_pct?: number;
    demand_change_pct?: number;
    price_elasticity?: number;
    inventory_delta_pct?: number;
    lead_time_days_delta?: number;
    min_order_quantity_override?: number | null;
    horizon_days?: number;
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn('[Dashboard API] Error running simulation:', err);
      return { success: false, message: err.message || 'Network error contacting simulator' };
    }
  },

  async getSavedScenarios(): Promise<any[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/scenarios`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.scenarios || [];
    } catch (err) {
      console.warn('[Dashboard API] Error fetching saved scenarios:', err);
      return null;
    }
  },

  async saveScenario(scenario: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });
      return res.ok;
    } catch (err) {
      console.warn('[Dashboard API] Error saving scenario:', err);
      return false;
    }
  },

  async deleteScenario(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/predictive/scenarios/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.warn('[Dashboard API] Error deleting scenario:', err);
      return false;
    }
  },

  async getSegmentation(source?: string, dateFrom?: string, dateTo?: string): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source && source !== 'ALL SOURCES' && source !== 'All') search.set('source', source);
      if (dateFrom) search.set('date_from', dateFrom);
      if (dateTo) search.set('date_to', dateTo);

      const res = await fetch(`${API_BASE_URL}/analytics/segmentation?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching segmentation analytics:', err);
      return null;
    }
  },

  async getExecutiveReport(source?: string, days?: number): Promise<any | null> {
    try {
      const search = new URLSearchParams();
      if (source && source !== 'ALL SOURCES' && source !== 'All') search.set('source', source);
      if (days) search.set('days', String(days));

      const res = await fetch(`${API_BASE_URL}/reports/executive?${search.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Dashboard API] Error fetching executive report:', err);
      return null;
    }
  },

  getReportCsvUrl(section: string, source?: string): string {
    const search = new URLSearchParams();
    search.set('section', section);
    if (source && source !== 'ALL SOURCES' && source !== 'All') search.set('source', source);
    return `${API_BASE_URL}/reports/export-csv?${search.toString()}`;
  },

  async askPulseAI(
    query: string,
    source?: string,
    conversationHistory?: any[]
  ): Promise<{ success: boolean; data?: any; error?: string; message?: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          source: source && source !== 'All' ? source : 'ALL SOURCES',
          conversation_history: conversationHistory || []
        })
      });
      return await res.json();
    } catch (err: any) {
      console.warn('[Dashboard API] Error communicating with PulseAI:', err);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err.message || 'Network error reaching PulseAI gateway'
      };
    }
  }
};

