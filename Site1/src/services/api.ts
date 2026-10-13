import { db } from './db';
import { Product, Customer, Order, OrderItem, Review, OrderStatus, PaymentMethod } from '../types';

export const api = {
  // Products API
  getProducts: (): Product[] => db.getProducts(),
  getProductById: (id: string): Product | undefined => db.getProductById(id),
  addProduct: (product: Omit<Product, 'product_id' | 'created_at'>) => db.addProduct(product),
  updateProduct: (product: Product) => db.updateProduct(product),
  deleteProduct: (id: string) => db.deleteProduct(id),

  // Customers API
  getCustomers: (): Customer[] => db.getCustomers(),
  getCustomerById: (id: string): Customer | undefined => db.getCustomerById(id),
  addCustomer: (customer: Omit<Customer, 'customer_id' | 'registration_date'>) => db.addCustomer(customer),
  updateCustomer: (customer: Customer) => db.updateCustomer(customer),
  deleteCustomer: (id: string) => db.deleteCustomer(id),

  // Orders API
  getOrders: (): Order[] => db.getOrders(),
  getOrderById: (id: string) => db.getOrderById(id),
  createOrder: (
    customerId: string,
    shippingCity: string,
    shippingState: string,
    paymentMethod: PaymentMethod,
    cartItems: { product: Product; quantity: number }[]
  ) => db.createOrder(customerId, shippingCity, shippingState, paymentMethod, cartItems),
  updateOrderStatus: (orderId: string, status: OrderStatus) => db.updateOrderStatus(orderId, status),
  deleteOrder: (orderId: string) => db.deleteOrder(orderId),

  // Order Items API
  getOrderItems: (): OrderItem[] => db.getOrderItems(),

  // Reviews API
  getReviews: (): Review[] => db.getReviews(),
  getReviewsByProductId: (productId: string) => db.getReviewsByProductId(productId),
  addReview: (review: Omit<Review, 'review_id' | 'review_date'>) => db.addReview(review),

  // Generator & Simulator
  generateDemoOrders: (count: number) => db.generateDemoOrders(count),
  generateDefect: (defectType: 'missing_values' | 'duplicate_records' | 'invalid_quantity' | 'invalid_price' | 'invalid_date') =>
    db.generateDefect(defectType),
  resetDatabase: () => db.resetDatabase(),
};

// CSV Export Utility
export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean | undefined)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === undefined || cell === null) return '""';
          const str = String(cell).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCustomersCSV() {
  const customers = api.getCustomers();
  const headers = ['customer_id', 'name', 'email', 'phone', 'city', 'state', 'pincode', 'registration_date'];
  const rows = customers.map((c) => [c.customer_id, c.name, c.email, c.phone, c.city, c.state, c.pincode, c.registration_date]);
  downloadCSV('shoppulse_customers', headers, rows);
}

export function exportProductsCSV() {
  const products = api.getProducts();
  const headers = [
    'product_id',
    'product_name',
    'category',
    'subcategory',
    'brand',
    'price',
    'discount',
    'final_price',
    'stock_quantity',
    'rating',
    'review_count',
    'image_url',
    'created_at',
  ];
  const rows = products.map((p) => [
    p.product_id,
    p.product_name,
    p.category,
    p.subcategory,
    p.brand,
    p.price,
    p.discount,
    p.final_price,
    p.stock_quantity,
    p.rating,
    p.review_count,
    p.image_url,
    p.created_at,
  ]);
  downloadCSV('shoppulse_products', headers, rows);
}

export function exportOrdersCSV() {
  const orders = api.getOrders();
  const headers = [
    'order_id',
    'customer_id',
    'order_date',
    'order_status',
    'payment_method',
    'shipping_city',
    'shipping_state',
    'subtotal',
    'discount',
    'tax',
    'shipping_cost',
    'total_amount',
    'defect_type',
  ];
  const rows = orders.map((o) => [
    o.order_id,
    o.customer_id,
    o.order_date,
    o.order_status,
    o.payment_method,
    o.shipping_city,
    o.shipping_state,
    o.subtotal,
    o.discount,
    o.tax,
    o.shipping_cost,
    o.total_amount,
    o.defect_type || '',
  ]);
  downloadCSV('shoppulse_orders', headers, rows);
}

export function exportOrderItemsCSV() {
  const items = api.getOrderItems();
  const headers = ['order_item_id', 'order_id', 'product_id', 'product_name', 'quantity', 'unit_price', 'discount', 'total_price'];
  const rows = items.map((i) => [
    i.order_item_id,
    i.order_id,
    i.product_id,
    i.product_name,
    i.quantity,
    i.unit_price,
    i.discount,
    i.total_price,
  ]);
  downloadCSV('shoppulse_order_items', headers, rows);
}

export function exportReviewsCSV() {
  const reviews = api.getReviews();
  const headers = ['review_id', 'product_id', 'customer_id', 'customer_name', 'rating', 'review_text', 'review_date'];
  const rows = reviews.map((r) => [r.review_id, r.product_id, r.customer_id, r.customer_name, r.rating, r.review_text, r.review_date]);
  downloadCSV('shoppulse_reviews', headers, rows);
}
