import { RawEventPayload, CanonicalEvent } from '../models/types.js';
import { ShopPulseAdapter } from '../adapters/ShopPulseAdapter.js';
import { TechMartAdapter } from '../adapters/TechMartAdapter.js';
import { db } from '../models/database.js';

export class EventService {
  public static processEvent(payload: RawEventPayload): CanonicalEvent {
    const source = payload.source;
    let canonicalEvent: CanonicalEvent;

    if (source === 'ShopPulse') {
      canonicalEvent = ShopPulseAdapter.normalize(payload);
    } else if (source === 'TechMart') {
      canonicalEvent = TechMartAdapter.normalize(payload);
    } else {
      // Default fallback adapter using ShopPulse logic
      canonicalEvent = ShopPulseAdapter.normalize(payload);
    }

    db.insertEvent(canonicalEvent);

    console.log(`[Connector] Event received from [${canonicalEvent.source}]: ${canonicalEvent.event_type} (${canonicalEvent.event_id})`);
    return canonicalEvent;
  }
}
