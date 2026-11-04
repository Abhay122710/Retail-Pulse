import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { SegmentationController } from '../src/controllers/segmentation.controller.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_f5.json');

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

describe('Feature 5: Sales Segmentation & Cohort Analysis Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();

    // 1. Ingest repeat customer orders (User C100 with 3 orders across Sep and Oct)
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-C100-1',
      user_id: 'C100',
      product_id: 'PROD-A',
      product_name: 'Flagship Laptop',
      category: 'Electronics',
      quantity: 1,
      unit_price: 1200,
      total_amount: 1200,
      timestamp: '2026-09-05T10:00:00Z'
    });

    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-C100-2',
      user_id: 'C100',
      product_id: 'PROD-B',
      product_name: 'Wireless Mouse',
      category: 'Accessories',
      quantity: 2,
      unit_price: 35,
      total_amount: 70,
      timestamp: '2026-09-20T14:00:00Z'
    });

    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-C100-3',
      user_id: 'C100',
      product_id: 'PROD-C',
      product_name: 'USB-C Cable',
      category: 'Accessories',
      quantity: 1,
      unit_price: 15,
      total_amount: 15,
      timestamp: '2026-10-02T11:00:00Z'
    });

    // 2. Ingest one-time customer (User C200 with 1 order in Oct)
    EventService.processEvent({
      source: 'TechMart',
      event_type: 'CHECKOUT_COMPLETED',
      order_id: 'ORD-C200-1',
      user_id: 'C200',
      product_id: 'PROD-A',
      product_name: 'Flagship Laptop',
      category: 'Electronics',
      quantity: 1,
      unit_price: 1200,
      total_amount: 1200,
      timestamp: '2026-10-10T09:00:00Z'
    });

    // 3. Ingest guest checkout order with NO customer key
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-GUEST-1',
      user_id: undefined, // no user id
      product_id: 'PROD-D',
      product_name: 'Keyboard Cover',
      category: 'Accessories',
      quantity: 1,
      unit_price: 10,
      total_amount: 10,
      timestamp: '2026-10-12T15:00:00Z'
    });
  });

  after(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    if (fs.existsSync(`${TEST_DB_PATH}.bak`)) fs.unlinkSync(`${TEST_DB_PATH}.bak`);
  });

  it('F5-T1: Customer Repeat and Cohort Analysis correctly computes metrics without fabricating guest IDs', () => {
    const { req, res } = createMockReqRes();
    SegmentationController.getSegmentation(req, res);

    assert.strictEqual(res.statusCode, 200);
    const data = res.bodyData.data;

    // Only C100 and C200 are identified users; GUEST order must not create a fabricated user
    assert.strictEqual(data.customer_segmentation.status, 'IDENTIFIED_DATA_AVAILABLE');
    assert.strictEqual(data.customer_segmentation.identified_customers_count, 2);
    assert.strictEqual(data.customer_segmentation.repeat_customers_count, 1); // C100 has 3 orders
    assert.strictEqual(data.customer_segmentation.one_time_customers_count, 1); // C200 has 1 order
    assert.strictEqual(data.customer_segmentation.repeat_purchase_rate_pct, 50.0);

    // Verify average purchase interval for C100 (diff between Sep 5, Sep 20, Oct 2)
    assert(data.customer_segmentation.avg_purchase_interval_days > 0);

    // Verify cohort retention
    const cohorts = data.customer_segmentation.cohorts;
    assert(cohorts.length >= 1);
    const sepCohort = cohorts.find((c: any) => c.cohort_month === '2026-09');
    assert(sepCohort);
    assert.strictEqual(sepCohort.initial_customers, 1);
  });

  it('F5-T2: Product ABC Pareto correctly groups high revenue products into Class A', () => {
    const { req, res } = createMockReqRes();
    SegmentationController.getSegmentation(req, res);

    const data = res.bodyData.data;
    const abc = data.product_abc_pareto;

    assert(abc.items.length >= 3);
    // Flagship Laptop has $1200 on ShopPulse and $1200 on TechMart
    const laptopItem = abc.items.find((i: any) => i.product_name === 'Flagship Laptop');
    assert(laptopItem);
    assert.strictEqual(laptopItem.abc_class, 'A');
    assert(abc.summary.class_a.product_count >= 1);
    assert(abc.summary.class_a.revenue_share_pct >= 40);
  });

  it('F5-T3: Price Band segmentation correctly groups products across price tiers', () => {
    const { req, res } = createMockReqRes();
    SegmentationController.getSegmentation(req, res);

    const data = res.bodyData.data;
    const bands = data.price_band_segmentation;

    assert.strictEqual(bands.length, 4);

    const ultraBand = bands.find((b: any) => b.band_name === 'Ultra / High-Ticket');
    assert(ultraBand);
    assert.strictEqual(ultraBand.product_count, 2); // 1 ShopPulse Laptop + 1 TechMart Laptop
    assert.strictEqual(ultraBand.units_sold, 2);
    assert.strictEqual(ultraBand.gross_revenue, 2400);

    const budgetBand = bands.find((b: any) => b.band_name === 'Budget Tier');
    assert(budgetBand);
    assert(budgetBand.units_sold >= 4); // Mouse, Cable, Keyboard Cover
  });

  it('F5-T4: Demand Velocity and source filtering work accurately', () => {
    const { req, res } = createMockReqRes({ source: 'ShopPulse' });
    SegmentationController.getSegmentation(req, res);

    const data = res.bodyData.data;
    assert.strictEqual(data.filters.source, 'ShopPulse');
    // ShopPulse has 4 orders (C100's 3 orders + GUEST-1)
    assert.strictEqual(data.total_order_events_analyzed, 4);
    assert(data.demand_velocity.length === 3);
  });
});
