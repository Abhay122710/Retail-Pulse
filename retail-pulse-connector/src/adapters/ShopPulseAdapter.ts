import { RawEventPayload, CanonicalEvent, EventType } from '../models/types.js';

export class ShopPulseAdapter {
  public static normalize(payload: RawEventPayload): CanonicalEvent {
    const now = new Date().toISOString();
    
    // Support existing stable event_id if provided; otherwise generate collision-resistant ID
    const eventId = payload.event_id 
      ? String(payload.event_id)
      : `EVT-SP-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const eventType = (payload.event_type || 'PAGE_VIEW') as EventType;
    const sessionId = payload.session_id || `SP-SESSION-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = payload.user_id || payload.customer_id || null;
    const productId = payload.product_id || null;
    const orderId = payload.order_id || null;

    // Idempotent prefix normalization
    const canonicalUserId = userId 
      ? (userId.startsWith('SP-USER-') ? userId : `SP-USER-${userId}`) 
      : null;

    const canonicalProductId = productId 
      ? (productId.startsWith('SP-PROD-') ? productId : `SP-PROD-${productId.replace(/^PROD-/, '')}`) 
      : null;

    const canonicalTxId = orderId 
      ? (orderId.startsWith('SP-ORD-') ? orderId : `SP-ORD-${orderId.replace(/^ORD-/, '')}`) 
      : null;

    const timestamp = payload.timestamp && !isNaN(Date.parse(payload.timestamp))
      ? new Date(payload.timestamp).toISOString()
      : now;

    return {
      event_id: eventId,
      source: 'ShopPulse',
      source_type: payload.source_type || 'ecommerce',
      event_type: eventType,
      session_id: sessionId,
      user_id: userId,
      canonical_user_id: canonicalUserId,
      product_id: productId,
      canonical_product_id: canonicalProductId,
      product_name: payload.product_name || payload.banner || payload.clickbait_tag || payload.title || null,
      category: payload.category || (payload.banner ? 'Clickbait & Promotions' : null),
      order_id: orderId,
      canonical_transaction_id: canonicalTxId,
      search_query: payload.search_query ? String(payload.search_query).trim() : null,
      results_count: typeof payload.results_count === 'number' && !isNaN(payload.results_count) ? Math.max(0, payload.results_count) : null,
      view_duration_seconds: typeof payload.view_duration_seconds === 'number' && !isNaN(payload.view_duration_seconds) ? Math.max(0, payload.view_duration_seconds) : null,
      quantity: typeof payload.quantity === 'number' && !isNaN(payload.quantity) ? Math.max(0, payload.quantity) : (typeof payload.item_count === 'number' ? Math.max(0, payload.item_count) : null),
      unit_price: typeof payload.unit_price === 'number' && !isNaN(payload.unit_price) ? Math.max(0, payload.unit_price) : null,
      total_amount: typeof payload.total_amount === 'number' && !isNaN(payload.total_amount) ? Math.max(0, payload.total_amount) : null,
      cart_value: typeof payload.cart_value === 'number' && !isNaN(payload.cart_value) ? Math.max(0, payload.cart_value) : null,
      item_count: typeof payload.item_count === 'number' && !isNaN(payload.item_count) ? Math.max(0, payload.item_count) : null,
      rating: typeof payload.rating === 'number' && !isNaN(payload.rating) ? Math.min(5, Math.max(1, payload.rating)) : null,
      payment_method: payload.payment_method || null,
      timestamp,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      created_at: now
    };
  }
}
