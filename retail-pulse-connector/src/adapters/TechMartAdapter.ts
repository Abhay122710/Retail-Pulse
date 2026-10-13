import { RawEventPayload, CanonicalEvent, EventType } from '../models/types.js';

let eventCounter = 200000;

export class TechMartAdapter {
  public static normalize(payload: RawEventPayload): CanonicalEvent {
    eventCounter++;
    const now = new Date().toISOString();

    const eventType = (payload.event_type || 'PAGE_VIEW') as EventType;
    const sessionId = payload.session_id || `TM-SESSION-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // TechMart native identifiers
    const userId = payload.user_code || payload.user_id || null;
    const productId = payload.sku || payload.product_id || null;
    const transactionId = payload.transaction_id || payload.order_id || null;

    // Price & amount normalizations
    const totalAmount = typeof payload.net_value === 'number' 
      ? payload.net_value 
      : (typeof payload.gross_value === 'number' 
        ? payload.gross_value 
        : (typeof payload.total_amount === 'number' ? payload.total_amount : null));

    const productName = payload.item_title || payload.product_name || payload.banner || payload.title || null;
    const category = payload.department || payload.category || (payload.banner ? 'Clickbait & Promotions' : null);

    return {
      event_id: `EVT-${eventCounter}`,
      source: 'TechMart',
      source_type: payload.source_type || 'ecommerce',
      event_type: eventType,
      session_id: sessionId,
      user_id: userId,
      canonical_user_id: userId ? `TM-USER-${userId}` : null,
      product_id: productId,
      canonical_product_id: productId ? `TM-SKU-${productId}` : null,
      product_name: productName,
      category: category,
      order_id: transactionId,
      canonical_transaction_id: transactionId ? `TM-TXN-${transactionId}` : null,
      search_query: payload.search_query || null,
      results_count: typeof payload.results_count === 'number' ? payload.results_count : null,
      view_duration_seconds: typeof payload.view_duration_seconds === 'number' ? payload.view_duration_seconds : null,
      quantity: typeof payload.units === 'number' ? payload.units : (typeof payload.quantity === 'number' ? payload.quantity : null),
      unit_price: typeof payload.unit_price === 'number' ? payload.unit_price : null,
      total_amount: totalAmount,
      cart_value: typeof payload.cart_value === 'number' ? payload.cart_value : null,
      item_count: typeof payload.item_count === 'number' ? payload.item_count : null,
      rating: typeof payload.rating === 'number' ? payload.rating : null,
      payment_method: payload.payment_channel || payload.payment_method || null,
      timestamp: payload.timestamp || now,
      payload: JSON.stringify(payload),
      created_at: now
    };
  }
}
