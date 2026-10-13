import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  TechMartProduct, 
  TechMartCustomer, 
  TechMartTransaction, 
  TechMartTransactionItem, 
  TechMartInventory, 
  TechMartReview, 
  CartItem, 
  DepartmentType,
  PaymentChannel,
  AnomalyFlags
} from '../types';

import { storageService } from '../services/storageService';
import { generatorService } from '../services/generatorService';
import { connectorTracker } from '../services/connectorTracker';
import confetti from 'canvas-confetti';

interface AppContextType {
  products: TechMartProduct[];
  customers: TechMartCustomer[];
  transactions: TechMartTransaction[];
  transactionItems: TechMartTransactionItem[];
  inventory: TechMartInventory[];
  reviews: TechMartReview[];
  cart: CartItem[];
  wishlist: string[];
  activeUser: TechMartCustomer;
  anomalies: AnomalyFlags;
  searchQuery: string;
  selectedDepartment: DepartmentType | 'All';
  toastMessage: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedDepartment: (dept: DepartmentType | 'All') => void;
  addToCart: (product: TechMartProduct, units?: number) => void;
  updateCartQuantity: (sku: string, units: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  toggleWishlist: (sku: string) => void;
  setActiveUserCode: (user_code: string) => void;
  createCheckoutOrder: (paymentChannel: PaymentChannel, deliveryCity: string, deliveryState: string) => TechMartTransaction;
  addReview: (sku: string, rating: number, text: string) => void;
  generateBulkTransactions: (count: number) => void;
  triggerAnomaly: (anomalyType: keyof AnomalyFlags) => void;
  resetAllData: () => void;
  showToast: (msg: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<TechMartProduct[]>([]);
  const [customers, setCustomers] = useState<TechMartCustomer[]>([]);
  const [transactions, setTransactions] = useState<TechMartTransaction[]>([]);
  const [transactionItems, setTransactionItems] = useState<TechMartTransactionItem[]>([]);
  const [inventory, setInventory] = useState<TechMartInventory[]>([]);
  const [reviews, setReviews] = useState<TechMartReview[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeUserCode, setActiveUserCodeState] = useState<string>('TMU1001');
  const [anomalies, setAnomalies] = useState<AnomalyFlags>(storageService.getAnomalies());
  
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [selectedDepartment, setSelectedDepartmentState] = useState<DepartmentType | 'All'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setTransactions(storageService.getTransactions());
    setTransactionItems(storageService.getTransactionItems());
    setInventory(storageService.getInventory());
    setReviews(storageService.getReviews());
    setCart(storageService.getCart());
    setWishlist(storageService.getWishlist());
    setActiveUserCodeState(storageService.getActiveUserCode());
    setAnomalies(storageService.getAnomalies());
  };

  useEffect(() => {
    refreshData();
    connectorTracker.trackPageView('Home');
  }, []);

  const activeUser = customers.find((c) => c.user_code === activeUserCode) || customers[0] || {
    user_code: 'TMU1001',
    full_name: 'Rahul Sharma',
    email_address: 'rahul.sharma@techmail.in',
    mobile_number: '+91 98765 43210',
    city: 'Noida',
    state: 'Uttar Pradesh',
    postal_code: '201301',
    account_created: '2025-08-14'
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (query.trim().length > 2) {
      const count = products.filter((p) =>
        p.item_title.toLowerCase().includes(query.toLowerCase()) ||
        p.department.toLowerCase().includes(query.toLowerCase())
      ).length;
      connectorTracker.trackSearch(query, count);
    }
  };

  const setSelectedDepartment = (dept: DepartmentType | 'All') => {
    setSelectedDepartmentState(dept);
    connectorTracker.sendEvent('CATEGORY_VIEW', { department: dept });
  };

  const addToCart = (product: TechMartProduct, units: number = 1) => {
    const existing = cart.find((item) => item.product.sku === product.sku);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map((item) =>
        item.product.sku === product.sku ? { ...item, units: item.units + units } : item
      );
    } else {
      updated = [...cart, { product, units }];
    }
    setCart(updated);
    storageService.saveCart(updated);

    // Track Real Event to Connector
    connectorTracker.trackAddToCart(product, units, activeUser.user_code);
    showToast(`Added ${product.item_title} to Cart`);
  };

  const updateCartQuantity = (sku: string, units: number) => {
    if (units <= 0) {
      removeFromCart(sku);
      return;
    }
    const updated = cart.map((item) => (item.product.sku === sku ? { ...item, units } : item));
    setCart(updated);
    storageService.saveCart(updated);
  };

  const removeFromCart = (sku: string) => {
    const updated = cart.filter((item) => item.product.sku !== sku);
    setCart(updated);
    storageService.saveCart(updated);
    connectorTracker.trackRemoveFromCart(sku, 1);
    showToast(`Item removed from Cart`);
  };

  const clearCart = () => {
    setCart([]);
    storageService.saveCart([]);
  };

