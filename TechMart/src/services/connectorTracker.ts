const CONNECTOR_URL = (import.meta as any).env?.VITE_CONNECTOR_URL || 'http://localhost:5000/api';

const SESSION_KEY = 'techmart_session_id_v1';

export function getSessionId(): string {
  let session = sessionStorage.getItem(SESSION_KEY);
  if (!session) {
    session = `TM-SESSION-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

export function sendEvent(eventType: string, payloadData: Record<string, any> = {}) {
  const fullPayload = {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: eventType,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    ...payloadData
  };

  console.log(`[TechMart] ${eventType} sent`, fullPayload);

  // Non-blocking fetch with retry mechanism (up to 3 retries)
  const attemptSend = (retriesLeft: number) => {
    fetch(`${CONNECTOR_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
      keepalive: true
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          console.log(`[Connector] Event received (${data.event_id})`);
        }
      })
      .catch((err) => {
        if (retriesLeft > 0) {
          setTimeout(() => attemptSend(retriesLeft - 1), 1000);
        } else {
          console.warn('[TechMart] Event tracking request failed silently:', err.message);
        }
      });
  };

  attemptSend(3);
}

export const connectorTracker = {
  sendEvent,
  getSessionId,

  trackPageView(pageName: string) {
    sendEvent('PAGE_VIEW', { page: pageName });
  },

  trackSearch(query: string, resultsCount: number) {
    if (!query || !query.trim()) return;
    sendEvent('SEARCH', {
      search_query: query.trim(),
      results_count: resultsCount
    });
  },

  trackProductViewOpen(product: { sku: string; item_title: string; department?: string }) {
    sendEvent('PRODUCT_VIEW', {
      sku: product.sku,
      item_title: product.item_title,
      department: product.department || 'Electronics'
    });
  },

  trackProductViewClose(sku: string, title: string, durationSec: number) {
    sendEvent('PRODUCT_VIEW', {
      sku,
      item_title: title,
      view_duration_seconds: durationSec
    });
  },

  trackAddToCart(product: { sku: string; item_title: string; unit_price: number }, units: number, userCode?: string) {
    sendEvent('ADD_TO_CART', {
      user_code: userCode || null,
      sku: product.sku,
      item_title: product.item_title,
      units,
      unit_price: product.unit_price
    });
  },

  trackRemoveFromCart(sku: string, units = 1) {
    sendEvent('REMOVE_FROM_CART', {
      sku,
      units
    });
  },

  trackCartView(cartValue: number, itemCount: number) {
    sendEvent('CART_VIEW', {
      cart_value: cartValue,
      item_count: itemCount
    });
  },

  trackWishlistAdd(sku: string, userCode?: string) {
    sendEvent('WISHLIST_ADD', {
      user_code: userCode || null,
      sku
    });
  },

  trackWishlistRemove(sku: string, userCode?: string) {
    sendEvent('WISHLIST_REMOVE', {
      user_code: userCode || null,
      sku
    });
  },

  trackCheckoutStarted(cartValue: number, itemCount: number) {
    sendEvent('CHECKOUT_STARTED', {
      cart_value: cartValue,
      item_count: itemCount
    });
  },

  trackOrderCreated(transactionId: string, netValue: number, paymentChannel: string, userCode?: string) {
    sendEvent('ORDER_CREATED', {
      transaction_id: transactionId,
      user_code: userCode || null,
      net_value: netValue,
      payment_channel: paymentChannel
    });
  },

  trackReviewSubmitted(sku: string, rating: number) {
    sendEvent('REVIEW_SUBMITTED', {
      sku,
      rating
    });
  }
};
