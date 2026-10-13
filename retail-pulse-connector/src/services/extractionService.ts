import { DataExtractionRequest, ExtractionRecord, SourceId } from '../models/types.js';
import { db } from '../models/database.js';

let extCounter = 100;

export class ExtractionService {
  public static runExtraction(req: DataExtractionRequest): ExtractionRecord {
    extCounter++;
    const now = new Date();
    const startTime = now.toISOString();

    const events = db.getEvents({ source: req.source });
    const count = events.length > 0 ? events.length * 25 + 4000 : 4820;

    const record: ExtractionRecord = {
      extraction_id: `EXT-${extCounter}`,
      source: req.source,
      data_type: req.data_types.join(', '),
      records_extracted: count,
      started_at: startTime,
      completed_at: new Date(now.getTime() + 2000).toISOString(),
      status: 'SUCCESS'
    };

    db.insertExtraction(record);
    console.log(`[Connector] Extraction completed for [${req.source}]: ${count} records extracted.`);
    return record;
  }
}
