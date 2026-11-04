import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { PipelineController } from '../src/controllers/pipeline.controller.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_f4.json');

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

describe('Feature 4: Data Quality & Pipeline Monitoring Verification', () => {
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

  it('F4-T1: Baseline pipeline monitoring returns valid schema on empty store', async () => {
    const { req, res } = createMockReqRes();
    await PipelineController.getPipelineMonitoring(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.bodyData.success, true);
    assert.ok(Array.isArray(res.bodyData.sources));
    assert.strictEqual(res.bodyData.sources.length, 2);
    assert.ok(res.bodyData.data_quality);
    assert.ok(typeof res.bodyData.data_quality.overall_quality_score === 'number');
    assert.ok(Array.isArray(res.bodyData.recent_activity));
    assert.strictEqual(res.bodyData.system_health.connector_status, 'HEALTHY');
  });

  it('F4-T2: Ingesting valid events updates accepted counts and freshness', async () => {
    // Ingest valid ShopPulse event
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-MON-001',
      total_amount: 1500,
      quantity: 1,
      payment_method: 'UPI',
      timestamp: new Date().toISOString()
    }, 'TEST-CORR-1');

    const { req, res } = createMockReqRes();
    await PipelineController.getPipelineMonitoring(req, res);

    assert.strictEqual(res.statusCode, 200);
    const spSource = res.bodyData.sources.find((s: any) => s.source_id === 'ShopPulse');
    assert.ok(spSource);
    assert.strictEqual(spSource.status, 'Healthy');
    assert.strictEqual(spSource.records_accepted, 1);
    assert.strictEqual(spSource.records_rejected, 0);
    assert.ok(spSource.freshness_label.includes('Active'));
  });

  it('F4-T3: Deduplication is accurately recorded in pipeline audit and counters', async () => {
    // Ingest duplicate event
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'SP-MON-001',
      total_amount: 1500,
      quantity: 1,
      timestamp: new Date().toISOString()
    }, 'TEST-CORR-2');

    const { req, res } = createMockReqRes();
    await PipelineController.getPipelineMonitoring(req, res);

    const spSource = res.bodyData.sources.find((s: any) => s.source_id === 'ShopPulse');
    assert.strictEqual(spSource.records_deduplicated, 1);
    assert.ok(spSource.duplicate_rate_percentage > 0);

    const recentDup = res.bodyData.recent_activity.find((a: any) => a.status === 'DEDUPLICATED');
    assert.ok(recentDup);
    assert.strictEqual(recentDup.source, 'ShopPulse');
  });

  it('F4-T4: Validation failures update rejected counts and error summary', async () => {
    try {
      EventService.processEvent({
        source: 'ShopPulse',
        event_type: 'ORDER_CREATED',
        // missing order_id triggers validation error
        total_amount: -500 // negative amount triggers validation error
      }, 'TEST-CORR-3');
    } catch {
      // Expected rejection
    }

    const { req, res } = createMockReqRes();
    await PipelineController.getPipelineMonitoring(req, res);

    const spSource = res.bodyData.sources.find((s: any) => s.source_id === 'ShopPulse');
    assert.strictEqual(spSource.records_rejected, 1);

    const summary = res.bodyData.data_quality.validation_failure_summary;
    assert.ok(summary.length > 0);
    assert.ok(summary.some((s: any) => s.category.includes('negative')));
  });

  it('F4-T5: Filter by source isolates source-specific monitoring data', async () => {
    const { req, res } = createMockReqRes({ source: 'TechMart' });
    await PipelineController.getPipelineMonitoring(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.bodyData.sources.length, 1);
    assert.strictEqual(res.bodyData.sources[0].source_id, 'TechMart');
  });
});
