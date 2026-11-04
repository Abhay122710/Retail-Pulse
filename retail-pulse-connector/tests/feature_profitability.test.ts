import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { ProfitabilityController } from '../src/controllers/profitability.controller.js';
import { KNOWN_CATALOG_COSTS } from '../src/services/profitabilityService.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_f2.json');

function createMockReqRes(query: any = {}) {
  const req: any = { query, headers: {} };
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

describe('Feature 2: Product Profitability & Margin Analytics Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();

    const now = new Date().toISOString();

    // 1. Ingest Product P101 (SoundPulse Headphones: unit_price=2500, unit_cost=1650)
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-PROF-1',
      product_id: 'P101',
      product_name: 'SoundPulse Pro Wireless Headphones',
      category: 'Electronics',
      quantity: 2,
      unit_price: 2500,
      total_amount: 5000,
      timestamp: now
    });

    // 2. Ingest Cancelled Order for P101
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-PROF-CANCELLED',
      product_id: 'P101',
      total_amount: 2500,
      quantity: 1,
      category: 'Electronics',
      timestamp: now
    });
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CANCELLED',
      order_id: 'SP-PROF-CANCELLED',
      timestamp: now
    });

    // 3. Ingest Product without catalog cost (Uncosted item)
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-PROF-UNCOSTED',
      product_id: 'CUSTOM-UNKNOWN-ITEM',
      product_name: 'Custom Uncosted Promotional Gift',
      category: 'Promotions',
      quantity: 1,
      unit_price: 800,
      total_amount: 800,
      timestamp: now
    });
  });

  after(() => {
    db.loadDatabaseFile(path.resolve(process.cwd(), 'data', 'retail_pulse.json'));
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  });

  it('F2-T1: Calculates exact product-level Gross Profit and Gross Margin for costed items', () => {
    const { req, res } = createMockReqRes();
    ProfitabilityController.getProfitability(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.bodyData.success, true);

    const p101 = res.bodyData.products.find((p: any) => p.product_id === 'P101');
    assert.ok(p101);
    assert.strictEqual(p101.cost_available, true);
    assert.strictEqual(p101.unit_cost, KNOWN_CATALOG_COSTS['P101'].unit_cost); // 1650

    // Net units sold = 2 (1 was cancelled)
    assert.strictEqual(p101.units_sold, 2);
    assert.strictEqual(p101.net_revenue, 5000);

    // COGS = 2 * 1650 = 3300
    assert.strictEqual(p101.total_cogs, 3300);

    // Gross Profit = 5000 - 3300 = 1700
    assert.strictEqual(p101.gross_profit, 1700);

    // Gross Margin % = (1700 / 5000) * 100 = 34%
    assert.strictEqual(p101.gross_margin_pct, 34);
  });

  it('F2-T2: Cancellations are deducted and do not incur Cost of Goods Sold (COGS)', () => {
    const { req, res } = createMockReqRes();
    ProfitabilityController.getProfitability(req, res);

    const p101 = res.bodyData.products.find((p: any) => p.product_id === 'P101');
    assert.strictEqual(p101.gross_revenue, 7500); // 5000 + 2500
    assert.strictEqual(p101.net_revenue, 5000); // 2500 cancelled deducted
    assert.strictEqual(p101.total_cogs, 3300); // Only 2 delivered units incurred cost
  });

  it('F2-T3: Items without verified catalog cost are strictly labeled COST_UNAVAILABLE without fabricated profit', () => {
    const { req, res } = createMockReqRes();
    ProfitabilityController.getProfitability(req, res);

    const uncosted = res.bodyData.products.find((p: any) => p.product_id === 'CUSTOM-UNKNOWN-ITEM');
    assert.ok(uncosted);
    assert.strictEqual(uncosted.cost_available, false);
    assert.strictEqual(uncosted.unit_cost, null);
    assert.strictEqual(uncosted.total_cogs, null);
    assert.strictEqual(uncosted.gross_profit, null);
    assert.strictEqual(uncosted.gross_margin_pct, null);
    assert.strictEqual(uncosted.performance_classification, 'COST_UNAVAILABLE');
  });

  it('F2-T4: Category profitability reflects aggregated cost coverage and margins', () => {
    const { req, res } = createMockReqRes();
    ProfitabilityController.getProfitability(req, res);

    const elec = res.bodyData.category_profitability.find((c: any) => c.category === 'Electronics');
    assert.ok(elec);
    assert.strictEqual(elec.net_revenue, 5000);
    assert.strictEqual(elec.gross_profit, 1700);
    assert.strictEqual(elec.gross_margin_pct, 34);
    assert.strictEqual(elec.cost_coverage_pct, 100);

    const promo = res.bodyData.category_profitability.find((c: any) => c.category === 'Promotions');
    assert.ok(promo);
    assert.strictEqual(promo.cost_coverage_pct, 0);
    assert.strictEqual(promo.gross_profit, null);
  });
});
