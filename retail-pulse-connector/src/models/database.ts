import fs from 'fs';
import path from 'path';
import { 
  CanonicalEvent, 
  SourceRecord, 
  ExtractionRecord, 
  SessionRecord, 
  SourceId 
} from './types.js';

interface DatabaseSchema {
  events: CanonicalEvent[];
  sources: SourceRecord[];
  extractions: ExtractionRecord[];
  sessions: SessionRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'retail_pulse.json');

class JSONDatabase {
  private data: DatabaseSchema = {
    events: [],
    sources: [],
    extractions: [],
    sessions: []
  };

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[DB] Database loaded successfully from ${DB_FILE}`);
      } catch (err) {
        console.error('[DB] Failed to load database file, initializing fresh database.', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
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

  public insertEvent(event: CanonicalEvent): void {
    this.data.events.unshift(event); // Newest first

    // Update source status and event count
    const srcIndex = this.data.sources.findIndex((s) => s.source_id === event.source);
    if (srcIndex >= 0) {
      this.data.sources[srcIndex].status = 'Connected';
      this.data.sources[srcIndex].last_seen = event.timestamp;
      this.data.sources[srcIndex].event_count += 1;
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
}

export const db = new JSONDatabase();
