export type ProductCategory = 'Electronics' | 'Fashion' | 'Home & Kitchen' | 'Sports' | 'Accessories';

export interface Product {
  product_id: string;
  product_name: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  price: number;
  discount: number; // percentage
  final_price: number;
  stock_quantity: number;
  brand: string;
  rating: number;
  review_count: number;
  image_url: string;
  created_at: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  city: string;
  state: string;
  pincode: string;
  registration_date: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Credit/Debit Card' | 'Cash on Delivery';

export interface Order {
  order_id: string;
  customer_id: string;
  order_date: string;
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  shipping_city: string;
  shipping_state: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  defect_type?: string; // Optional tag for Data Simulator (e.g., missing_value, duplicate, invalid_date)
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface Review {
  review_id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}
