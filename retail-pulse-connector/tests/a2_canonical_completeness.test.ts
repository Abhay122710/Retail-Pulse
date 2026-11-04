import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ShopPulseAdapter } from '../src/adapters/ShopPulseAdapter.js';
import { TechMartAdapter } from '../src/adapters/TechMartAdapter.js';
import { EventService } from '../src/services/eventService.js';

describe('A2: Canonical Event Completeness & Normalization Verification', () => {

  it('A2-T1: Valid ShopPulse payload normalizes completely to canonical schema', () => {
    const rawShopPulse = {
      source: 'ShopPulse',
      source_type: 'ecommerce',
      event_type: 'ORDER_CREATED',
      session_id: 'SP-SESSION-123',
      user_id: 'C-789',
      order_id: 'ORD-10099',
      product_id: 'PROD-456',
      product_name: 'Wireless Noise Cancelling Earbuds',
      category: 'Electronics',
      quantity: 2,
      unit_price: 3499,
      total_amount: 6998,
      payment_method: 'UPI',
      timestamp: '2026-10-15T10:00:00.000Z'
    };

    const canonical = ShopPulseAdapter.normalize(rawShopPulse);

    assert.ok(canonical.event_id, 'event_id must be generated');
    assert.strictEqual(canonical.source, 'ShopPulse');
    assert.strictEqual(canonical.event_type, 'ORDER_CREATED');
    assert.strictEqual(canonical.session_id, 'SP-SESSION-123');
    assert.strictEqual(canonical.user_id, 'C-789');
    assert.strictEqual(canonical.canonical_user_id, 'SP-USER-C-789');
    assert.strictEqual(canonical.product_id, 'PROD-456');
    assert.strictEqual(canonical.canonical_product_id, 'SP-PROD-456');
    assert.strictEqual(canonical.product_name, 'Wireless Noise Cancelling Earbuds');
    assert.strictEqual(canonical.category, 'Electronics');
    assert.strictEqual(canonical.order_id, 'ORD-10099');
    assert.strictEqual(canonical.quantity, 2);
    assert.strictEqual(canonical.unit_price, 3499);
    assert.strictEqual(canonical.total_amount, 6998);
    assert.strictEqual(canonical.payment_method, 'UPI');
    assert.strictEqual(canonical.timestamp, '2026-10-15T10:00:00.000Z');
    assert.ok(canonical.payload, 'Original payload must be preserved in payload field');
  });

  it('A2-T2: Valid TechMart payload maps heterogeneous fields to canonical schema', () => {
    const rawTechMart = {
      source: 'TechMart',
      source_type: 'ecommerce',
      event_type: 'ORDER_CREATED',
      session_id: 'TM-SESSION-456',
      user_code: 'TM-USR-88',
      transaction_id: 'TXN-TM-771',
      sku: 'TM-SKU-900',
      item_title: 'ASUS ROG Strix Gaming Laptop',
      department: 'Gaming',
      units: 1,
      unit_price: 145000,
      net_value: 145000,
      payment_channel: 'Credit Card',
      timestamp: '2026-10-15T11:00:00.000Z'
    };

    const canonical = TechMartAdapter.normalize(rawTechMart);

    assert.ok(canonical.event_id, 'event_id must be generated');
    assert.strictEqual(canonical.source, 'TechMart');
    assert.strictEqual(canonical.event_type, 'ORDER_CREATED');
    assert.strictEqual(canonical.session_id, 'TM-SESSION-456');
    // Field mapping: user_code -> user_id & canonical_user_id
    assert.strictEqual(canonical.user_id, 'TM-USR-88');
    assert.strictEqual(canonical.canonical_user_id, 'TM-USER-TM-USR-88');
    // Field mapping: sku -> product_id & canonical_product_id
    assert.strictEqual(canonical.product_id, 'TM-SKU-900');
    assert.strictEqual(canonical.canonical_product_id, 'TM-SKU-900');
    // Field mapping: item_title -> product_name
    assert.strictEqual(canonical.product_name, 'ASUS ROG Strix Gaming Laptop');
    // Field mapping: department -> category
    assert.strictEqual(canonical.category, 'Gaming');
    // Field mapping: transaction_id -> order_id & canonical_transaction_id
    assert.strictEqual(canonical.order_id, 'TXN-TM-771');
    assert.strictEqual(canonical.canonical_transaction_id, 'TM-TXN-771');
    // Field mapping: units -> quantity
    assert.strictEqual(canonical.quantity, 1);
    // Field mapping: net_value -> total_amount
    assert.strictEqual(canonical.total_amount, 145000);
    // Field mapping: payment_channel -> payment_method
    assert.strictEqual(canonical.payment_method, 'Credit Card');
  });

  it('A2-T3: Null and missing optional fields are handled without runtime crashes', () => {
    const minimalPayload = {
      source: 'ShopPulse',
      event_type: 'PAGE_VIEW'
    };

    const canonical = ShopPulseAdapter.normalize(minimalPayload);

    assert.strictEqual(canonical.product_id, null);
    assert.strictEqual(canonical.order_id, null);
    assert.strictEqual(canonical.user_id, null);
    assert.strictEqual(canonical.search_query, null);
    assert.strictEqual(canonical.results_count, null);
    assert.strictEqual(canonical.total_amount, null);
    assert.ok(canonical.session_id, 'A session_id must be assigned if missing');
    assert.ok(canonical.timestamp, 'A timestamp must be generated if missing');
  });

  it('A2-T4: Both storefronts produce identical canonical interface', () => {
    const spEvent = ShopPulseAdapter.normalize({
      source: 'ShopPulse',
      event_type: 'SEARCH',
      search_query: 'mechanical keyboard',
      results_count: 5
    });

    const tmEvent = TechMartAdapter.normalize({
      source: 'TechMart',
      event_type: 'SEARCH',
      search_query: 'mechanical keyboard',
      results_count: 5
    });

    const expectedKeys = [
      'event_id', 'source', 'source_type', 'event_type', 'session_id',
      'user_id', 'canonical_user_id', 'product_id', 'canonical_product_id',
      'product_name', 'category', 'order_id', 'canonical_transaction_id',
      'search_query', 'results_count', 'view_duration_seconds', 'quantity',
      'unit_price', 'total_amount', 'cart_value', 'item_count', 'rating',
      'payment_method', 'timestamp', 'payload', 'created_at'
    ];

    for (const key of expectedKeys) {
      assert.ok(key in spEvent, `Key ${key} must exist in ShopPulse canonical event`);
      assert.ok(key in tmEvent, `Key ${key} must exist in TechMart canonical event`);
      assert.strictEqual(typeof (spEvent as any)[key], typeof (tmEvent as any)[key], `Type of ${key} must match across adapters`);
    }
  });

  it('A2-T5: Schema validation rejects invalid event types with explicit error', () => {
    const invalidTypePayload = {
      source: 'ShopPulse',
      event_type: 'INVALID_NON_EXISTENT_TYPE_123',
      session_id: 'TEST-SESS'
    };

    assert.throws(
      () => EventService.processEvent(invalidTypePayload as any),
      /Unsupported event_type/,
      'Must reject unsupported event_type with explicit validation error'
    );
  });

  it('A2-T6: Schema validation rejects unsupported sources with explicit error', () => {
    const unknownSourcePayload = {
      source: 'MaliciousUnknownStore',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-999'
    };

    assert.throws(
      () => EventService.processEvent(unknownSourcePayload as any),
      /Unsupported source/,
      'Must reject unsupported source without silently defaulting to ShopPulse'
    );
  });

  it('A2-T7: Schema validation rejects negative amounts and quantities', () => {
    const negativePricePayload = {
      source: 'TechMart',
      event_type: 'ORDER_CREATED',
      order_id: 'TXN-TM-999',
      net_value: -50000,
      units: -10
    };

    assert.throws(
      () => EventService.processEvent(negativePricePayload as any),
      /cannot be negative/,
      'Must reject negative numeric values'
    );
  });

  it('A2-T8: Idempotent canonical identifier prefixes without duplication', () => {
    const spWithPrefix = ShopPulseAdapter.normalize({
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      order_id: 'ORD-9999'
    });
    console.log(`[A2-T8 Evidence] ShopPulse canonical_transaction_id: ${spWithPrefix.canonical_transaction_id}`);
    assert.strictEqual(spWithPrefix.canonical_transaction_id, 'SP-ORD-9999', 'Prefix must not be duplicated as SP-ORD-ORD-9999');

    const tmWithPrefix = TechMartAdapter.normalize({
      source: 'TechMart',
      event_type: 'ORDER_CREATED',
      transaction_id: 'TXN-TM-8888'
    });
    console.log(`[A2-T8 Evidence] TechMart canonical_transaction_id: ${tmWithPrefix.canonical_transaction_id}`);
    assert.strictEqual(tmWithPrefix.canonical_transaction_id, 'TM-TXN-8888', 'Prefix must not be duplicated as TM-TXN-TXN-TM-8888');
  });
});
