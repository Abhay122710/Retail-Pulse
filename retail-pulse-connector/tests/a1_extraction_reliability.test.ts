import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { 
  DETERMINISTIC_SHOPPULSE_EVENTS, 
  DETERMINISTIC_TECHMART_EVENTS 
} from './fixtures/deterministicData.js';
import { db } from '../src/models/database.js';
import { EventService } from '../src/services/eventService.js';
import { ExtractionService } from '../src/services/extractionService.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_a1.json');

describe('A1: Extraction Reliability & Ingestion Verification', () => {

  before(() => {
    // Switch to isolated test DB and clear
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();
  });

  after(() => {
    // Restore primary DB path and clean up test file
    db.loadDatabaseFile(path.resolve(process.cwd(), 'data', 'retail_pulse.json'));
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  });

  it('A1-T1: First successful extraction from ShopPulse and TechMart', () => {
    // Ingest deterministic ShopPulse events
    const spIngested = DETERMINISTIC_SHOPPULSE_EVENTS.map(evt => EventService.processEvent(evt));
    assert.strictEqual(spIngested.length, DETERMINISTIC_SHOPPULSE_EVENTS.length, 'All ShopPulse events should be processed');

    // Ingest deterministic TechMart events
    const tmIngested = DETERMINISTIC_TECHMART_EVENTS.map(evt => EventService.processEvent(evt));
    assert.strictEqual(tmIngested.length, DETERMINISTIC_TECHMART_EVENTS.length, 'All TechMart events should be processed');

    // Run extraction for ShopPulse
    const spExtraction = ExtractionService.runExtraction({
      source: 'ShopPulse',
      data_types: ['Orders', 'Products', 'Live Telemetry']
    });

    assert.strictEqual(spExtraction.status, 'SUCCESS');
    assert.strictEqual(spExtraction.records_extracted, DETERMINISTIC_SHOPPULSE_EVENTS.length, 'ShopPulse extracted records count must match');
    assert.ok(spExtraction.extraction_id.startsWith('EXT-'), 'Extraction ID must be formatted properly');

    // Run extraction for TechMart
    const tmExtraction = ExtractionService.runExtraction({
      source: 'TechMart',
      data_types: ['Orders', 'Products', 'Live Telemetry']
    });

    assert.strictEqual(tmExtraction.status, 'SUCCESS');
    assert.strictEqual(tmExtraction.records_extracted, DETERMINISTIC_TECHMART_EVENTS.length, 'TechMart extracted records count must match');

    // Run extraction for ALL SOURCES
    const allExtraction = ExtractionService.runExtraction({
      source: 'ALL SOURCES',
      data_types: ['Live Telemetry & Clickbaits', 'Transactions, Cart & Orders']
    });

    assert.strictEqual(allExtraction.records_extracted, DETERMINISTIC_SHOPPULSE_EVENTS.length + DETERMINISTIC_TECHMART_EVENTS.length, 'All sources count must be reconciled');
  });

  it('A1-T2: Second identical extraction with unchanged source data', () => {
    const initialEventsCount = db.getEvents().length;

    // Run extraction again without adding new events
    const secondExtraction = ExtractionService.runExtraction({
      source: 'ALL SOURCES',
      data_types: ['Live Telemetry & Clickbaits']
    });

    assert.strictEqual(secondExtraction.status, 'SUCCESS');
    assert.strictEqual(secondExtraction.records_extracted, initialEventsCount, 'Record count extracted should be identical on repeated run');
    assert.strictEqual(db.getEvents().length, initialEventsCount, 'Underlying events count in database must not change or introduce unintended duplicates');
  });

  it('A1-T3: Extraction with additional source records', () => {
    const previousCount = db.getEvents({ source: 'ShopPulse' }).length;

    // Ingest 2 new legitimate ShopPulse events
    const newEvent1 = {
      source: 'ShopPulse',
      event_type: 'PRODUCT_VIEW',
      session_id: 'SP-NEW-SESS-99',
      product_id: 'P99',
      timestamp: new Date().toISOString()
    };
    const newEvent2 = {
      source: 'ShopPulse',
      event_type: 'ADD_TO_CART',
      session_id: 'SP-NEW-SESS-99',
      product_id: 'P99',
      quantity: 1,
      unit_price: 999,
      timestamp: new Date().toISOString()
    };

    EventService.processEvent(newEvent1);
    EventService.processEvent(newEvent2);

    const extraction = ExtractionService.runExtraction({
      source: 'ShopPulse',
      data_types: ['Live Telemetry']
    });

    assert.strictEqual(extraction.records_extracted, previousCount + 2, 'Extraction must reflect the 2 new records');
  });

  it('A1-T4: Extraction with updated source records', () => {
    const updateEvent = {
      source: 'ShopPulse',
      event_type: 'ORDER_DELIVERED',
      session_id: 'SP-FIX-SESS-1',
      order_id: 'ORD-SP-1001',
      timestamp: new Date().toISOString()
    };

    EventService.processEvent(updateEvent);

    const events = db.getEvents({ source: 'ShopPulse' });
    const delivered = events.find(e => e.order_id === 'ORD-SP-1001' && e.event_type === 'ORDER_DELIVERED');
    assert.ok(delivered, 'Updated event must be recorded in the store');
  });

  it('A1-T5: Empty source extraction behavior', () => {
    const extraction = ExtractionService.runExtraction({
      source: 'UnknownStorefront',
      data_types: ['Orders']
    });

    assert.strictEqual(extraction.records_extracted, 0, 'Empty source must return 0 records');
    assert.strictEqual(extraction.extracted_data.events.length, 0, 'Extracted events payload must be empty');
  });

  it('A1-T6: Preservation of previously extracted records', () => {
    const extractions = db.getExtractions();
    assert.ok(extractions.length >= 3, 'All extraction logs must be preserved');
    
    const firstExt = extractions[extractions.length - 1];
    assert.ok(firstExt.extraction_id, 'Previous extraction ID must be intact');
    assert.ok(firstExt.started_at, 'Previous extraction timestamp must be intact');
  });

  it('A1-T7: Idempotency under repeated duplicate event ingestion', () => {
    // Send the exact same event twice with identical session, source, timestamp, order_id
    const duplicatePayload = {
      source: 'ShopPulse',
      event_type: 'ORDER_CREATED',
      session_id: 'SP-DUPE-TEST-001',
      order_id: 'ORD-DUPE-999',
      total_amount: 1999,
      timestamp: '2026-10-15T12:00:00.000Z'
    };

    const firstResult = EventService.processEvent(duplicatePayload);
    const secondResult = EventService.processEvent(duplicatePayload);

    const matchingEvents = db.getEvents().filter(e => 
      e.source === 'ShopPulse' && 
      e.session_id === 'SP-DUPE-TEST-001' && 
      e.order_id === 'ORD-DUPE-999'
    );

    console.log(`[A1-T7 Evidence] Matching events in DB: ${matchingEvents.length}`);
    console.log(`[A1-T7 Evidence] Event IDs: ${firstResult.event_id} vs ${secondResult.event_id}`);

    // Assert that idempotency is now enforced: only 1 event persisted
    assert.strictEqual(matchingEvents.length, 1, 'Duplicate event must be deduplicated and not inserted twice');
    assert.strictEqual(firstResult.event_id, secondResult.event_id, 'Idempotent call must return the same canonical event');
  });
});
