import type { TechMartTransaction, TechMartTransactionItem } from '../types';

export const initialTransactions: TechMartTransaction[] = [
  {
    transaction_id: 'TXN-TM-100001',
    user_code: 'TMU1001',
    transaction_timestamp: '2026-09-18T10:15:30Z',
    transaction_status: 'DELIVERED',
    payment_channel: 'UPI',
    delivery_city: 'Noida',
    delivery_state: 'Uttar Pradesh',
    gross_value: 139999,
    discount_value: 16799,
    tax_value: 22176,
    shipping_value: 0,
    net_value: 145376
  },
  {
    transaction_id: 'TXN-TM-100002',
    user_code: 'TMU1003',
    transaction_timestamp: '2026-09-20T14:45:12Z',
    transaction_status: 'DELIVERED',
    payment_channel: 'Card',
    delivery_city: 'Bengaluru',
    delivery_state: 'Karnataka',
    gross_value: 168890,
    discount_value: 11490,
    tax_value: 28332,
    shipping_value: 0,
    net_value: 185732
  },
  {
    transaction_id: 'TXN-TM-100003',
    user_code: 'TMU1002',
    transaction_timestamp: '2026-09-22T09:30:00Z',
    transaction_status: 'SHIPPED',
    payment_channel: 'Net Banking',
    delivery_city: 'Gurugram',
    delivery_state: 'Haryana',
    gross_value: 63980,
    discount_value: 6398,
    tax_value: 10364,
    shipping_value: 150,
    net_value: 68096
  },
  {
    transaction_id: 'TXN-TM-100004',
    user_code: 'TMU1004',
    transaction_timestamp: '2026-09-25T16:20:44Z',
    transaction_status: 'PACKED',
    payment_channel: 'Wallet',
    delivery_city: 'Mumbai',
    delivery_state: 'Maharashtra',
    gross_value: 24990,
    discount_value: 3748,
    tax_value: 3823,
    shipping_value: 0,
    net_value: 25065
  },
  {
    transaction_id: 'TXN-TM-100005',
    user_code: 'TMU1007',
    transaction_timestamp: '2026-09-27T11:05:10Z',
    transaction_status: 'CONFIRMED',
    payment_channel: 'Cash on Delivery',
    delivery_city: 'Hyderabad',
    delivery_state: 'Telangana',
    gross_value: 54990,
    discount_value: 0,
    tax_value: 9898,
    shipping_value: 200,
    net_value: 65088
  },
  {
    transaction_id: 'TXN-TM-100006',
    user_code: 'TMU1005',
    transaction_timestamp: '2026-09-28T18:40:00Z',
    transaction_status: 'CANCELLED',
    payment_channel: 'UPI',
    delivery_city: 'Kochi',
    delivery_state: 'Kerala',
    gross_value: 82990,
    discount_value: 12448,
    tax_value: 12697,
    shipping_value: 0,
    net_value: 83239
  }
];

export const initialTransactionItems: TechMartTransactionItem[] = [
  {
    line_id: 'LINE-100001-1',
    transaction_id: 'TXN-TM-100001',
    sku: 'TM-LAP-101',
    item_title: 'Predator Helios RTX 4070 Gaming Laptop',
    units: 1,
    unit_price: 139999,
    discount: 16799,
    line_total: 123200
  },
  {
    line_id: 'LINE-100002-1',
    transaction_id: 'TXN-TM-100002',
    sku: 'TM-PHN-201',
    item_title: 'UltraPhone 15 Pro Max 5G (256GB)',
    units: 1,
    unit_price: 129900,
    discount: 7794,
    line_total: 122106
  },
  {
    line_id: 'LINE-100002-2',
    transaction_id: 'TXN-TM-100002',
    sku: 'TM-WER-701',
    item_title: 'WatchUltra Pro GPS Cellular Smartwatch',
    units: 1,
    unit_price: 38990,
    discount: 3696,
    line_total: 35294
  },
  {
    line_id: 'LINE-100003-1',
    transaction_id: 'TXN-TM-100003',
    sku: 'TM-GAM-401',
    item_title: 'Nexus X Next-Gen Gaming Console 1TB',
    units: 1,
    unit_price: 54990,
    discount: 0,
    line_total: 54990
  },
  {
    line_id: 'LINE-100003-2',
    transaction_id: 'TXN-TM-100003',
    sku: 'TM-GAM-402',
    item_title: 'StrikePro RGB Mechanical Gaming Keyboard',
    units: 1,
    unit_price: 8990,
    discount: 1348,
    line_total: 7642
  },
  {
    line_id: 'LINE-100004-1',
    transaction_id: 'TXN-TM-100004',
    sku: 'TM-AUD-301',
    item_title: 'SonicBlast ANC Over-Ear Wireless Headphones',
    units: 1,
    unit_price: 24990,
    discount: 3748,
    line_total: 21242
  },
  {
    line_id: 'LINE-100005-1',
    transaction_id: 'TXN-TM-100005',
    sku: 'TM-GAM-401',
    item_title: 'Nexus X Next-Gen Gaming Console 1TB',
    units: 1,
    unit_price: 54990,
    discount: 0,
    line_total: 54990
  },
  {
    line_id: 'LINE-100006-1',
    transaction_id: 'TXN-TM-100006',
    sku: 'TM-PHN-203',
    item_title: 'Pixel Vision 8 Pro Pure Android',
    units: 1,
    unit_price: 82990,
    discount: 12448,
    line_total: 70542
  }
];
