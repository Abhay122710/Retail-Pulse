import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { ReportService } from '../src/services/reportService.js';
import { ReportController } from '../src/controllers/report.controller.js';
import { AIController } from '../src/controllers/ai.controller.js';
import { SchemaValidator } from '../src/utils/validator.js';
import { sanitizePayload, Logger } from '../src/utils/logger.js';
import { createRateLimiter, securityHeaders, resetRateLimitStore } from '../src/middleware/security.middleware.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_security.json');

function createMockReqRes(options: {
  query?: any;
  body?: any;
  headers?: any;
  ip?: string;
} = {}) {
  const req: any = {
    query: options.query || {},
    body: options.body || {},
    headers: options.headers || {},
    socket: { remoteAddress: options.ip || '127.0.0.1' }
  };

  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    bodyData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.bodyData = data;
      return this;
    },
    send(data: any) {
      this.bodyData = data;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    }
  };

  return { req, res };
}

describe('RetailPulse Cybersecurity Audit & Security Hardening Verification Suite', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();
  });

  after(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    if (fs.existsSync(`${TEST_DB_PATH}.bak`)) fs.unlinkSync(`${TEST_DB_PATH}.bak`);
    resetRateLimitStore();
  });

  // --------------------------------------------------------------------------
  // SEC-01: CSV Formula Injection Defense (CWE-1236)
  // --------------------------------------------------------------------------
  it('SEC-01: Neutralizes CSV formula injection triggers (=, +, -, @, \\t, \\r)', () => {
    // Ingest a product with an intentional Excel formula payload in its title
    EventService.processEvent({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-SEC-CSV-1',
      product_id: 'P-EXPLOIT-1',
      product_name: '=cmd|\' /C calc\'!A0',
      category: '+cmd|calc',
      quantity: 1,
      unit_price: 150,
      total_amount: 150,
      timestamp: new Date().toISOString()
    });

    const csvOutput = ReportService.exportCsv('products', 'ShopPulse');
    const lines = csvOutput.split('\n');

    // Find the exported row for this product
    const maliciousRow = lines.find((l) => l.includes('calc'));
    assert(maliciousRow, 'Product with payload should be in CSV output');

    // Assert that the leading formula trigger '=' is prefixed with single-quote "'"
    assert(
      maliciousRow.includes("\"'=cmd|'"),
      `CSV cell must be neutralized with leading single quote. Received: ${maliciousRow}`
    );
    assert(
      maliciousRow.includes("\"'+cmd|calc\""),
      `Category starting with + must be neutralized with leading single quote. Received: ${maliciousRow}`
    );
  });

  // --------------------------------------------------------------------------
  // SEC-02: HTTP Security Headers Enforcement (OWASP Best Practices)
  // --------------------------------------------------------------------------
  it('SEC-02: Sets strict OWASP HTTP security headers on all responses', () => {
    const { req, res } = createMockReqRes();
    let nextCalled = false;

    securityHeaders(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.headers['X-Content-Type-Options'], 'nosniff');
    assert.strictEqual(res.headers['X-Frame-Options'], 'DENY');
    assert.strictEqual(res.headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
    assert.strictEqual(res.headers['X-XSS-Protection'], '1; mode=block');
    assert(res.headers['Content-Security-Policy'].includes("frame-ancestors 'none'"));
  });

  // --------------------------------------------------------------------------
  // SEC-03: In-Memory Rate Limiting & Resource Abuse Protection
  // --------------------------------------------------------------------------
  it('SEC-03: Rate limiter enforces request thresholds and returns HTTP 429 when exceeded', () => {
    resetRateLimitStore();
    const testIp = '192.168.10.55';
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 3,
      skipInTests: false
    });

    // Requests 1, 2, 3 should be accepted
    for (let i = 1; i <= 3; i++) {
      const { req, res } = createMockReqRes({ ip: testIp });
      let called = false;
      limiter(req, res, () => {
        called = true;
      });
      assert.strictEqual(called, true, `Request ${i} should be allowed`);
      assert.strictEqual(res.headers['RateLimit-Limit'], '3');
      assert.strictEqual(res.headers['RateLimit-Remaining'], String(3 - i));
    }

    // Request 4 should be throttled with HTTP 429
    const { req, res } = createMockReqRes({ ip: testIp });
    let fourthCalled = false;
    limiter(req, res, () => {
      fourthCalled = true;
    });

    assert.strictEqual(fourthCalled, false, 'Request 4 must be throttled');
    assert.strictEqual(res.statusCode, 429);
    assert.strictEqual(res.bodyData.error_category, 'RATE_LIMIT_EXCEEDED');
    assert(Number(res.headers['Retry-After']) >= 1);
  });

  // --------------------------------------------------------------------------
  // SEC-04: Non-Finite & Extreme Input Ingestion Defense
  // --------------------------------------------------------------------------
  it('SEC-04: SchemaValidator strictly rejects Infinity, NaN, and excessive string lengths', () => {
    // 1. Infinity in total_amount
    const infResult = SchemaValidator.validate({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-VALID-1',
      total_amount: Infinity
    });
    assert.strictEqual(infResult.isValid, false);
    assert(infResult.errors.some((e) => e.includes('valid finite number')));

    // 2. Negative value
    const negResult = SchemaValidator.validate({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-VALID-2',
      total_amount: -50
    });
    assert.strictEqual(negResult.isValid, false);
    assert(negResult.errors.some((e) => e.includes('cannot be negative')));

    // 3. Excessively long order_id (> 128 characters)
    const longId = 'A'.repeat(200);
    const lenResult = SchemaValidator.validate({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: longId,
      total_amount: 100
    });
    assert.strictEqual(lenResult.isValid, false);
    assert(lenResult.errors.some((e) => e.includes('exceeds maximum permitted length')));
  });

  // --------------------------------------------------------------------------
  // SEC-05: AI Assistant Gateway Input Bounds & Validation
  // --------------------------------------------------------------------------
  it('SEC-05: AIController enforces query length limits and rejects malformed conversation histories', async () => {
    // 1. Oversized query (> 1000 characters)
    const { req: req1, res: res1 } = createMockReqRes({
      body: { query: 'A'.repeat(1001) }
    });
    await AIController.handleChat(req1, res1);
    assert.strictEqual(res1.statusCode, 400);
    assert.strictEqual(res1.bodyData.error_category, 'VALIDATION_ERROR');

    // 2. Non-array conversation history
    const { req: req2, res: res2 } = createMockReqRes({
      body: { query: 'Valid query', conversation_history: 'NotAnArray' }
    });
    await AIController.handleChat(req2, res2);
    assert.strictEqual(res2.statusCode, 400);
    assert.strictEqual(res2.bodyData.error_category, 'VALIDATION_ERROR');

    // 3. Conversation history item exceeding 2000 characters
    const { req: req3, res: res3 } = createMockReqRes({
      body: {
        query: 'Valid query',
        conversation_history: [{ role: 'user', content: 'B'.repeat(2500) }]
      }
    });
    await AIController.handleChat(req3, res3);
    assert.strictEqual(res3.statusCode, 400);
    assert.strictEqual(res3.bodyData.error_category, 'VALIDATION_ERROR');
  });

  // --------------------------------------------------------------------------
  // SEC-06: Atomic Database Persistence & Backup Integrity
  // --------------------------------------------------------------------------
  it('SEC-06: Atomic persistence maintains valid data and generates backup file', () => {
    // Trigger multiple insertions
    for (let i = 1; i <= 5; i++) {
      EventService.processEvent({
        source: 'ShopPulse',
        event_type: 'PRODUCT_VIEW',
        product_id: `PROD-ATOMIC-${i}`,
        timestamp: new Date().toISOString()
      });
    }

    // Verify target file exists and is valid JSON
    assert(fs.existsSync(TEST_DB_PATH), 'Target DB file must exist');
    const content = JSON.parse(fs.readFileSync(TEST_DB_PATH, 'utf-8'));
    assert(Array.isArray(content.events));
    assert(content.events.length >= 5);

    // Verify backup copy was created
    assert(fs.existsSync(`${TEST_DB_PATH}.bak`), 'Backup DB copy must exist');
    const bakContent = JSON.parse(fs.readFileSync(`${TEST_DB_PATH}.bak`, 'utf-8'));
    assert(Array.isArray(bakContent.events));
  });

  // --------------------------------------------------------------------------
  // SEC-07: Sensitive Data Redaction in Logging
  // --------------------------------------------------------------------------
  it('SEC-07: Structured logger redacts credentials, credit cards, and tokens', () => {
    const rawPayload = {
      user: 'admin',
      password: 'SuperSecretPassword!',
      token: 'jwt.token.here',
      credit_card: '4111-2222-3333-4444',
      api_key: 'rp_live_secret_key_12345',
      safe_metric: 42
    };

    const sanitized = sanitizePayload(rawPayload);

    assert.strictEqual(sanitized.user, 'admin');
    assert.strictEqual(sanitized.safe_metric, 42);
    assert.strictEqual(sanitized.password, '***REDACTED***');
    assert.strictEqual(sanitized.token, '***REDACTED***');
    assert.strictEqual(sanitized.credit_card, '***REDACTED***');
    assert.strictEqual(sanitized.api_key, '***REDACTED***');
  });
});
