/**
 * Deterministic Test Fixtures for RetailPulse Verification Suite
 * Contains isolated, hand-calculable test records for ShopPulse and TechMart.
 */

export interface TestEventDefinition {
  description: string;
  payload: Record<string, any>;
  expectedCanonical: Record<string, any>;
}

export const DETERMINISTIC_SHOPPULSE_EVENTS = [
  // Session 1: Completed Purchase
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'PAGE_VIEW',
    session_id: 'SP-FIX-SESS-1',
    user_id: 'C-101',
    timestamp: '2026-10-15T10:00:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'PRODUCT_VIEW',
    session_id: 'SP-FIX-SESS-1',
    user_id: 'C-101',
    product_id: 'PROD-SP-10',
    product_name: 'Cotton Casual Shirt',
    category: 'Apparel',
    view_duration_seconds: 30,
    timestamp: '2026-10-15T10:01:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ADD_TO_CART',
    session_id: 'SP-FIX-SESS-1',
    user_id: 'C-101',
    product_id: 'PROD-SP-10',
    product_name: 'Cotton Casual Shirt',
    category: 'Apparel',
    quantity: 2,
    unit_price: 1500,
    total_amount: 3000,
    timestamp: '2026-10-15T10:02:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'CHECKOUT_STARTED',
    session_id: 'SP-FIX-SESS-1',
    user_id: 'C-101',
    cart_value: 3000,
    item_count: 2,
    timestamp: '2026-10-15T10:03:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ORDER_CREATED',
    session_id: 'SP-FIX-SESS-1',
    user_id: 'C-101',
    order_id: 'ORD-SP-1001',
    product_id: 'PROD-SP-10',
    product_name: 'Cotton Casual Shirt',
    category: 'Apparel',
    total_amount: 3000,
    quantity: 2,
    payment_method: 'UPI',
    timestamp: '2026-10-15T10:04:00.000Z'
  },

  // Session 2: Cart Abandonment
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'PRODUCT_VIEW',
    session_id: 'SP-FIX-SESS-2',
    user_id: 'C-102',
    product_id: 'PROD-SP-20',
    product_name: 'Wireless Headphones',
    category: 'Electronics',
    view_duration_seconds: 60,
    timestamp: '2026-10-15T10:10:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ADD_TO_CART',
    session_id: 'SP-FIX-SESS-2',
    user_id: 'C-102',
    product_id: 'PROD-SP-20',
    product_name: 'Wireless Headphones',
    category: 'Electronics',
    quantity: 1,
    unit_price: 2000,
    total_amount: 2000,
    timestamp: '2026-10-15T10:11:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'CHECKOUT_STARTED',
    session_id: 'SP-FIX-SESS-2',
    user_id: 'C-102',
    cart_value: 2000,
    item_count: 1,
    timestamp: '2026-10-15T10:12:00.000Z'
  },

  // Session 3: Purchased and then Cancelled
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'SEARCH',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    search_query: 'running shoes',
    results_count: 12,
    timestamp: '2026-10-15T10:20:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'PRODUCT_VIEW',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    product_id: 'PROD-SP-30',
    product_name: 'Running Shoes Pro',
    category: 'Footwear',
    view_duration_seconds: 45,
    timestamp: '2026-10-15T10:21:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ADD_TO_CART',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    product_id: 'PROD-SP-30',
    product_name: 'Running Shoes Pro',
    category: 'Footwear',
    quantity: 1,
    unit_price: 5000,
    total_amount: 5000,
    timestamp: '2026-10-15T10:22:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'CHECKOUT_STARTED',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    cart_value: 5000,
    item_count: 1,
    timestamp: '2026-10-15T10:23:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ORDER_CREATED',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    order_id: 'ORD-SP-1002',
    product_id: 'PROD-SP-30',
    product_name: 'Running Shoes Pro',
    category: 'Footwear',
    total_amount: 5000,
    quantity: 1,
    payment_method: 'Credit Card',
    timestamp: '2026-10-15T10:24:00.000Z'
  },
  {
    source: 'ShopPulse',
    source_type: 'ecommerce',
    event_type: 'ORDER_CANCELLED',
    session_id: 'SP-FIX-SESS-3',
    user_id: 'C-103',
    order_id: 'ORD-SP-1002',
    total_amount: 5000,
    timestamp: '2026-10-15T10:30:00.000Z'
  }
];

