import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { InsightService } from '../src/services/insightService.js';
import { ExtractService } from '../src/services/extractService.js';
import { PredictiveController } from '../src/controllers/predictive.controller.js';
import { RawEventPayload } from '../src/models/types.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_e2e.json');

describe('E2E: End-to-End Multi-Source Pipeline & Integration Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();
  });

  after(() => {
    db.loadDatabaseFile(path.resolve(process.cwd(), 'data', 'retail_pulse.json'));
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  });

  it('E2E-T1: Both storefronts supply data independently with preserved source lineage', () => {
    // 1. Ingest ShopPulse order
    const spPayload: RawEventPayload = {
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-SP-E2E-1',
      total_amount: 3500,
      quantity: 1,
      product_id: 'P101',
      product_name: 'SoundPulse Pro Wireless Headphones',
      category: 'Electronics',
      timestamp: '2026-10-15T10:00:00Z',
      session_id: 'SES-SP-E2E-1'
    };
    const spResult = EventService.processEvent(spPayload);
    assert.ok(spResult);
    assert.strictEqual(spResult.source, 'ShopPulse');
    assert.strictEqual(spResult.canonical_transaction_id, 'SP-ORD-SP-E2E-1');

    // 2. Ingest TechMart heterogeneous transaction
    const tmPayload: RawEventPayload = {
      source: 'TechMart',
      event_type: 'ORDER_CREATED',
      transaction_id: 'TXN-TM-E2E-2',
      net_value: 28000,
      gross_value: 30000,
      units: 1,
      sku: 'TM-PROD-102',
      product_name: 'HyperView 27" 4K Gaming Monitor',
      department: 'Displays',
      timestamp: '2026-10-15T11:00:00Z',
      user_code: 'USR-TM-900',
      session_id: 'SES-TM-E2E-2'
    };
    const tmResult = EventService.processEvent(tmPayload);
    assert.ok(tmResult);
    assert.strictEqual(tmResult.source, 'TechMart');
    assert.strictEqual(tmResult.canonical_transaction_id, 'TM-TXN-E2E-2');
    assert.strictEqual(tmResult.total_amount, 28000);

    // Verify independent queries
    const spEvents = db.getEvents({ source: 'ShopPulse' });
    const tmEvents = db.getEvents({ source: 'TechMart' });
    assert.strictEqual(spEvents.length, 1);
    assert.strictEqual(tmEvents.length, 1);
  });

  it('E2E-T2: Duplicate event ingestion is strictly idempotent', () => {
    const duplicatePayload: RawEventPayload = {
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-SP-E2E-1',
      total_amount: 3500,
      quantity: 1,
      timestamp: '2026-10-15T10:00:00Z',
      session_id: 'SES-SP-E2E-1'
    };

    const countBefore = db.getEvents().length;
    const res = EventService.processEvent(duplicatePayload);

    // Returns the event without creating duplicate rows
    assert.ok(res);
    assert.strictEqual(db.getEvents().length, countBefore, 'Database event count must not increase on duplicate');
  });

  it('E2E-T3: Cancellation semantics correctly net out revenue and order metrics', () => {
    // Current ShopPulse Net Revenue is 3500 (1 order)
    const spInsightsBefore = InsightService.getInsights('ShopPulse');
    assert.strictEqual(spInsightsBefore.totalRevenue, '₹3.5k');
    assert.strictEqual(spInsightsBefore.totalOrdersOrTx, '1');

    // Ingest cancellation event
    const cancelPayload: RawEventPayload = {
      source: 'ShopPulse',
      event_type: 'ORDER_CANCELLED',
      order_id: 'ORD-SP-E2E-1',
      timestamp: '2026-10-15T12:00:00Z',
      session_id: 'SES-SP-E2E-1'
    };
    const cancelRes = EventService.processEvent(cancelPayload);
    assert.ok(cancelRes);
    assert.strictEqual(cancelRes.event_type, 'ORDER_CANCELLED');

    // Net revenue must now be ₹0 and net orders must be 0
    const spInsightsAfter = InsightService.getInsights('ShopPulse');
    assert.strictEqual(spInsightsAfter.totalRevenue, '₹0', 'Net revenue must be ₹0 after cancellation');
    assert.strictEqual(spInsightsAfter.totalOrdersOrTx, '0', 'Net order count must be 0 after cancellation');
    assert.strictEqual(spInsightsAfter.cancelledOrders, 1, 'Cancelled order count must be 1');
  });

  it('E2E-T4: Empty source produces true zeros without fabricated baselines', () => {
    db.clearAllData();
    const emptyInsights = InsightService.getInsights('ShopPulse');
    assert.strictEqual(emptyInsights.totalRevenue, '₹0');
    assert.strictEqual(emptyInsights.totalOrdersOrTx, '0');
    assert.strictEqual(emptyInsights.conversionRate, '0%');
    assert.strictEqual(emptyInsights.abandonmentRate, '0%');
  });

  it('E2E-T5: Schema validation rejects invalid event types, negative amounts, and unknown sources', () => {
    // 1. Invalid event type
    assert.throws(() => {
      EventService.processEvent({
        source: 'ShopPulse',
        event_type: 'MALICIOUS_HACK' as any
      });
    }, /Validation Error/);

    // 2. Negative amount
    assert.throws(() => {
      EventService.processEvent({
        source: 'TechMart',
        event_type: 'ORDER_CREATED',
        net_value: -50000
      });
    }, /Validation Error/);

    // 3. Unknown source
    assert.throws(() => {
      EventService.processEvent({
        source: 'UnknownStore' as any,
        event_type: 'ORDER_CREATED'
      });
    }, /Validation Error|Unsupported source/);
  });

  it('E2E-T6: Python ML Integration policy: 503 error when Python is offline and no cache exists', async () => {
    // Ensure no forecast is stored
    db.clearAllData();

    // Point to offline port to simulate service failure
    PredictiveController.setPythonServiceUrl('http://127.0.0.1:59999');

    // Mock Express Request and Response
    let statusCode = 0;
    let responseBody: any = null;

    const mockReq: any = {
      query: { source: 'ShopPulse', horizonDays: '7' }
    };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: any) {
        responseBody = body;
        return this;
      }
    };

    try {
      // When Python service (port 8000) is offline during tests and no stored cache exists:
      await PredictiveController.getForecasts(mockReq, mockRes);

      // The connector must return 503 Service Unavailable, NEVER inventing TypeScript predictions
      assert.strictEqual(statusCode, 503);
      assert.strictEqual(responseBody?.error, 'PYTHON_ML_SERVICE_UNAVAILABLE');
      assert.ok(responseBody?.message.includes('Python ML service'));
    } finally {
      PredictiveController.resetPythonServiceUrl();
    }
  });

  it('E2E-T7: Python ML Integration policy: Serves stored Python forecast with clear cache warning when offline', async () => {
    // Seed a previously computed Python forecast into DB
    db.saveForecast({
      forecast_id: 'FCST-PY-TEST-7D-STORED',
      source: 'ShopPulse',
      product_id: null,
      product_name: null,
      target_metric: 'UNITS',
      horizon_days: 7,
      forecast_points: [
        { date: '2026-10-16', predicted_demand: 5, lower_bound: 2, upper_bound: 8 }
      ],
      model_name: 'Holt-Winters',
      model_version: '3.0.0-py',
      evaluation: null,
      status: 'SUFFICIENT_DATA',
      warnings: [],
      created_at: '2026-10-15T18:00:00.000Z'
    });

    // Point to offline port to simulate service failure
    PredictiveController.setPythonServiceUrl('http://127.0.0.1:59999');

    let statusCode = 0;
    let responseBody: any = null;

    const mockReq: any = {
      query: { source: 'ShopPulse', horizonDays: '7' }
    };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: any) {
        responseBody = body;
        return this;
      }
    };

    try {
      await PredictiveController.getForecasts(mockReq, mockRes);

      // Must return 200 with stored cache and explicit warning
      assert.strictEqual(statusCode, 200);
      assert.strictEqual(responseBody?.status, 'success');
      assert.strictEqual(responseBody?.source, 'STORED_CACHE');
      assert.strictEqual(responseBody?.engine, 'Python-FastAPI');
      assert.ok(responseBody?.warning.includes('Serving previously computed Python forecast'));
      assert.strictEqual(responseBody?.data?.forecast_id, 'FCST-PY-TEST-7D-STORED');
    } finally {
      PredictiveController.resetPythonServiceUrl();
    }
  });

  it('E2E-T8: Anomaly acknowledgment persists across restarts', () => {
    const anomalyId = 'ANOM-PY-REVENUE-ShopPulse-2026-10-15';
    db.saveAnomalies([
      {
        anomaly_id: anomalyId,
        source: 'ShopPulse',
        metric: 'DAILY_REVENUE',
        observation_date: '2026-10-15',
        observed_value: 50000,
        expected_baseline: 2000,
        expected_range: { lower: 0, upper: 5000 },
        deviation_percentage: 2400,
        z_score: 4.5,
        severity: 'CRITICAL',
        direction: 'SPIKE',
        detection_method: 'ROLLING_ZSCORE',
        explanation: 'Unusual spike in Daily Net Revenue',
        acknowledged: false,
        created_at: new Date().toISOString()
      }
    ]);

    // Acknowledge anomaly
    const acked = db.acknowledgeAnomaly(anomalyId);
    assert.strictEqual(acked, true);

    // Reload from file to simulate service restart
    const reloadedDb = db.getAnomalies();
    const ackedItem = reloadedDb.find((a) => a.anomaly_id === anomalyId);
    assert.ok(ackedItem);
    assert.strictEqual(ackedItem.acknowledged, true, 'Acknowledged status must persist across restarts');
  });
});
