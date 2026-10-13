import { DataExtractionRequest, ExtractionRecord, CanonicalEvent } from '../models/types.js';
import { db } from '../models/database.js';

let extCounter = Math.floor(1000 + Math.random() * 9000);

export class ExtractionService {
  public static runExtraction(req: DataExtractionRequest): ExtractionRecord {
    extCounter++;
    const now = new Date();
    const startTime = now.toISOString();

    const isAllSources = !req.source || req.source === 'ALL SOURCES' || req.source === 'All';
    const events: CanonicalEvent[] = isAllSources 
      ? db.getEvents() 
      : db.getEvents({ source: req.source });

    // Breakdown count by event types (including clickbaits and clicks)
    const breakdown: Record<string, number> = {};
    events.forEach((evt) => {
      breakdown[evt.event_type] = (breakdown[evt.event_type] || 0) + 1;
    });

    const extractionId = `EXT-${Date.now().toString().slice(-6)}-${extCounter}`;

    const extractedPayload = {
      extraction_metadata: {
        extraction_id: extractionId,
        source: isAllSources ? 'All Sources (ShopPulse & TechMart)' : req.source,
        requested_scopes: req.data_types,
        total_records_extracted: events.length,
        extracted_at: startTime,
        pipeline: 'Retail Pulse Canonical Multi-Source ETL Engine',
        schema_version: '2.0.0'
      },
      summary: {
        total_events: events.length,
        event_breakdown: breakdown,
        sources_included: isAllSources ? ['ShopPulse', 'TechMart'] : [req.source]
      },
      events: events,
      sessions: db.getEvents().map(e => ({
        session_id: e.session_id,
        source: e.source,
        user_id: e.user_id,
        last_event: e.event_type,
        timestamp: e.timestamp
      })).filter((v, i, a) => a.findIndex(t => t.session_id === v.session_id) === i)
    };

    const record: ExtractionRecord = {
      extraction_id: extractionId,
      source: isAllSources ? 'All Sources' : req.source,
      data_type: req.data_types.join(', '),
      records_extracted: events.length,
      started_at: startTime,
      completed_at: new Date(now.getTime() + 1500).toISOString(),
      status: 'SUCCESS',
      extracted_data: extractedPayload
    };

    db.insertExtraction(record);
    console.log(`[Connector] Fresh extraction completed for [${record.source}]: ${events.length} fresh active records extracted.`);
    return record;
  }
}