export const DETERMINISTIC_TECHMART_EVENTS = [
  // Session 4: Completed TechMart Purchase
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'PAGE_VIEW',
    session_id: 'TM-FIX-SESS-4',
    user_code: 'TM-U-401',
    timestamp: '2026-10-15T11:00:00.000Z'
  },
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'PRODUCT_VIEW',
    session_id: 'TM-FIX-SESS-4',
    user_code: 'TM-U-401',
    sku: 'TM-SKU-400',
    item_title: 'Pro Gaming Laptop RTX 4080',
    department: 'Gaming',
    view_duration_seconds: 50,
    timestamp: '2026-10-15T11:01:00.000Z'
  },
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'ADD_TO_CART',
    session_id: 'TM-FIX-SESS-4',
    user_code: 'TM-U-401',
    sku: 'TM-SKU-400',
    item_title: 'Pro Gaming Laptop RTX 4080',
    department: 'Gaming',
    units: 1,
    unit_price: 45000,
    net_value: 45000,
    timestamp: '2026-10-15T11:02:00.000Z'
  },
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'CHECKOUT_STARTED',
    session_id: 'TM-FIX-SESS-4',
    user_code: 'TM-U-401',
    cart_value: 45000,
    item_count: 1,
    timestamp: '2026-10-15T11:03:00.000Z'
  },
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'ORDER_CREATED',
    session_id: 'TM-FIX-SESS-4',
    user_code: 'TM-U-401',
    transaction_id: 'TXN-TM-4001',
    sku: 'TM-SKU-400',
    item_title: 'Pro Gaming Laptop RTX 4080',
    department: 'Gaming',
    units: 1,
    net_value: 45000,
    payment_channel: 'Credit Card',
    timestamp: '2026-10-15T11:04:00.000Z'
  },

  // Session 5: Zero-results Search & Abandon
  {
    source: 'TechMart',
    source_type: 'ecommerce',
    event_type: 'SEARCH',
    session_id: 'TM-FIX-SESS-5',
    user_code: 'TM-U-501',
    search_query: 'quantum computer kit',
    results_count: 0,
    timestamp: '2026-10-15T11:10:00.000Z'
  }
];

export const EXPECTED_KPI_RESULTS = {
  ShopPulse: {
    totalRevenueGross: 8000, // ORD-SP-1001 (3000) + ORD-SP-1002 (5000)
    totalRevenueNet: 3000,   // ORD-SP-1002 was cancelled (-5000)
    totalOrdersGross: 2,
    totalOrdersNet: 1,
    checkoutsStarted: 3,
    sessionsCount: 3,
    avgDwellSeconds: 45, // (30 + 60 + 45) / 3 = 45
    // Cart abandonment with gross orders: (3 - 2)/3 = 33.3%
    // Cart abandonment with net orders: (3 - 1)/3 = 66.7%
    abandonmentRateNet: 66.7,
    conversionRateNet: 33.3 // 1 order / 3 sessions
  },
  TechMart: {
    totalRevenueNet: 45000,
    totalOrdersNet: 1,
    checkoutsStarted: 1,
    sessionsCount: 2,
    avgDwellSeconds: 50,
    abandonmentRateNet: 0.0, // 1 checkout, 1 order
    conversionRateNet: 50.0  // 1 order / 2 sessions
  },
  Combined: {
    totalRevenueGross: 53000,
    totalRevenueNet: 48000,
    totalOrdersNet: 2,
    sessionsCount: 5,
    avgDwellSeconds: 46 // (30 + 60 + 45 + 50) / 4 = 46.25 -> 46
  }
};
