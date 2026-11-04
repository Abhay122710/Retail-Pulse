import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { InventoryEngine } from '../src/predictive/inventoryEngine.js';
import { CanonicalEvent } from '../src/models/types.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_p2.json');

describe('P2: Inventory Optimization & Reorder Recommendations Verification', () => {
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

  it('P2-T1: All inventory items strictly labeled as DEMO_ESTIMATED (never claimed live)', () => {
    const items = InventoryEngine.getInventoryItems('ShopPulse');
    assert.ok(items.length > 0);
    items.forEach((item) => {
      assert.strictEqual(
        item.stock_data_source,
        'DEMO_ESTIMATED',
        'Inventory source must be DEMO_ESTIMATED'
      );
      assert.ok(item.current_stock >= 0, 'Stock cannot be negative');
      assert.ok(item.supplier_lead_time_days > 0, 'Lead time must be positive');
    });
  });

  it('P2-T2: Zero stock triggers CRITICAL stockout risk and IMMEDIATE urgency', () => {
    // Product P106 has initial_stock 0 in catalog
    const recommendations = InventoryEngine.generateRecommendations('ShopPulse');
    const p106Rec = recommendations.find((r) => r.product_id === 'P106');

    assert.ok(p106Rec, 'Product P106 recommendation must exist');
    assert.strictEqual(p106Rec.current_stock, 0);
    assert.strictEqual(p106Rec.stockout_risk_level, 'CRITICAL');
    assert.strictEqual(p106Rec.urgency, 'IMMEDIATE');
    assert.strictEqual(p106Rec.stockout_risk_percentage, 100);
    assert.ok(p106Rec.suggested_reorder_qty > 0, 'Must recommend non-zero reorder quantity');
    assert.ok(p106Rec.explanation.includes('Stockout detected'));
  });

  it('P2-T3: Inventory above Reorder Point suggests 0 reorder quantity and LOW risk', () => {
    // Product P104 has initial_stock 50, lead time 3 days
    const recommendations = InventoryEngine.generateRecommendations('ShopPulse');
    const p104Rec = recommendations.find((r) => r.product_id === 'P104');

    assert.ok(p104Rec);
    assert.ok(p104Rec.current_stock > p104Rec.reorder_point);
    assert.strictEqual(p104Rec.suggested_reorder_qty, 0);
    assert.strictEqual(p104Rec.stockout_risk_level, 'LOW');
    assert.strictEqual(p104Rec.urgency, 'ADEQUATE');
    assert.ok(p104Rec.explanation.includes('healthy'));
  });

  it('P2-T4: Deterministic Safety Stock and Reorder Point calculations', () => {
    const recommendations = InventoryEngine.generateRecommendations('TechMart');
    recommendations.forEach((rec) => {
      // ROP = ceil(LTD + SS)
      assert.ok(
        rec.reorder_point >= Math.ceil(rec.expected_demand_lead_time + rec.safety_stock) - 1,
        'ROP must cover LTD + SS'
      );
      assert.ok(rec.safety_stock > 0, 'Safety stock must be non-zero');
      assert.ok(rec.assumptions.length >= 4, 'Must provide full list of documented assumptions');
      assert.ok(
        rec.assumptions.some((a) => a.includes('Z-factor = 1.65')),
        'Must document Z-factor assumption'
      );
    });
  });

  it('P2-T5: Historical sales dynamically reduce available inventory', () => {
    // Ingest 5 sales of P102 (initial stock 45)
    for (let i = 0; i < 5; i++) {
      db.insertEvent({
        event_id: `EVT-SALE-P102-${i}`,
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: `2026-10-10T12:0${i}:00Z`,
        session_id: `SES-P102-${i}`,
        user_id: null,
        canonical_user_id: null,
        product_id: 'P102',
        canonical_product_id: null,
        product_name: 'BoomBox X Portable Bluetooth Speaker',
        category: 'Electronics',
        order_id: `ORD-P102-${i}`,
        canonical_transaction_id: `SP-ORD-P102-${i}`,
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 1199,
        total_amount: 1199,
        cart_value: null,
        item_count: 1,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      });
    }

    const items = InventoryEngine.getInventoryItems('ShopPulse');
    const p102 = items.find((i) => i.product_id === 'P102');
    assert.ok(p102);
    assert.strictEqual(p102.current_stock, 40, 'Available stock must be reduced by 5 units sold');
  });
});
