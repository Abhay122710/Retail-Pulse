import { RawEventPayload, CanonicalEvent } from '../models/types.js';
import { ShopPulseAdapter } from '../adapters/ShopPulseAdapter.js';
import { TechMartAdapter } from '../adapters/TechMartAdapter.js';
import { db } from '../models/database.js';
import { SchemaValidator } from '../utils/validator.js';
import { Logger } from '../utils/logger.js';

export interface ProcessEventResult {
  canonicalEvent: CanonicalEvent;
  wasDeduplicated: boolean;
}

export class EventService {
  public static processEvent(payload: RawEventPayload, correlationId = 'INGEST'): CanonicalEvent {
    // 1. Schema Validation
    const validation = SchemaValidator.validate(payload);
    if (!validation.isValid) {
      db.recordPipelineAudit({
        source: payload?.source || 'UnknownStore',
        stage: 'VALIDATION',
        status: 'REJECTED',
        event_type: payload?.event_type,
        error_details: validation.errors,
        correlation_id: correlationId
      });
      Logger.warn(
        'VALIDATION', 
        `Validation failed for event from [${payload?.source}]: ${validation.errors.join('; ')}`, 
        correlationId, 
        { errors: validation.errors }
      );
      throw new Error(`Validation Error: ${validation.errors.join(', ')}`);
    }

    // 2. Strict Source Routing
    const source = payload.source;
    let canonicalEvent: CanonicalEvent;

    if (source === 'ShopPulse') {
      canonicalEvent = ShopPulseAdapter.normalize(payload);
    } else if (source === 'TechMart') {
      canonicalEvent = TechMartAdapter.normalize(payload);
    } else {
      db.recordPipelineAudit({
        source: source || 'UnknownStore',
        stage: 'TRANSFORMATION',
        status: 'REJECTED',
        event_type: payload?.event_type,
        error_details: [`Unsupported source "${source}". Must be ShopPulse or TechMart.`],
        correlation_id: correlationId
      });
      throw new Error(`Unsupported source "${source}". Must be ShopPulse or TechMart.`);
    }

    // 3. Persistent Insertion with Idempotency Check
    const { inserted, event } = db.insertEvent(canonicalEvent);

    if (inserted) {
      db.recordPipelineAudit({
        source: event.source,
        stage: 'INGESTION',
        status: 'ACCEPTED',
        event_type: event.event_type,
        correlation_id: correlationId
      });
      Logger.info(
        'INGESTION', 
        `Event accepted & persisted from [${event.source}]: ${event.event_type} (${event.event_id})`, 
        correlationId
      );
    } else {
      db.recordPipelineAudit({
        source: event.source,
        stage: 'INGESTION',
        status: 'DEDUPLICATED',
        event_type: event.event_type,
        correlation_id: correlationId
      });
      Logger.warn(
        'INGESTION', 
        `Duplicate event deduplicated for [${event.source}]: ${event.event_type} (existing: ${event.event_id})`, 
        correlationId
      );
    }

    return event;
  }
}
