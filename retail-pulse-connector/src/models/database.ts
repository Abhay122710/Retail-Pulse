import fs from 'fs';
import path from 'path';
import { 
  CanonicalEvent, 
  SourceRecord, 
  ExtractionRecord, 
  SessionRecord, 
  SourceId,
  PipelineAuditEntry,
  PipelineCounters,
  SimulatorScenario
} from './types.js';
import {
  ForecastRecord,
  AnomalyRecord,
  InventoryRecommendation
} from '../predictive/types.js';

interface DatabaseSchema {
  events: CanonicalEvent[];
  sources: SourceRecord[];
  extractions: ExtractionRecord[];
  sessions: SessionRecord[];
  forecasts?: ForecastRecord[];
  anomalies?: AnomalyRecord[];
  inventory_recommendations?: InventoryRecommendation[];
  pipeline_audit?: PipelineAuditEntry[];
  pipeline_counters?: Record<string, PipelineCounters>;
  scenarios?: SimulatorScenario[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : path.resolve(DATA_DIR, 'retail_pulse.json');

class JSONDatabase {
  private currentDbFile: string = DB_FILE;
  private data: DatabaseSchema = {
    events: [],
    sources: [],
    extractions: [],
    sessions: [],
    forecasts: [],
    anomalies: [],
    inventory_recommendations: [],
    pipeline_audit: [],
    pipeline_counters: {},
    scenarios: []
  };

  constructor(customFile?: string) {
    if (customFile) {
      this.currentDbFile = path.resolve(customFile);
    }
    this.initDatabase(this.currentDbFile);
  }

  public loadDatabaseFile(filePath: string): void {
    this.currentDbFile = path.resolve(filePath);
    this.initDatabase(this.currentDbFile);
  }

  public clearAllData(): void {
    this.data = {
      events: [],
      sources: [],
      extractions: [],
      sessions: [],
      forecasts: [],
      anomalies: [],
      inventory_recommendations: [],
      pipeline_audit: [],
      pipeline_counters: {},
      scenarios: []
    };
    this.save();
  }

  private initDatabase(targetFile: string = this.currentDbFile) {
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(targetFile)) {
      try {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.forecasts) this.data.forecasts = [];
        if (!this.data.anomalies) this.data.anomalies = [];
        if (!this.data.inventory_recommendations) this.data.inventory_recommendations = [];
        if (!this.data.pipeline_audit) this.data.pipeline_audit = [];
        if (!this.data.pipeline_counters) this.data.pipeline_counters = {};
        if (!this.data.scenarios) this.data.scenarios = [];
        console.log(`[DB] Database loaded successfully from ${targetFile}`);
      } catch (err) {
        console.error('[DB] Failed to load database file, attempting recovery from backup.', err);
        const backupFile = `${targetFile}.bak`;
        if (fs.existsSync(backupFile)) {
          try {
            const rawBak = fs.readFileSync(backupFile, 'utf-8');
            this.data = JSON.parse(rawBak);
            if (!this.data.forecasts) this.data.forecasts = [];
            if (!this.data.anomalies) this.data.anomalies = [];
            if (!this.data.inventory_recommendations) this.data.inventory_recommendations = [];
            if (!this.data.pipeline_audit) this.data.pipeline_audit = [];
            if (!this.data.pipeline_counters) this.data.pipeline_counters = {};
            if (!this.data.scenarios) this.data.scenarios = [];
            console.log(`[DB] Database successfully recovered from backup ${backupFile}`);
            return;
          } catch (bakErr) {
            console.error('[DB] Backup file also corrupted. Seeding fresh database.', bakErr);
          }
        }
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      const dataStr = JSON.stringify(this.data, null, 2);
      // Create backup copy before overwriting to ensure crash-recovery
      if (fs.existsSync(this.currentDbFile)) {
        try {
          fs.copyFileSync(this.currentDbFile, `${this.currentDbFile}.bak`);
        } catch {}
      }
      // Atomic write pattern: write to temporary file then atomically replace target
      const tempFile = `${this.currentDbFile}.tmp.${process.pid}.${Date.now()}`;
      fs.writeFileSync(tempFile, dataStr, 'utf-8');
      try {
        fs.renameSync(tempFile, this.currentDbFile);
      } catch {
        // Fallback for Windows filesystem lock conditions
        fs.copyFileSync(tempFile, this.currentDbFile);
        try {
          fs.unlinkSync(tempFile);
        } catch {}
      }
    } catch (err) {
      console.error('[DB] Error persisting database file:', err);
    }
  }

  private seedInitialData() {
    console.log('[DB] Seeding initial baseline sources and events...');
    const now = new Date().toISOString();

    this.data.sources = [
      {
        source_id: 'ShopPulse',
        source_name: 'ShopPulse General E-Commerce',
        source_type: 'ecommerce',
        status: 'Connected',
        last_seen: now,
        event_count: 5
      },
      {
        source_id: 'TechMart',
        source_name: 'TechMart Electronics Store',
        source_type: 'ecommerce',
        status: 'Connected',
        last_seen: now,
        event_count: 5
      }
    ];

    // Seed initial baseline events
    this.data.events = [
      {
        event_id: 'EVT-100001',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'PRODUCT_VIEW',
        session_id: 'SP-SESSION-001',
        user_id: 'C001',
        canonical_user_id: 'C001',
        product_id: 'P001',
        canonical_product_id: 'P001',
        product_name: 'Wireless Noise-Canceling Headphones',
        category: 'Electronics',
        order_id: null,
        canonical_transaction_id: null,
        search_query: null,
        results_count: null,
        view_duration_seconds: 45,
        quantity: null,
        unit_price: 2499,
        total_amount: null,
        cart_value: null,
        item_count: null,
        rating: null,
        payment_method: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        payload: JSON.stringify({ product_id: 'P001', product_name: 'Wireless Noise-Canceling Headphones' }),
        created_at: now
      },
      {
        event_id: 'EVT-100002',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ADD_TO_CART',
        session_id: 'SP-SESSION-001',
        user_id: 'C001',
        canonical_user_id: 'C001',
        product_id: 'P001',
        canonical_product_id: 'P001',
        product_name: 'Wireless Noise-Canceling Headphones',
        category: 'Electronics',
        order_id: null,
        canonical_transaction_id: null,
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 2499,
        total_amount: 2499,
        cart_value: 2499,
        item_count: 1,
        rating: null,
        payment_method: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        payload: JSON.stringify({ product_id: 'P001', quantity: 1, unit_price: 2499 }),
        created_at: now
      },
      {
        event_id: 'EVT-100003',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        session_id: 'SP-SESSION-001',
        user_id: 'C001',
        canonical_user_id: 'C001',
        product_id: 'P001',
        canonical_product_id: 'P001',
        product_name: 'Wireless Noise-Canceling Headphones',
        category: 'Electronics',
        order_id: 'ORD10045',
        canonical_transaction_id: 'ORD10045',
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 2499,
        total_amount: 2499,
        cart_value: null,
        item_count: 1,
        rating: null,
        payment_method: 'UPI',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        payload: JSON.stringify({ order_id: 'ORD10045', total_amount: 2499, payment_method: 'UPI' }),
        created_at: now
      },
      {
        event_id: 'EVT-100004',
        source: 'TechMart',
        source_type: 'ecommerce',
        event_type: 'SEARCH',
        session_id: 'TM-SESSION-001',
        user_id: 'TMU001',
        canonical_user_id: 'TMU001',
        product_id: null,
        canonical_product_id: null,
        product_name: null,
        category: null,
        order_id: null,
        canonical_transaction_id: null,
        search_query: 'gaming laptop',
        results_count: 8,
        view_duration_seconds: null,
        quantity: null,
        unit_price: null,
        total_amount: null,
        cart_value: null,
        item_count: null,
        rating: null,
        payment_method: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        payload: JSON.stringify({ search_query: 'gaming laptop', results_count: 8 }),
        created_at: now
      },
      {
        event_id: 'EVT-100005',
        source: 'TechMart',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        session_id: 'TM-SESSION-001',
        user_id: 'TMU001',
        canonical_user_id: 'TMU001',
        product_id: 'TM-LAP-001',
        canonical_product_id: 'TM-LAP-001',
        product_name: 'Pro Gaming Laptop RTX 4080',
        category: 'Gaming',
        order_id: 'TXN-TM-10045',
        canonical_transaction_id: 'TXN-TM-10045',
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 124999,
        total_amount: 124999,
        cart_value: null,
        item_count: 1,
        rating: null,
        payment_method: 'Credit Card',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        payload: JSON.stringify({ transaction_id: 'TXN-TM-10045', net_value: 124999 }),
        created_at: now
      }
    ];

    this.data.extractions = [];
    this.save();
  }

  // --- PUBLIC API ---

  public insertCanonicalEvent(event: CanonicalEvent): { inserted: boolean; event: CanonicalEvent } {
    return this.insertEvent(event);
  }

  public insertEvent(event: CanonicalEvent): { inserted: boolean; event: CanonicalEvent } {
    if (!event.event_id) {
      event.event_id = (event as any).canonical_event_id || `EVT-${Date.now()}-${Math.random()}`;
    }
    if (!event.session_id) {
      event.session_id = `SES-${event.source}-${Date.now()}`;
    }

    // 1. Check if event_id already exists (exact match)
    const existingById = this.data.events.find((e) => e.event_id === event.event_id);
    if (existingById) {
      return { inserted: false, event: existingById };
    }

    // 2. Business-key idempotency:
    // If an ORDER_CREATED event with the same source and order_id already exists, deduplicate
    if (event.event_type === 'ORDER_CREATED' && event.order_id) {
      const existingOrder = this.data.events.find(
        (e) => e.source === event.source && e.order_id === event.order_id && e.event_type === 'ORDER_CREATED'
      );
      if (existingOrder) {
        return { inserted: false, event: existingOrder };
      }
    }

    // 3. Exact payload/timing idempotency: same source, session, event_type, and timestamp
    const existingGeneric = this.data.events.find(
      (e) => e.source === event.source &&
             e.session_id === event.session_id &&
             e.event_type === event.event_type &&
             e.timestamp === event.timestamp
    );
    if (existingGeneric) {
      return { inserted: false, event: existingGeneric };
    }

    this.data.events.unshift(event); // Newest first

    // Update source status and event count
    const srcIndex = this.data.sources.findIndex((s) => s.source_id === event.source);
    if (srcIndex >= 0) {
      this.data.sources[srcIndex].status = 'Connected';
      this.data.sources[srcIndex].last_seen = event.timestamp;
      this.data.sources[srcIndex].event_count = this.data.events.filter((e) => e.source === event.source).length;
    } else {
      this.data.sources.push({
        source_id: event.source,
        source_name: `${event.source} Store`,
        source_type: 'ecommerce',
        status: 'Connected',
        last_seen: event.timestamp,
        event_count: 1
      });
    }

    // Upsert session
    this.upsertSession(event.session_id, event.source, event.user_id, event.timestamp);

    this.save();
    return { inserted: true, event };
  }

  public getEvents(options?: { source?: string; limit?: number; session_id?: string }): CanonicalEvent[] {
    let result = [...this.data.events];

    if (options?.source && options.source !== 'ALL SOURCES' && options.source !== 'All') {
      result = result.filter((e) => e.source === options.source);
    }

    if (options?.session_id) {
      result = result.filter((e) => e.session_id === options.session_id);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  public getSources(): SourceRecord[] {
    return this.data.sources;
  }

  public insertExtraction(record: ExtractionRecord): void {
    this.data.extractions.unshift(record);
    this.save();
  }

  public getExtractions(source?: string): ExtractionRecord[] {
    if (source && source !== 'ALL SOURCES' && source !== 'All') {
      return this.data.extractions.filter((ex) => ex.source === source);
    }
    return this.data.extractions;
  }

  public upsertSession(sessionId: string, source: SourceId, userId: string | null, timestamp: string): void {
    if (!sessionId) return;
    const index = this.data.sessions.findIndex((s) => s.session_id === sessionId);
    if (index >= 0) {
      this.data.sessions[index].last_activity = timestamp;
      if (userId) this.data.sessions[index].user_id = userId;
    } else {
      this.data.sessions.push({
        session_id: sessionId,
        source,
        user_id: userId,
        started_at: timestamp,
        last_activity: timestamp
      });
    }
    this.save();
  }

  public getSessionsCount(source?: string): number {
    if (source && source !== 'ALL SOURCES' && source !== 'All') {
      return this.data.sessions.filter((s) => s.source === source).length;
    }
    return this.data.sessions.length;
  }

  public saveForecast(record: ForecastRecord): void {
    if (!this.data.forecasts) this.data.forecasts = [];
    const idx = this.data.forecasts.findIndex(
      (f) =>
        f.source === record.source &&
        f.product_id === record.product_id &&
        f.horizon_days === record.horizon_days
    );
    if (idx >= 0) {
      this.data.forecasts[idx] = record;
    } else {
      this.data.forecasts.unshift(record);
    }
    this.save();
  }

  public getForecasts(filter?: { source?: string; product_id?: string | null }): ForecastRecord[] {
    if (!this.data.forecasts) return [];
    let list = [...this.data.forecasts];
    if (filter?.source && filter.source !== 'ALL SOURCES' && filter.source !== 'All') {
      list = list.filter((f) => f.source === filter.source);
    }
    if (filter?.product_id !== undefined) {
      list = list.filter((f) => f.product_id === filter.product_id);
    }
    return list;
  }

  public saveAnomalies(records: AnomalyRecord[]): void {
    if (!this.data.anomalies) this.data.anomalies = [];
    records.forEach((rec) => {
      const idx = this.data.anomalies!.findIndex((a) => a.anomaly_id === rec.anomaly_id);
      if (idx >= 0) {
        rec.acknowledged = this.data.anomalies![idx].acknowledged;
        this.data.anomalies![idx] = rec;
      } else {
        this.data.anomalies!.unshift(rec);
      }
    });
    this.save();
  }

  public getAnomalies(filter?: { source?: string; metric?: string; severity?: string }): AnomalyRecord[] {
    if (!this.data.anomalies) return [];
    let list = [...this.data.anomalies];
    if (filter?.source && filter.source !== 'ALL SOURCES' && filter.source !== 'All') {
      list = list.filter((a) => a.source === filter.source);
    }
    if (filter?.metric) {
      list = list.filter((a) => a.metric === filter.metric);
    }
    if (filter?.severity) {
      list = list.filter((a) => a.severity === filter.severity);
    }
    return list;
  }

  public acknowledgeAnomaly(anomalyId: string): boolean {
    if (!this.data.anomalies) return false;
    const item = this.data.anomalies.find((a) => a.anomaly_id === anomalyId);
    if (item) {
      item.acknowledged = true;
      this.save();
      return true;
    }
    return false;
  }

  public saveInventoryRecommendations(records: InventoryRecommendation[]): void {
    this.data.inventory_recommendations = records;
    this.save();
  }

  public getInventoryRecommendations(source?: string): InventoryRecommendation[] {
    if (!this.data.inventory_recommendations) return [];
    if (source && source !== 'ALL SOURCES' && source !== 'All') {
      return this.data.inventory_recommendations.filter((r) => r.source === source);
    }
    return this.data.inventory_recommendations;
  }

  public recordPipelineAudit(entry: Omit<PipelineAuditEntry, 'audit_id' | 'timestamp'>): PipelineAuditEntry {
    if (!this.data.pipeline_audit) this.data.pipeline_audit = [];
    if (!this.data.pipeline_counters) this.data.pipeline_counters = {};

    const auditEntry: PipelineAuditEntry = {
      audit_id: `AUD-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.data.pipeline_audit.unshift(auditEntry);
    if (this.data.pipeline_audit.length > 500) {
      this.data.pipeline_audit.pop();
    }

    // Update counters for source and ALL
    const sourcesToUpdate = [entry.source, 'ALL'];
    for (const src of sourcesToUpdate) {
      if (!this.data.pipeline_counters[src]) {
        this.data.pipeline_counters[src] = {
          total_processed: 0,
          records_accepted: 0,
          records_rejected: 0,
          records_deduplicated: 0,
          validation_errors: 0,
          last_successful_ingestion: null,
          last_failed_ingestion: null
        };
      }
      const c = this.data.pipeline_counters[src];
      c.total_processed += 1;
      if (entry.status === 'ACCEPTED') {
        c.records_accepted += 1;
        c.last_successful_ingestion = auditEntry.timestamp;
      } else if (entry.status === 'DEDUPLICATED') {
        c.records_deduplicated += 1;
      } else if (entry.status === 'REJECTED') {
        c.records_rejected += 1;
        c.validation_errors += 1;
        c.last_failed_ingestion = auditEntry.timestamp;
      }
    }

    this.save();
    return auditEntry;
  }

  public getPipelineAudit(limit = 100, source?: string): PipelineAuditEntry[] {
    if (!this.data.pipeline_audit) return [];
    let list = this.data.pipeline_audit;
    if (source && source !== 'ALL SOURCES' && source !== 'All') {
      list = list.filter((a) => a.source === source);
    }
    return list.slice(0, limit);
  }

  public getPipelineCounters(source?: string): PipelineCounters {
    const key = (source && source !== 'ALL SOURCES' && source !== 'All') ? source : 'ALL';
    if (this.data.pipeline_counters && this.data.pipeline_counters[key]) {
      return this.data.pipeline_counters[key];
    }
    return {
      total_processed: 0,
      records_accepted: 0,
      records_rejected: 0,
      records_deduplicated: 0,
      validation_errors: 0,
      last_successful_ingestion: null,
      last_failed_ingestion: null
    };
  }

  public saveScenario(scenario: SimulatorScenario): void {
    if (!this.data.scenarios) this.data.scenarios = [];
    const idx = this.data.scenarios.findIndex((s) => s.id === scenario.id);
    if (idx >= 0) {
      this.data.scenarios[idx] = scenario;
    } else {
      this.data.scenarios.unshift(scenario);
    }
    this.save();
  }

  public getScenarios(): SimulatorScenario[] {
    return this.data.scenarios || [];
  }

  public deleteScenario(id: string): boolean {
    if (!this.data.scenarios) return false;
    const initialLen = this.data.scenarios.length;
    this.data.scenarios = this.data.scenarios.filter((s) => s.id !== id);
    if (this.data.scenarios.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new JSONDatabase();