  const toggleWishlist = (sku: string) => {
    let updated: string[];
    if (wishlist.includes(sku)) {
      updated = wishlist.filter((id) => id !== sku);
      connectorTracker.trackWishlistRemove(sku, activeUser.user_code);
      showToast('Removed from Wishlist');
    } else {
      updated = [...wishlist, sku];
      connectorTracker.trackWishlistAdd(sku, activeUser.user_code);
      showToast('Saved to Wishlist');
    }
    setWishlist(updated);
    storageService.saveWishlist(updated);
  };

  const setActiveUserCode = (code: string) => {
    setActiveUserCodeState(code);
    storageService.setActiveUserCode(code);
    connectorTracker.sendEvent('LOGIN', { user_code: code });
    showToast(`Switched active profile to ${code}`);
  };

  const createCheckoutOrder = (
    paymentChannel: PaymentChannel,
    deliveryCity: string,
    deliveryState: string
  ): TechMartTransaction => {
    const currentTxns = storageService.getTransactions();
    const currentItems = storageService.getTransactionItems();
    const currentInv = storageService.getInventory();

    const txnId = `TXN-TM-${100000 + currentTxns.length + 1}`;
    let gross_value = 0;
    let discount_value = 0;

    const newTxnItems: TechMartTransactionItem[] = [];
    let lineCounter = currentItems.length + 1;

    cart.forEach((cItem) => {
      const prod = cItem.product;
      const discountPerUnit = prod.discount_percent
        ? Math.round((prod.unit_price * prod.discount_percent) / 100)
        : 0;

      const itemDiscountTotal = discountPerUnit * cItem.units;
      const lineTotal = (prod.unit_price - discountPerUnit) * cItem.units;

      gross_value += prod.unit_price * cItem.units;
      discount_value += itemDiscountTotal;

      newTxnItems.push({
        line_id: `LINE-${txnId.replace('TXN-TM-', '')}-${lineCounter++}`,
        transaction_id: txnId,
        sku: prod.sku,
        item_title: prod.item_title,
        units: cItem.units,
        unit_price: prod.unit_price,
        discount: itemDiscountTotal,
        line_total: lineTotal
      });

      const targetInv = currentInv.find((inv) => inv.sku === prod.sku && inv.available_units >= cItem.units);
      if (targetInv) {
        targetInv.available_units -= cItem.units;
        targetInv.last_updated = new Date().toISOString();
      }
    });

    const tax_value = Math.round((gross_value - discount_value) * 0.18);
    const shipping_value = gross_value > 50000 ? 0 : 150;
    const net_value = gross_value - discount_value + tax_value + shipping_value;

    const newTxn: TechMartTransaction = {
      transaction_id: txnId,
      user_code: activeUser.user_code,
      transaction_timestamp: new Date().toISOString(),
      transaction_status: 'CONFIRMED',
      payment_channel: paymentChannel,
      delivery_city: deliveryCity || activeUser.city,
      delivery_state: deliveryState || activeUser.state,
      gross_value,
      discount_value,
      tax_value,
      shipping_value,
      net_value
    };

    const updatedTxns = [newTxn, ...currentTxns];
    const updatedItems = [...newTxnItems, ...currentItems];

    storageService.saveTransactions(updatedTxns);
    storageService.saveTransactionItems(updatedItems);
    storageService.saveInventory(currentInv);
    clearCart();

    // Trigger Real Event to Connector
    connectorTracker.trackOrderCreated(txnId, net_value, paymentChannel, activeUser.user_code);

    refreshData();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    return newTxn;
  };

  const addReview = (sku: string, rating: number, text: string) => {
    const currentReviews = storageService.getReviews();
    const newRev: TechMartReview = {
      review_code: `REV-TM-${8000 + currentReviews.length + 1}`,
      sku,
      user_code: activeUser.user_code,
      rating,
      review_text: text,
      review_timestamp: new Date().toISOString()
    };
    const updated = [newRev, ...currentReviews];
    storageService.saveReviews(updated);
    setReviews(updated);
    connectorTracker.trackReviewSubmitted(sku, rating);
    showToast('Review submitted successfully!');
  };

  const generateBulkTransactions = (count: number) => {
    generatorService.generateDemoTransactions(count);
    refreshData();
    showToast(`Generated ${count} realistic transactions successfully!`);
  };

  const triggerAnomaly = (anomalyType: keyof AnomalyFlags) => {
    const updatedFlags = generatorService.injectAnomaly(anomalyType);
    setAnomalies(updatedFlags);
    refreshData();
    showToast(`Injected anomaly: ${anomalyType.replace('_', ' ').toUpperCase()}`);
  };

  const resetAllData = () => {
    generatorService.resetAllDemoData();
    refreshData();
    showToast('Demo dataset restored to baseline clean state!');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        transactions,
        transactionItems,
        inventory,
        reviews,
        cart,
        wishlist,
        activeUser,
        anomalies,
        searchQuery,
        selectedDepartment,
        toastMessage,
        setSearchQuery,
        setSelectedDepartment,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        setActiveUserCode,
        createCheckoutOrder,
        addReview,
        generateBulkTransactions,
        triggerAnomaly,
        resetAllData,
        showToast,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
