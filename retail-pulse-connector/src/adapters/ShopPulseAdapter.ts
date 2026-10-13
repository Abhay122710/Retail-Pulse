import { RawEventPayload, CanonicalEvent, EventType } from '../models/types.js';

let eventCounter = 100000;

export class ShopPulseAdapter {
  public static normalize(payload: RawEventPayload): CanonicalEvent {
    eventCounter++;
    const now = new Date().toISOString();
    
    const eventType = (payload.event_type || 'PAGE_VIEW') as EventType;
    const sessionId = payload.session_id || `SP-SESSION-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = payload.user_id || payload.customer_id || null;
    const productId = payload.product_id || null;
    const orderId = payload.order_id || null;

    return {
      event_id: `EVT-${eventCounter}`,
      source: 'ShopPulse',
      source_type: payload.source_type || 'ecommerce',
      event_type: eventType,
      session_id: sessionId,
      user_id: userId,
      canonical_user_id: userId ? `SP-USER-${userId}` : null,
      product_id: productId,
      canonical_product_id: productId ? `SP-PROD-${productId}` : null,
      product_name: payload.product_name || payload.title || null,
      category: payload.category || null,
      order_id: orderId,
      canonical_transaction_id: orderId ? `SP-ORD-${orderId}` : null,
      search_query: payload.search_query || null,
      results_count: typeof payload.results_count === 'number' ? payload.results_count : null,
      view_duration_seconds: typeof payload.view_duration_seconds === 'number' ? payload.view_duration_seconds : null,
      quantity: typeof payload.quantity === 'number' ? payload.quantity : (payload.item_count || null),
      unit_price: typeof payload.unit_price === 'number' ? payload.unit_price : null,
      total_amount: typeof payload.total_amount === 'number' ? payload.total_amount : null,
      cart_value: typeof payload.cart_value === 'number' ? payload.cart_value : null,
      item_count: typeof payload.item_count === 'number' ? payload.item_count : null,
      rating: typeof payload.rating === 'number' ? payload.rating : null,
      payment_method: payload.payment_method || null,
      timestamp: payload.timestamp || now,
      payload: JSON.stringify(payload),
      created_at: now
    };
  }
}
