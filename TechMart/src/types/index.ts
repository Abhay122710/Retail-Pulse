export type DepartmentType = 
  | 'Laptops'
  | 'Smartphones'
  | 'Audio'
  | 'Gaming'
  | 'Computer Accessories'
  | 'Smart Home'
  | 'Wearables';

export type TransactionStatus = 
  | 'INITIATED'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentChannel = 
  | 'UPI'
  | 'Card'
  | 'Net Banking'
  | 'Cash on Delivery'
  | 'Wallet';

export type WarehouseCode = 'WH-NCR' | 'WH-NORTH' | 'WH-WEST';

export interface TechMartProduct {
  sku: string;
  item_title: string;
  department: DepartmentType;
  unit_price: number;
  available_units: number;
  brand_name: string;
  product_specifications: Record<string, string>;
  warranty_months: number;
  rating_score: number;
  total_reviews: number;
  image_url: string;
  discount_percent?: number;
  is_featured?: boolean;
  is_trending?: boolean;
}

export interface TechMartCustomer {
  user_code: string;
  full_name: string;
  email_address: string;
  mobile_number: string;
  city: string;
  state: string;
  postal_code: string;
  account_created: string;
}

export interface TechMartTransaction {
  transaction_id: string;
  user_code: string;
  transaction_timestamp: string;
  transaction_status: TransactionStatus;
  payment_channel: PaymentChannel;
  delivery_city: string;
  delivery_state: string;
  gross_value: number;
  discount_value: number;
  tax_value: number;
  shipping_value: number;
  net_value: number;
}

export interface TechMartTransactionItem {
  line_id: string;
  transaction_id: string;
  sku: string;
  item_title: string;
  units: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface TechMartInventory {
  inventory_id: string;
  sku: string;
  warehouse_code: WarehouseCode;
  available_units: number;
  reserved_units: number;
  reorder_level: number;
  last_updated: string;
}

export interface TechMartReview {
  review_code: string;
  sku: string;
  user_code: string;
  rating: number;
  review_text: string;
  review_timestamp: string;
}

export interface CartItem {
  product: TechMartProduct;
  units: number;
}

export interface AnomalyFlags {
  missing_values: boolean;
  duplicate_transactions: boolean;
  invalid_price: boolean;
  invalid_quantity: boolean;
  invalid_sku: boolean;
  invalid_date: boolean;
  inventory_mismatch: boolean;
}
