/**
 * RetailPulse Canonical Schema Validator
 * Validates raw event payloads before transformation into canonical events.
 */

import { EventType, RawEventPayload, SourceId } from '../models/types.js';

export const VALID_SOURCES: Set<string> = new Set(['ShopPulse', 'TechMart']);

export const VALID_EVENT_TYPES: Set<EventType> = new Set([
  'PAGE_VIEW',
  'PRODUCT_VIEW',
  'SEARCH',
  'CATEGORY_VIEW',
  'PRODUCT_HOVER',
  'ADD_TO_CART',
  'REMOVE_FROM_CART',
  'CART_VIEW',
  'WISHLIST_ADD',
  'WISHLIST_REMOVE',
  'CHECKOUT_STARTED',
  'CHECKOUT_COMPLETED',
  'ORDER_CREATED',
  'ORDER_CANCELLED',
  'ORDER_DELIVERED',
  'REVIEW_SUBMITTED',
  'CLICKBAIT_CLICK',
  'BANNER_CLICK',
  'PROMO_CLICK',
  'LOGIN',
  'LOGOUT'
]);

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SchemaValidator {
  public static validate(payload: any): ValidationResult {
    const errors: string[] = [];

    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be a non-null object'] };
    }

    // 1. Source Validation
    if (!payload.source) {
      errors.push('Missing required field: "source"');
    } else if (!VALID_SOURCES.has(payload.source)) {
      errors.push(`Unsupported source "${payload.source}". Allowed: ShopPulse, TechMart`);
    }

    // 2. Event Type Validation
    if (!payload.event_type) {
      errors.push('Missing required field: "event_type"');
    } else if (!VALID_EVENT_TYPES.has(payload.event_type as EventType)) {
      errors.push(`Unsupported event_type "${payload.event_type}"`);
    }

    // 3. Timestamp Validation
    if (payload.timestamp !== undefined && payload.timestamp !== null) {
      const parsed = Date.parse(payload.timestamp);
      if (isNaN(parsed)) {
        errors.push(`Invalid timestamp format "${payload.timestamp}". Expected ISO-8601 string`);
      }
    }

    // 4. Numeric Bounds and Finite Validation
    const checkNonNegative = (val: any, fieldName: string) => {
      if (val !== undefined && val !== null) {
        if (typeof val !== 'number' || !Number.isFinite(val)) {
          errors.push(`Field "${fieldName}" must be a valid finite number`);
        } else if (val < 0) {
          errors.push(`Field "${fieldName}" cannot be negative (received ${val})`);
        } else if (val > 1000000000) {
          errors.push(`Field "${fieldName}" exceeds maximum permitted threshold (1,000,000,000)`);
        }
      }
    };

    checkNonNegative(payload.quantity, 'quantity');
    checkNonNegative(payload.units, 'units');
    checkNonNegative(payload.unit_price, 'unit_price');
    checkNonNegative(payload.total_amount, 'total_amount');
    checkNonNegative(payload.net_value, 'net_value');
    checkNonNegative(payload.gross_value, 'gross_value');
    checkNonNegative(payload.cart_value, 'cart_value');
    checkNonNegative(payload.view_duration_seconds, 'view_duration_seconds');

    if (payload.rating !== undefined && payload.rating !== null) {
      if (typeof payload.rating !== 'number' || !Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
        errors.push(`Field "rating" must be a number between 1 and 5 (received ${payload.rating})`);
      }
    }

    // 5. String Length Boundaries (Buffer and DoS Defense)
    const checkStringLength = (val: any, fieldName: string, maxLen: number) => {
      if (val !== undefined && val !== null) {
        if (typeof val !== 'string') {
          errors.push(`Field "${fieldName}" must be a string`);
        } else if (val.length > maxLen) {
          errors.push(`Field "${fieldName}" exceeds maximum permitted length of ${maxLen} characters`);
        }
      }
    };

    checkStringLength(payload.order_id, 'order_id', 128);
    checkStringLength(payload.transaction_id, 'transaction_id', 128);
    checkStringLength(payload.session_id, 'session_id', 128);
    checkStringLength(payload.user_id, 'user_id', 128);
    checkStringLength(payload.product_id, 'product_id', 128);
    checkStringLength(payload.sku, 'sku', 128);
    checkStringLength(payload.product_name, 'product_name', 256);
    checkStringLength(payload.category, 'category', 128);
    checkStringLength(payload.search_query, 'search_query', 500);

    // 6. Event-Specific Semantics
    if (payload.event_type === 'ORDER_CREATED') {
      const hasOrderId = payload.order_id || payload.transaction_id;
      if (!hasOrderId) {
        errors.push('Event "ORDER_CREATED" requires an "order_id" or "transaction_id"');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
