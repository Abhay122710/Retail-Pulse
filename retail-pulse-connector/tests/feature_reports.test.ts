import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { ReportController } from '../src/controllers/report.controller.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_f6.json');

function createMockReqRes(query: any = {}) {
  const req: any = { query, headers: {} };
  const res: any = {
    statusCode: 200,
    bodyData: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.bodyData = data;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    send(content: any) {
      this.bodyData = content;
      return this;
    }
  };
  return { req, res };
}

describe('Feature 6: Automated Business Reports Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();

    const now = new Date().toISOString();

    // 1. Ingest valid completed order on ShopPulse
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-REP-1',
      product_id: 'P-PREM-1',
      product_name: 'Premium "Wireless, Noise-Cancelling" Headphones', // Contains quotes and comma for CSV escape test
      category: 'Audio',
      quantity: 2,
      unit_price: 300,
      total_amount: 600,
      timestamp: now
    });

    // 2. Ingest another completed order on TechMart
    EventService.processEvent({
      source: 'TechMart',
      event_type: 'CHECKOUT_COMPLETED',
      order_id: 'ORD-REP-2',
      product_id: 'P-PREM-2',
      product_name: 'Gaming Monitor 4K',
      category: 'Displays',
      quantity: 1,
      unit_price: 750,
      total_amount: 750,
      timestamp: now
    });

    // 3. Ingest cancelled order on ShopPulse
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CANCELLED',
      order_id: 'ORD-REP-CANCEL',
      product_id: 'P-PREM-1',
      total_amount: 300,
      timestamp: now
    });
  });

  after(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    if (fs.existsSync(`${TEST_DB_PATH}.bak`)) fs.unlinkSync(`${TEST_DB_PATH}.bak`);
  });

  it('F6-T1: Executive Report compiles verified KPIs reconciling Gross Revenue, Net Revenue, and Cancellations', () => {
    const { req, res } = createMockReqRes();
    ReportController.getExecutiveReport(req, res);

    assert.strictEqual(res.statusCode, 200);
    const data = res.bodyData.data;

    assert(data.report_id.startsWith('REP-EXEC-'));
    assert(data.reporting_period.days_analyzed === 30);

    // Gross Revenue = $600 + $750 = $1350
    assert.strictEqual(data.executive_summary.total_gross_revenue, 1350);
    // Net Revenue = $1350 - $300 = $1050
    assert.strictEqual(data.executive_summary.net_revenue, 1050);
    // Total Orders = 2 completed
    assert.strictEqual(data.executive_summary.total_orders_placed, 2);
    // Cancelled Orders = 1
    assert.strictEqual(data.executive_summary.cancelled_orders, 1);
    // Cancellation Rate = (1 / 2) * 100 = 50%
    assert.strictEqual(data.executive_summary.cancellation_rate_pct, 50.0);

    // Top products
    assert(data.top_products.length >= 2);
    assert.strictEqual(data.top_products[0].gross_revenue, 750); // Gaming Monitor leads with 750
  });

  it('F6-T2: Report produces evidenced recommendations with factual claims', () => {
    const { req, res } = createMockReqRes();
    ReportController.getExecutiveReport(req, res);

    const data = res.bodyData.data;
    assert(data.evidenced_recommendations.length >= 1);

    // High cancellation rate recommendation triggered
    const cancelRec = data.evidenced_recommendations.find((r: any) => r.category === 'Revenue Protection');
    assert(cancelRec);
    assert.strictEqual(cancelRec.priority, 'HIGH');
    assert(cancelRec.evidence.includes('50.0%'));
  });

  it('F6-T3: CSV export adheres to RFC 4180 with quotes and comma escaping', () => {
    const { req, res } = createMockReqRes({ section: 'products' });
    ReportController.exportCsv(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['Content-Type'], 'text/csv; charset=utf-8');
    assert(res.headers['Content-Disposition'].includes('retailpulse_products_'));

    const csvLines = res.bodyData.split('\n');
    assert.strictEqual(csvLines[0], 'Product ID,Product Name,Category,Units Sold,Gross Revenue ($)');

    // Verify row with quotes and commas was escaped properly ("" inside quotes)
    const escapedRow = csvLines.find((l: string) => l.includes('Wireless, Noise-Cancelling'));
    assert(escapedRow);
    assert(escapedRow.includes('""Wireless, Noise-Cancelling""'));
  });

  it('F6-T4: Report filters isolate source data accurately', () => {
    const { req, res } = createMockReqRes({ source: 'TechMart' });
    ReportController.getExecutiveReport(req, res);

    const data = res.bodyData.data;
    assert.strictEqual(data.reporting_period.source, 'TechMart');
    assert.strictEqual(data.executive_summary.total_gross_revenue, 750);
    assert.strictEqual(data.executive_summary.cancelled_orders, 0);
  });
});
