import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { AnomalyEngine } from '../src/predictive/anomalyEngine.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_p3.json');

describe('P3: Anomaly Detection Verification', () => {
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

  it('P3-T1: Insufficient observations (< 4 days) returns empty array without false positives', () => {
    const anomalies = AnomalyEngine.detectAnomalies('ShopPulse');
    assert.strictEqual(anomalies.length, 0);
  });

  it('P3-T2: Sudden revenue spike triggers CRITICAL or WARNING anomaly alert', () => {
    // Populate 7 days of normal daily revenue (~2000)
    for (let day = 1; day <= 7; day++) {
      const dStr = String(day).padStart(2, '0');
      db.insertEvent({
        event_id: `EVT-ANOM-BASE-${day}`,
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: `2026-10-${dStr}T10:00:00Z`,
        session_id: `SES-BASE-${day}`,
        user_id: null,
        canonical_user_id: null,
        product_id: 'P101',
        canonical_product_id: null,
        product_name: 'SoundPulse Pro Wireless Headphones',
        category: 'Electronics',
        order_id: `ORD-BASE-${day}`,
        canonical_transaction_id: `SP-ORD-BASE-${day}`,
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 2000,
        total_amount: 2000,
        cart_value: null,
        item_count: 1,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      });
    }

    // Day 8: Massive spike to ₹45,000
    db.insertEvent({
      event_id: 'EVT-ANOM-SPIKE',
      source: 'ShopPulse',
      source_type: 'ecommerce',
      event_type: 'ORDER_CREATED',
      timestamp: '2026-10-08T10:00:00Z',
      session_id: 'SES-SPIKE-8',
      user_id: null,
      canonical_user_id: null,
      product_id: 'P101',
      canonical_product_id: null,
      product_name: 'SoundPulse Pro Wireless Headphones',
      category: 'Electronics',
      order_id: 'ORD-SPIKE',
      canonical_transaction_id: 'SP-ORD-SPIKE',
      search_query: null,
      results_count: null,
      view_duration_seconds: null,
      quantity: 15,
      unit_price: 3000,
      total_amount: 45000,
      cart_value: null,
      item_count: 15,
      rating: null,
      payment_method: null,
      payload: '{}',
      created_at: new Date().toISOString()
    });

    const anomalies = AnomalyEngine.detectAnomalies('ShopPulse');
    assert.ok(anomalies.length > 0, 'Must detect at least one anomaly');

    const spike = anomalies.find((a) => a.observation_date === '2026-10-08' && a.metric === 'DAILY_REVENUE');
    assert.ok(spike, 'Must detect revenue spike on Oct 08');
    assert.strictEqual(spike.direction, 'SPIKE');
    assert.ok(spike.severity === 'CRITICAL' || spike.severity === 'WARNING');
    assert.ok(spike.observed_value >= 40000);
    assert.ok(spike.explanation.includes('Unusual spike'));
  });

  it('P3-T3: Deterministic deduplicated alert IDs prevent duplicate alert flooding', () => {
    const run1 = AnomalyEngine.detectAnomalies('ShopPulse');
    const run2 = AnomalyEngine.detectAnomalies('ShopPulse');

    const ids1 = run1.map((a) => a.anomaly_id);
    const ids2 = run2.map((a) => a.anomaly_id);

    assert.deepStrictEqual(ids1, ids2, 'Anomaly IDs must be identical across repeated evaluations');
  });

  it('P3-T4: Anomaly acknowledgment workflow persists in database', () => {
    const anomalies = AnomalyEngine.detectAnomalies('ShopPulse');
    assert.ok(anomalies.length > 0);

    db.saveAnomalies(anomalies);
    const targetId = anomalies[0].anomaly_id;

    assert.strictEqual(anomalies[0].acknowledged, false);

    const ackSuccess = db.acknowledgeAnomaly(targetId);
    assert.strictEqual(ackSuccess, true);

    const saved = db.getAnomalies();
    const ackedItem = saved.find((a) => a.anomaly_id === targetId);
    assert.ok(ackedItem);
    assert.strictEqual(ackedItem.acknowledged, true);
  });
});
