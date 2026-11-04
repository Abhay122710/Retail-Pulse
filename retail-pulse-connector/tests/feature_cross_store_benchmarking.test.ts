import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { BenchmarkController } from '../src/controllers/benchmark.controller.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_f7.json');

function createMockReqRes() {
  const req: any = { headers: {} };
  const res: any = {
    statusCode: 200,
    bodyData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.bodyData = data;
      return this;
    }
  };
  return { req, res };
}

describe('Feature 7: Cross-Store Benchmarking Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();

    const now = new Date().toISOString();
    // Ingest ShopPulse dataset
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-BENCH-1',
      total_amount: 3000,
      quantity: 2,
      category: 'Audio',
      product_id: 'SP-P1',
      product_name: 'SoundPulse Earbuds',
      timestamp: now
    });
    // Ingest cancelled order in ShopPulse
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-BENCH-CANCELLED',
      total_amount: 1000,
      quantity: 1,
      category: 'Audio',
      timestamp: now
    });
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CANCELLED',
      order_id: 'SP-BENCH-CANCELLED',
      timestamp: now
    });

    // Ingest TechMart dataset
    EventService.processEvent({
      source: 'TechMart',
      event_type: 'ORDER_CREATED',
      transaction_id: 'TM-BENCH-1',
      net_value: 5000,
      gross_value: 5500,
      units: 1,
      department: 'Laptops',
      sku: 'TM-SKU-LAP1',
      product_name: 'Gaming Pro Laptop',
      timestamp: now
    });
  });

  after(() => {
    db.loadDatabaseFile(path.resolve(process.cwd(), 'data', 'retail_pulse.json'));
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  });

  it('F7-T1: Benchmark endpoint returns side-by-side metrics for ShopPulse and TechMart', () => {
    const { req, res } = createMockReqRes();
    BenchmarkController.getBenchmark(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.bodyData.success, true);
    assert.ok(res.bodyData.stores.ShopPulse);
    assert.ok(res.bodyData.stores.TechMart);
    assert.strictEqual(res.bodyData.normalization_standards.currency, 'INR (₹)');
  });

  it('F7-T2: Net Revenue and active orders reconcile with cancellation deductions', () => {
    const { req, res } = createMockReqRes();
    BenchmarkController.getBenchmark(req, res);

    const sp = res.bodyData.stores.ShopPulse;
    const tm = res.bodyData.stores.TechMart;

    // ShopPulse had 3000 valid + 1000 cancelled = net 3000
    assert.strictEqual(sp.net_revenue, 3000);
    assert.strictEqual(sp.gross_revenue, 4000);
    assert.strictEqual(sp.active_orders_count, 1);
    assert.strictEqual(sp.cancelled_or_refunded_count, 1);
    assert.strictEqual(sp.cancellation_rate_pct, 50); // 1 of 2 orders cancelled

    // TechMart had 5000 net
    assert.strictEqual(tm.net_revenue, 5000);
    assert.strictEqual(tm.active_orders_count, 1);
    assert.strictEqual(tm.cancellation_rate_pct, 0);
  });

  it('F7-T3: Comparative timeline has aligned dates for both stores', () => {
    const { req, res } = createMockReqRes();
    BenchmarkController.getBenchmark(req, res);

    const timeline = res.bodyData.comparative_timeline;
    assert.ok(Array.isArray(timeline));
    assert.ok(timeline.length > 0);
    for (const point of timeline) {
      assert.ok(typeof point.date === 'string');
      assert.ok(typeof point.shoppulse_revenue === 'number');
      assert.ok(typeof point.techmart_revenue === 'number');
      assert.strictEqual(point.total_revenue, point.shoppulse_revenue + point.techmart_revenue);
    }
  });

  it('F7-T4: Comparison summary accurately identifies leading store and deltas', () => {
    const { req, res } = createMockReqRes();
    BenchmarkController.getBenchmark(req, res);

    const summary = res.bodyData.comparison_summary;
    assert.strictEqual(summary.total_combined_net_revenue, 8000);
    assert.strictEqual(summary.total_combined_active_orders, 2);
    assert.strictEqual(summary.revenue_leading_store, 'TechMart');
    assert.strictEqual(summary.revenue_difference_amount, 2000);
  });
});
