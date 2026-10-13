const CONNECTOR_URL = (import.meta as any).env?.VITE_CONNECTOR_URL || 'http://localhost:5000/api';

const SESSION_KEY = 'shoppulse_session_id_v1';

export function getSessionId(): string {
  let session = sessionStorage.getItem(SESSION_KEY);
  if (!session) {
    session = `SP-SESSION-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

export function sendEvent(eventType: string, payloadData: Record<string, any> = {}) {
  const fullPayload = {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: eventType,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    ...payloadData
  };

  console.log(`[ShopPulse] ${eventType} sent`, fullPayload);

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
          console.warn('[ShopPulse] Event tracking request failed silently:', err.message);
        }
      });
  };

  attemptSend(3);
}

// Product dwell duration tracker
let productStartTime: number | null = null;
let currentProductId: string | null = null;
let currentProductName: string | null = null;
let currentProductCategory: string | null = null;

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

  trackProductViewOpen(product: { product_id: string; product_name: string; category?: string }) {
    productStartTime = Date.now();
    currentProductId = product.product_id;
    currentProductName = product.product_name;
    currentProductCategory = product.category || 'General';

    sendEvent('PRODUCT_VIEW', {
      product_id: product.product_id,
      product_name: product.product_name,
      category: currentProductCategory
    });
  },

  trackProductViewClose() {
    if (productStartTime && currentProductId) {
      const durationSec = Math.max(1, Math.round((Date.now() - productStartTime) / 1000));
      sendEvent('PRODUCT_VIEW', {
        product_id: currentProductId,
        product_name: currentProductName,
        category: currentProductCategory,
        view_duration_seconds: durationSec
      });
      productStartTime = null;
      currentProductId = null;
      currentProductName = null;
      currentProductCategory = null;
    }
  },

  trackAddToCart(product: { product_id: string; product_name: string; final_price: number }, quantity: number, userId?: string) {
    sendEvent('ADD_TO_CART', {
      user_id: userId || null,
      product_id: product.product_id,
      product_name: product.product_name,
      quantity,
      unit_price: product.final_price
    });
  },

  trackRemoveFromCart(productId: string, quantity = 1) {
    sendEvent('REMOVE_FROM_CART', {
      product_id: productId,
      quantity
    });
  },

  trackCartView(cartValue: number, itemCount: number) {
    sendEvent('CART_VIEW', {
      cart_value: cartValue,
      item_count: itemCount
    });
  },

  trackWishlistAdd(productId: string, userId?: string) {
    sendEvent('WISHLIST_ADD', {
      user_id: userId || null,
      product_id: productId
    });
  },

  trackWishlistRemove(productId: string, userId?: string) {
    sendEvent('WISHLIST_REMOVE', {
      user_id: userId || null,
      product_id: productId
    });
  },

  trackCheckoutStarted(cartValue: number, itemCount: number) {
    sendEvent('CHECKOUT_STARTED', {
      cart_value: cartValue,
      item_count: itemCount
    });
  },

  trackOrderCreated(orderId: string, totalAmount: number, paymentMethod: string, userId?: string) {
    sendEvent('ORDER_CREATED', {
      order_id: orderId,
      user_id: userId || null,
      total_amount: totalAmount,
      payment_method: paymentMethod
    });
  },

  trackReviewSubmitted(productId: string, rating: number) {
    sendEvent('REVIEW_SUBMITTED', {
      product_id: productId,
      rating
    });
  }
};
