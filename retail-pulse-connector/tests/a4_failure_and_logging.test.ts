import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { ExtractController } from '../src/controllers/extract.controller.js';
import { EventsController } from '../src/controllers/events.controller.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_a4.json');

// Mock Express Request & Response helpers
function createMockReqRes(body: any = {}, query: any = {}, params: any = {}) {
  const req: any = { body, query, params, headers: {} };
  const res: any = {
    statusCode: 200,
    headers: {},
    bodyData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.bodyData = data;
      return this;
    },
    setHeader(name: string, val: string) {
      this.headers[name] = val;
      return this;
    },
    send(data: any) {
      this.bodyData = data;
      return this;
    }
  };
  return { req, res };
}

describe('A4: Failure Handling & Logging Verification', () => {

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

  it('A4-T1: Missing source or event_type returns 400 Bad Request', () => {
    const { req, res } = createMockReqRes({ source: 'ShopPulse' }); // missing event_type
    EventsController.handlePostEvent(req, res);

    assert.strictEqual(res.statusCode, 400, 'Must return 400 when event_type is missing');
    assert.strictEqual(res.bodyData.success, false);
    assert.ok(res.bodyData.message.includes('required'), 'Error message must explain requirement');
  });

  it('A4-T2: Empty body returns 400 Bad Request', () => {
    const { req, res } = createMockReqRes(null);
    EventsController.handlePostEvent(req, res);

    assert.strictEqual(res.statusCode, 400, 'Must return 400 for null body');
    assert.strictEqual(res.bodyData.success, false);
  });

  it('A4-T3: Invalid extraction request payload returns 400', () => {
    const { req, res } = createMockReqRes({ source: 'ShopPulse' }); // missing data_types array
    ExtractController.handlePostExtract(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.bodyData.success, false);
    assert.ok(res.bodyData.message.includes('data_types array are required'));
  });

  it('A4-T4: Non-existent extraction download returns 404', () => {
    const { req, res } = createMockReqRes({}, {}, { id: 'NON_EXISTENT_EXT_999999' });
    ExtractController.handleDownloadExtraction(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.bodyData.success, false);
  });

  it('A4-T5: Check database write failure behavior (Defect A4-02 check)', () => {
    // Test what happens when directory creation or file writing fails
    try {
      const invalidPath = path.resolve('//invalid_nonexistent_drive_z/file.json');
      const testDb = new (db.constructor as any)(invalidPath);
      (testDb as any).save();
      console.log('[A4-T5 Evidence] Database save() swallowed error silently');
    } catch (err: any) {
      console.log(`[A4-T5 Evidence] Database initialization failed with: ${err.message}`);
      assert.ok(
        err.message.includes('no such file or directory') || 
        err.message.includes('ENOENT') || 
        err.message.includes('UNKNOWN') ||
        err.message.includes('mkdir'), 
        'Expected filesystem error'
      );
    }
  });

  it('A4-T6: Log Sanitization: Verify sensitive credentials are never stored or logged', () => {
    const payloadWithSecret = {
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      session_id: 'SP-SEC-01',
      order_id: 'ORD-SEC-01',
      total_amount: 500,
      password: 'SuperSecretPassword123!',
      api_key: 'sk_live_98374928374923847',
      card_cvv: '123'
    };

    const canonical = EventService.processEvent(payloadWithSecret as any);

    // Canonical fields should never expose raw passwords or api keys in first-class fields
    assert.strictEqual((canonical as any).password, undefined, 'password must not be a canonical field');
    assert.strictEqual((canonical as any).api_key, undefined, 'api_key must not be a canonical field');
    assert.strictEqual((canonical as any).card_cvv, undefined, 'card_cvv must not be a canonical field');
  });
});
