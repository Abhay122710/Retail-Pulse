import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { 
  DETERMINISTIC_SHOPPULSE_EVENTS, 
  DETERMINISTIC_TECHMART_EVENTS,
  EXPECTED_KPI_RESULTS 
} from './fixtures/deterministicData.js';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { InsightService } from '../src/services/insightService.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_a3.json');

describe('A3: KPI Calculations & Verification Against Deterministic Fixtures', () => {

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

  it('A3-T1: Behavior on empty database returns true zeros without fabricated baselines', () => {
    // Before ingesting any data, query insights for ShopPulse
    const emptySpInsights = InsightService.getInsights('ShopPulse');
    console.log(`[A3-T1 Evidence] Empty DB ShopPulse Revenue: ${emptySpInsights.totalRevenue}`);
    console.log(`[A3-T1 Evidence] Empty DB ShopPulse Orders: ${emptySpInsights.totalOrdersOrTx}`);
    console.log(`[A3-T1 Evidence] Empty DB Cart Abandonment: ${emptySpInsights.abandonmentRate}`);
    console.log(`[A3-T1 Evidence] Empty DB Conversion Rate: ${emptySpInsights.conversionRate}`);

    // Verify system reports genuine zeros, not fabricated numbers
    assert.strictEqual(emptySpInsights.totalRevenue, '₹0', 'Revenue must be ₹0 for empty DB');
    assert.strictEqual(emptySpInsights.totalOrdersOrTx, '0', 'Orders count must be 0 for empty DB');
    assert.strictEqual(emptySpInsights.abandonmentRate, '0%', 'Abandonment must be 0% for empty DB');
    assert.strictEqual(emptySpInsights.conversionRate, '0%', 'Conversion rate must be 0% for empty DB');
  });

  it('A3-T2: Ingest deterministic dataset and verify ShopPulse Net Revenue with cancellations deducted', () => {
    // Ingest ShopPulse fixtures
    DETERMINISTIC_SHOPPULSE_EVENTS.forEach(evt => EventService.processEvent(evt));

    const spInsights = InsightService.getInsights('ShopPulse');

    console.log(`[A3-T2 Evidence] ShopPulse Actual Total Revenue (Net): ${spInsights.totalRevenue}`);
    console.log(`[A3-T2 Evidence] ShopPulse Gross Revenue: ${spInsights.grossRevenue}`);
    console.log(`[A3-T2 Evidence] ShopPulse Actual Orders (Net): ${spInsights.totalOrdersOrTx}`);
    console.log(`[A3-T2 Evidence] ShopPulse Cancelled Orders: ${spInsights.cancelledOrders}`);
    console.log(`[A3-T2 Evidence] ShopPulse Actual Avg Dwell: ${spInsights.avgDwellSeconds}s`);

    // Expected values from fixture:
    // Gross revenue: 3000 + 5000 = 8000 (₹8.0k)
    // Net revenue (cancellation deducted): 3000 (₹3.0k)
    assert.strictEqual(spInsights.totalRevenue, '₹3.0k', 'Net revenue must be ₹3.0k after deducting ORD-SP-1002 (₹5000 cancelled)');
    assert.strictEqual(spInsights.grossRevenue, '₹8.0k', 'Gross revenue must be ₹8.0k before cancellations');
    assert.strictEqual(spInsights.totalOrdersOrTx, '1', 'Net active orders count must be 1 after deducting cancelled order');
    assert.strictEqual(spInsights.cancelledOrders, 1, 'Cancelled orders count must be 1');
    assert.strictEqual(spInsights.avgDwellSeconds, 45, 'ShopPulse dwell time must match average (45s)');
  });

  it('A3-T3: Ingest deterministic TechMart dataset and compare KPIs', () => {
    // Ingest TechMart fixtures
    DETERMINISTIC_TECHMART_EVENTS.forEach(evt => EventService.processEvent(evt));

    const tmInsights = InsightService.getInsights('TechMart');

    console.log(`[A3-T3 Evidence] TechMart Actual Total Revenue: ${tmInsights.totalRevenue}`);
    console.log(`[A3-T3 Evidence] TechMart Actual Orders: ${tmInsights.totalOrdersOrTx}`);
    console.log(`[A3-T3 Evidence] TechMart Actual Abandonment: ${tmInsights.abandonmentRate}`);
    console.log(`[A3-T3 Evidence] TechMart Actual Conversion: ${tmInsights.conversionRate}`);
    console.log(`[A3-T3 Evidence] TechMart Actual Avg Dwell: ${tmInsights.avgDwellSeconds}s`);

    // Expected for TechMart:
    // Revenue: 45000 (₹45.0k)
    // Orders: 1
    // Dwell: 50s
    assert.strictEqual(tmInsights.totalRevenue, '₹45.0k', 'TechMart revenue must match 45.0k');
    assert.strictEqual(tmInsights.totalOrdersOrTx, '1', 'TechMart completed orders must match 1');
    assert.strictEqual(tmInsights.avgDwellSeconds, 50, 'TechMart dwell seconds must match 50');
  });

  it('A3-T4: Combined cross-store metrics (ALL SOURCES)', () => {
    const combinedInsights = InsightService.getInsights('ALL SOURCES');

    console.log(`[A3-T4 Evidence] Combined Actual Revenue (Net): ${combinedInsights.totalRevenue}`);
    console.log(`[A3-T4 Evidence] Combined Gross Revenue: ${combinedInsights.grossRevenue}`);
    console.log(`[A3-T4 Evidence] Combined Actual Orders: ${combinedInsights.totalOrdersOrTx}`);
    console.log(`[A3-T4 Evidence] Combined Actual Avg Dwell: ${combinedInsights.avgDwellSeconds}s`);

    // Net revenue: 3000 (SP) + 45000 (TM) = 48000 -> ₹48.0k
    assert.strictEqual(combinedInsights.totalRevenue, '₹48.0k', 'Combined net revenue must equal ₹48.0k');
    assert.strictEqual(combinedInsights.grossRevenue, '₹53.0k', 'Combined gross revenue must equal ₹53.0k');
    assert.strictEqual(combinedInsights.totalOrdersOrTx, '2', 'Combined active orders must equal 2');
    assert.strictEqual(combinedInsights.avgDwellSeconds, 46, 'Combined dwell time should match average of duration events (46s)');
  });

  it('A3-T5: Funnel step counts verification against actual events without artificial floors', () => {
    const insights = InsightService.getInsights('ALL SOURCES');
    const funnel = insights.funnel || [];

    console.log('[A3-T5 Evidence] Funnel steps:', funnel);
    const productViewStep = funnel.find(s => s.step === 'Product Views');
    assert.ok(productViewStep, 'Product Views step must exist');
    console.log(`[A3-T5 Evidence] Actual Product Views in DB: 4, Funnel reported: ${productViewStep.count}`);
    // Assert actual count is reported, NOT 10000
    assert.strictEqual(productViewStep.count, 4, 'Funnel product views count must match actual DB events count (4)');

    const cartStep = funnel.find(s => s.step === 'Add to Cart');
    assert.ok(cartStep);
    assert.strictEqual(cartStep.count, 4, 'Funnel cart additions count must match actual DB events count (4)');

    const orderStep = funnel.find(s => s.step === 'Order Completed');
    assert.ok(orderStep);
    assert.strictEqual(orderStep.count, 2, 'Funnel completed orders count must match net active orders (2)');
  });
});
