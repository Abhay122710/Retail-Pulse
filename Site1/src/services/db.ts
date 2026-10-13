import { Product, Customer, Order, OrderItem, Review, OrderStatus, PaymentMethod } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_ORDER_ITEMS,
  INITIAL_REVIEWS,
} from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'shoppulse_products_v1',
  CUSTOMERS: 'shoppulse_customers_v1',
  ORDERS: 'shoppulse_orders_v1',
  ORDER_ITEMS: 'shoppulse_order_items_v1',
  REVIEWS: 'shoppulse_reviews_v1',
  CART: 'shoppulse_cart_v1',
  AUTH: 'shoppulse_auth_user_v1',
};

const INDIAN_CITIES = [
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
  { city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  { city: 'Dehradun', state: 'Uttarakhand', pincode: '248001' },
  { city: 'Chandigarh', state: 'Punjab', pincode: '160017' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
];

const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Credit/Debit Card', 'Cash on Delivery'];
const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

class ShopPulseDB {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(INITIAL_ORDER_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
  }

  // ----------------------- PRODUCTS -----------------------
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.product_id === id);
  }

  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  addProduct(product: Omit<Product, 'product_id' | 'created_at'>): Product {
    const products = this.getProducts();
    const newId = `P${100 + products.length + 1}`;
    const newProduct: Product = {
      ...product,
      product_id: newId,
      created_at: new Date().toISOString(),
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(updated: Product) {
    const products = this.getProducts().map((p) => (p.product_id === updated.product_id ? updated : p));
    this.saveProducts(products);
  }

  deleteProduct(id: string) {
    const products = this.getProducts().filter((p) => p.product_id !== id);
    this.saveProducts(products);
  }

  // ----------------------- CUSTOMERS -----------------------
  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.customer_id === id);
  }

  saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  addCustomer(customer: Omit<Customer, 'customer_id' | 'registration_date'>): Customer {
    const customers = this.getCustomers();
    const newId = `C${1000 + customers.length + 1}`;
    const newCustomer: Customer = {
      ...customer,
      customer_id: newId,
      registration_date: new Date().toISOString(),
    };
    customers.unshift(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  }

  updateCustomer(updated: Customer) {
    const customers = this.getCustomers().map((c) => (c.customer_id === updated.customer_id ? updated : c));
    this.saveCustomers(customers);
  }

  deleteCustomer(id: string) {
    const customers = this.getCustomers().filter((c) => c.customer_id !== id);
    this.saveCustomers(customers);
  }

  // ----------------------- ORDERS & ORDER ITEMS -----------------------
  getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  getOrderItems(): OrderItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS);
    return data ? JSON.parse(data) : [];
  }

  getOrderById(orderId: string): { order: Order; items: OrderItem[] } | undefined {
    const orders = this.getOrders();
    const items = this.getOrderItems();
    const order = orders.find((o) => o.order_id === orderId);
    if (!order) return undefined;
    const orderItems = items.filter((i) => i.order_id === orderId);
    return { order, items: orderItems };
  }

  saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  saveOrderItems(items: OrderItem[]) {
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(items));
  }

  createOrder(
    customerId: string,
    shippingCity: string,
    shippingState: string,
    paymentMethod: PaymentMethod,
    cartItems: { product: Product; quantity: number }[]
  ): Order {
    const orders = this.getOrders();
    const allItems = this.getOrderItems();

    const orderNum = 10000 + orders.length + 1;
    const orderId = `ORD-${orderNum}`;
    const now = new Date().toISOString();

    let subtotal = 0;
    let totalDiscount = 0;

    const newOrderItems: OrderItem[] = cartItems.map((ci, index) => {
      const unitPrice = ci.product.price;
      const discAmt = Math.round(unitPrice * (ci.product.discount / 100)) * ci.quantity;
      const itemSubtotal = unitPrice * ci.quantity;
      const itemFinal = itemSubtotal - discAmt;

      subtotal += itemSubtotal;
      totalDiscount += discAmt;

      return {
        order_item_id: `OI-${orderNum}-${index + 1}`,
        order_id: orderId,
        product_id: ci.product.product_id,
        product_name: ci.product.product_name,
        quantity: ci.quantity,
        unit_price: unitPrice,
        discount: discAmt,
        total_price: itemFinal,
      };
    });

    const netSubtotal = subtotal - totalDiscount;
    const tax = Math.round(netSubtotal * 0.18); // 18% GST
    const shippingCost = netSubtotal > 999 ? 0 : 99;
    const totalAmount = netSubtotal + tax + shippingCost;

    const newOrder: Order = {
      order_id: orderId,
      customer_id: customerId,
      order_date: now,
      order_status: 'Confirmed',
      payment_method: paymentMethod,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      subtotal,
      discount: totalDiscount,
      tax,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
    };

    orders.unshift(newOrder);
    allItems.unshift(...newOrderItems);

    this.saveOrders(orders);
    this.saveOrderItems(allItems);

    // Deduct stock quantity
    const products = this.getProducts();
    cartItems.forEach((ci) => {
      const p = products.find((prod) => prod.product_id === ci.product.product_id);
      if (p) {
        p.stock_quantity = Math.max(0, p.stock_quantity - ci.quantity);
      }
    });
    this.saveProducts(products);

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const orders = this.getOrders().map((o) => (o.order_id === orderId ? { ...o, order_status: status } : o));
    this.saveOrders(orders);
  }

  deleteOrder(orderId: string) {
    const orders = this.getOrders().filter((o) => o.order_id !== orderId);
    const items = this.getOrderItems().filter((i) => i.order_id !== orderId);
    this.saveOrders(orders);
    this.saveOrderItems(items);
  }

  // ----------------------- REVIEWS -----------------------
  getReviews(): Review[] {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return data ? JSON.parse(data) : [];
  }

  getReviewsByProductId(productId: string): Review[] {
    return this.getReviews().filter((r) => r.product_id === productId);
  }

  saveReviews(reviews: Review[]) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }

  addReview(review: Omit<Review, 'review_id' | 'review_date'>): Review {
    const reviews = this.getReviews();
    const newId = `REV-${500 + reviews.length + 1}`;
    const newReview: Review = {
      ...review,
      review_id: newId,
      review_date: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    this.saveReviews(reviews);

    // Update product average rating & review count
    const prodReviews = reviews.filter((r) => r.product_id === review.product_id);
    const avgRating = Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1));

    const products = this.getProducts();
    const p = products.find((prod) => prod.product_id === review.product_id);
    if (p) {
      p.rating = avgRating;
      p.review_count = prodReviews.length;
      this.saveProducts(products);
    }

    return newReview;
  }

  // ----------------------- DEMO DATA GENERATOR -----------------------
  generateDemoOrders(count: number): { ordersGenerated: number; itemsGenerated: number } {
    let customers = this.getCustomers();
    const products = this.getProducts();

    if (products.length === 0) return { ordersGenerated: 0, itemsGenerated: 0 };

    // Ensure we have at least 15 customers for realistic distribution
    if (customers.length < 15) {
      const extraFirstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Ishaan', 'Kabir', 'Rohan', 'Diya', 'Ananya', 'Sanya', 'Meera', 'Riya', 'Kavya'];
      const extraLastNames = ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Joshi', 'Rao', 'Nair', 'Kulkarni', 'Reddy', 'Chopra', 'Malhotra'];
      
      for (let i = customers.length; i < 15; i++) {
        const fn = extraFirstNames[i % extraFirstNames.length];
        const ln = extraLastNames[i % extraLastNames.length];
        const loc = INDIAN_CITIES[i % INDIAN_CITIES.length];
        const newCust: Customer = {
          customer_id: `C${1000 + i + 1}`,
          name: `${fn} ${ln}`,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
          phone: `+91 ${Math.floor(90000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
          city: loc.city,
          state: loc.state,
          pincode: loc.pincode,
          registration_date: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
        };
        customers.push(newCust);
      }
      this.saveCustomers(customers);
    }

    const existingOrders = this.getOrders();
    const existingItems = this.getOrderItems();

    let orderCounter = existingOrders.length + 10001;
    let itemCounter = existingItems.length + 50001;

    const newOrders: Order[] = [];
    const newItems: OrderItem[] = [];

    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const location = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
      const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
      
      // Random date within past 90 days
      const randomTime = now - Math.floor(Math.random() * ninetyDaysMs);
      const orderDate = new Date(randomTime).toISOString();

      // Weighted status distribution (mostly Delivered or Shipped)
      const randStatus = Math.random();
      let status: OrderStatus = 'Delivered';
      if (randStatus < 0.55) status = 'Delivered';
      else if (randStatus < 0.75) status = 'Shipped';
      else if (randStatus < 0.85) status = 'Processing';
      else if (randStatus < 0.93) status = 'Confirmed';
      else status = 'Cancelled';

      const orderId = `ORD-${orderCounter++}`;

      // Pick 1 to 4 distinct products
      const itemQuantity = Math.floor(Math.random() * 3) + 1;
      const selectedProducts: Product[] = [];
      const tempProds = [...products];

      for (let k = 0; k < itemQuantity && tempProds.length > 0; k++) {
        const idx = Math.floor(Math.random() * tempProds.length);
        selectedProducts.push(tempProds.splice(idx, 1)[0]);
      }

      let orderSubtotal = 0;
      let orderDiscount = 0;

      selectedProducts.forEach((p) => {
        const qty = Math.floor(Math.random() * 2) + 1;
        const unitPrice = p.price;
        const discAmt = Math.round(unitPrice * (p.discount / 100)) * qty;
        const itemSubtotal = unitPrice * qty;
        const itemFinal = itemSubtotal - discAmt;

        orderSubtotal += itemSubtotal;
        orderDiscount += discAmt;

        newItems.push({
          order_item_id: `OI-${itemCounter++}`,
          order_id: orderId,
          product_id: p.product_id,
          product_name: p.product_name,
          quantity: qty,
          unit_price: unitPrice,
          discount: discAmt,
          total_price: itemFinal,
        });
      });

      const netSubtotal = orderSubtotal - orderDiscount;
      const tax = Math.round(netSubtotal * 0.18);
      const shippingCost = netSubtotal > 999 ? 0 : 99;
      const totalAmount = netSubtotal + tax + shippingCost;

      newOrders.push({
        order_id: orderId,
        customer_id: customer.customer_id,
        order_date: orderDate,
        order_status: status,
        payment_method: paymentMethod,
        shipping_city: location.city,
        shipping_state: location.state,
        subtotal: orderSubtotal,
        discount: orderDiscount,
        tax,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
      });
    }

    const allOrders = [...newOrders, ...existingOrders];
    const allItems = [...newItems, ...existingItems];

    this.saveOrders(allOrders);
    this.saveOrderItems(allItems);

    return { ordersGenerated: newOrders.length, itemsGenerated: newItems.length };
  }

  // ----------------------- DATA QUALITY SIMULATOR -----------------------
  generateDefect(defectType: 'missing_values' | 'duplicate_records' | 'invalid_quantity' | 'invalid_price' | 'invalid_date'): string {
    const orders = this.getOrders();
    const items = this.getOrderItems();
    const products = this.getProducts();

    if (orders.length === 0) return 'No orders found to corrupt.';

    if (defectType === 'missing_values') {
      // Set empty/null city & state for 3 random orders
      const targetOrders = orders.slice(0, 3);
      targetOrders.forEach((o) => {
        o.shipping_city = '';
        o.shipping_state = '';
        o.defect_type = 'missing_values';
      });
      this.saveOrders(orders);
      return 'Injected missing shipping city/state into 3 order records.';
    }

    if (defectType === 'duplicate_records') {
      // Duplicate the first order record
      const clone = { ...orders[0], order_id: orders[0].order_id, defect_type: 'duplicate_record' };
      orders.unshift(clone);
      this.saveOrders(orders);
      return `Created duplicate order record for ${orders[0].order_id}.`;
    }

    if (defectType === 'invalid_quantity') {
      // Set negative or zero quantity on order item
      if (items.length > 0) {
        items[0].quantity = -2;
        items[0].total_price = -500;
        this.saveOrderItems(items);
        return `Injected invalid quantity (-2) into order item ${items[0].order_item_id}.`;
      }
    }

    if (defectType === 'invalid_price') {
      // Set negative price on product
      if (products.length > 0) {
        products[0].price = -999;
        products[0].final_price = -999;
        this.saveProducts(products);
        return `Injected negative price (-₹999) into product ${products[0].product_id}.`;
      }
    }

    if (defectType === 'invalid_date') {
      // Set invalid date string or far future date
      if (orders.length > 0) {
        orders[0].order_date = 'INVALID_DATE_2099_99_99';
        orders[0].defect_type = 'invalid_date';
        this.saveOrders(orders);
        return `Injected invalid date string into order ${orders[0].order_id}.`;
      }
    }

    return 'Simulation completed.';
  }

  // ----------------------- RESET DATABASE -----------------------
  resetDatabase() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(INITIAL_ORDER_ITEMS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
}

export const db = new ShopPulseDB();
