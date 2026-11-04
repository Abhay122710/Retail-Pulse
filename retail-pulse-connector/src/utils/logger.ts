/**
 * RetailPulse Structured Logger
 * Provides audit logging, pipeline stage tracking, correlation IDs, and credential sanitization.
 */

export type PipelineStage = 
  | 'INGESTION' 
  | 'VALIDATION' 
  | 'TRANSFORMATION' 
  | 'EXTRACTION' 
  | 'PERSISTENCE' 
  | 'QUERY'
  | 'KPI' 
  | 'SYSTEM';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const SENSITIVE_KEYS = new Set([
  'password', 'passwd', 'secret', 'token', 'api_key', 'apikey', 
  'authorization', 'cvv', 'credit_card', 'card_number',
  'private_key', 'access_token', 'refresh_token', 'ssn', 'pin'
]);

export function sanitizePayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizePayload(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export interface StructuredLogEntry {
  timestamp: string;
  correlation_id: string;
  stage: PipelineStage;
  level: LogLevel;
  source?: string;
  message: string;
  records_processed?: number;
  records_accepted?: number;
  records_rejected?: number;
  duration_ms?: number;
  error_category?: string;
  details?: any;
}

export class Logger {
  public static log(entry: Omit<StructuredLogEntry, 'timestamp'>): void {
    const fullEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
      details: entry.details ? sanitizePayload(entry.details) : undefined
    };

    const prefix = `[${fullEntry.timestamp}] [${fullEntry.correlation_id}] [${fullEntry.stage}] [${fullEntry.level}]`;
    const message = `${prefix} ${fullEntry.message}`;

    if (fullEntry.level === 'ERROR') {
      console.error(message, fullEntry.details || '');
    } else if (fullEntry.level === 'WARN') {
      console.warn(message, fullEntry.details || '');
    } else {
      console.log(message, fullEntry.details ? JSON.stringify(fullEntry.details) : '');
    }
  }

  public static info(stage: PipelineStage, message: string, correlationId = 'SYSTEM', details?: any) {
    this.log({ stage, level: 'INFO', correlation_id: correlationId, message, details });
  }

  public static warn(stage: PipelineStage, message: string, correlationId = 'SYSTEM', details?: any) {
    this.log({ stage, level: 'WARN', correlation_id: correlationId, message, details });
  }

  public static error(stage: PipelineStage, message: string, correlationId = 'SYSTEM', errorCategory?: string, details?: any) {
    this.log({ stage, level: 'ERROR', correlation_id: correlationId, message, error_category: errorCategory, details });
  }
}
