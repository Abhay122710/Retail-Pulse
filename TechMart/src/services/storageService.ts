import type { 
  TechMartProduct, 
  TechMartCustomer, 
  TechMartTransaction, 
  TechMartTransactionItem, 
  TechMartInventory, 
  TechMartReview, 
  CartItem,
  AnomalyFlags
} from '../types';

import { initialProducts } from '../data/initialProducts';
import { initialCustomers } from '../data/initialCustomers';
import { initialInventory } from '../data/initialInventory';
import { initialTransactions, initialTransactionItems } from '../data/initialTransactions';
import { initialReviews } from '../data/initialReviews';

const STORAGE_KEYS = {
  PRODUCTS: 'techmart_products_v1',
  CUSTOMERS: 'techmart_customers_v1',
  INVENTORY: 'techmart_inventory_v1',
  TRANSACTIONS: 'techmart_transactions_v1',
  TRANSACTION_ITEMS: 'techmart_transaction_items_v1',
  REVIEWS: 'techmart_reviews_v1',
  CART: 'techmart_cart_v1',
  WISHLIST: 'techmart_wishlist_v1',
  ACTIVE_USER: 'techmart_active_user_v1',
  ANOMALIES: 'techmart_anomalies_v1'
};

const defaultAnomalies: AnomalyFlags = {
  missing_values: false,
  duplicate_transactions: false,
  invalid_price: false,
  invalid_quantity: false,
  invalid_sku: false,
  invalid_date: false,
  inventory_mismatch: false
};

export const storageService = {
  getProducts(): TechMartProduct[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      this.saveProducts(initialProducts);
      return initialProducts;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialProducts;
    }
  },

  saveProducts(products: TechMartProduct[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers(): TechMartCustomer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!data) {
      this.saveCustomers(initialCustomers);
      return initialCustomers;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialCustomers;
    }
  },

  saveCustomers(customers: TechMartCustomer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getInventory(): TechMartInventory[] {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!data) {
      this.saveInventory(initialInventory);
      return initialInventory;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialInventory;
    }
  },

  saveInventory(inventory: TechMartInventory[]): void {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  },

  getTransactions(): TechMartTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      this.saveTransactions(initialTransactions);
      return initialTransactions;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialTransactions;
    }
  },

  saveTransactions(transactions: TechMartTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getTransactionItems(): TechMartTransactionItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTION_ITEMS);
    if (!data) {
      this.saveTransactionItems(initialTransactionItems);
      return initialTransactionItems;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialTransactionItems;
    }
  },

  saveTransactionItems(items: TechMartTransactionItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTION_ITEMS, JSON.stringify(items));
  },

  getReviews(): TechMartReview[] {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!data) {
      this.saveReviews(initialReviews);
      return initialReviews;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialReviews;
    }
  },

  saveReviews(reviews: TechMartReview[]): void {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  },

  getCart(): CartItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  getWishlist(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveWishlist(skuList: string[]): void {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(skuList));
  },

  getActiveUserCode(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || 'TMU1001';
  },

  setActiveUserCode(user_code: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, user_code);
  },

  getAnomalies(): AnomalyFlags {
    const data = localStorage.getItem(STORAGE_KEYS.ANOMALIES);
    if (!data) return defaultAnomalies;
    try {
      return JSON.parse(data);
    } catch {
      return defaultAnomalies;
    }
  },

  saveAnomalies(anomalies: AnomalyFlags): void {
    localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(anomalies));
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTION_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.ANOMALIES);
    
    this.saveProducts(initialProducts);
    this.saveCustomers(initialCustomers);
    this.saveInventory(initialInventory);
    this.saveTransactions(initialTransactions);
    this.saveTransactionItems(initialTransactionItems);
    this.saveReviews(initialReviews);
    this.saveAnomalies(defaultAnomalies);
  }
};
