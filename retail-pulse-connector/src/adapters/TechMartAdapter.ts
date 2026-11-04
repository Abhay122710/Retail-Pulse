import { RawEventPayload, CanonicalEvent, EventType } from '../models/types.js';

export class TechMartAdapter {
  public static normalize(payload: RawEventPayload): CanonicalEvent {
    const now = new Date().toISOString();

    // Support existing stable event_id if provided; otherwise generate collision-resistant ID
    const eventId = payload.event_id 
      ? String(payload.event_id)
      : `EVT-TM-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const eventType = (payload.event_type || 'PAGE_VIEW') as EventType;
    const sessionId = payload.session_id || `TM-SESSION-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // TechMart native identifiers
    const userId = payload.user_code || payload.user_id || null;
    const productId = payload.sku || payload.product_id || null;
    const transactionId = payload.transaction_id || payload.order_id || null;

    // Idempotent prefix normalization
    const canonicalUserId = userId 
      ? (userId.startsWith('TM-USER-') ? userId : `TM-USER-${userId}`) 
      : null;

    const canonicalProductId = productId 
      ? (productId.startsWith('TM-SKU-') ? productId : `TM-SKU-${productId.replace(/^TM-SKU-/, '')}`) 
      : null;

    const canonicalTxId = transactionId 
      ? (transactionId.startsWith('TM-TXN-') ? transactionId : `TM-TXN-${transactionId.replace(/^(TXN-TM-|TXN-)/, '')}`) 
      : null;

    // Price & amount normalizations
    const rawAmount = typeof payload.net_value === 'number' && !isNaN(payload.net_value)
      ? payload.net_value 
      : (typeof payload.gross_value === 'number' && !isNaN(payload.gross_value)
        ? payload.gross_value 
        : (typeof payload.total_amount === 'number' && !isNaN(payload.total_amount) ? payload.total_amount : null));

    const totalAmount = rawAmount !== null ? Math.max(0, rawAmount) : null;

    const rawUnits = typeof payload.units === 'number' && !isNaN(payload.units)
      ? payload.units 
      : (typeof payload.quantity === 'number' && !isNaN(payload.quantity) ? payload.quantity : null);

    const quantity = rawUnits !== null ? Math.max(0, rawUnits) : null;

    const productName = payload.item_title || payload.product_name || payload.banner || payload.title || null;
    const category = payload.department || payload.category || (payload.banner ? 'Clickbait & Promotions' : null);

    const timestamp = payload.timestamp && !isNaN(Date.parse(payload.timestamp))
      ? new Date(payload.timestamp).toISOString()
      : now;

    return {
      event_id: eventId,
      source: 'TechMart',
      source_type: payload.source_type || 'ecommerce',
      event_type: eventType,
      session_id: sessionId,
      user_id: userId,
      canonical_user_id: canonicalUserId,
      product_id: productId,
      canonical_product_id: canonicalProductId,
      product_name: productName,
      category: category,
      order_id: transactionId,
      canonical_transaction_id: canonicalTxId,
      search_query: payload.search_query ? String(payload.search_query).trim() : null,
      results_count: typeof payload.results_count === 'number' && !isNaN(payload.results_count) ? Math.max(0, payload.results_count) : null,
      view_duration_seconds: typeof payload.view_duration_seconds === 'number' && !isNaN(payload.view_duration_seconds) ? Math.max(0, payload.view_duration_seconds) : null,
      quantity,
      unit_price: typeof payload.unit_price === 'number' && !isNaN(payload.unit_price) ? Math.max(0, payload.unit_price) : null,
      total_amount: totalAmount,
      cart_value: typeof payload.cart_value === 'number' && !isNaN(payload.cart_value) ? Math.max(0, payload.cart_value) : null,
      item_count: typeof payload.item_count === 'number' && !isNaN(payload.item_count) ? Math.max(0, payload.item_count) : null,
      rating: typeof payload.rating === 'number' && !isNaN(payload.rating) ? Math.min(5, Math.max(1, payload.rating)) : null,
      payment_method: payload.payment_channel || payload.payment_method || null,
      timestamp,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      created_at: now
    };
  }
}
