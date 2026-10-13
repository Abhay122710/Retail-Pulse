import type { 
  TechMartProduct, 
  TechMartTransaction, 
  TechMartTransactionItem, 
  TransactionStatus,
  PaymentChannel,
  AnomalyFlags
} from '../types';

import { storageService } from './storageService';

const PAYMENT_CHANNELS: PaymentChannel[] = ['UPI', 'Card', 'Net Banking', 'Cash on Delivery', 'Wallet'];
const TRANSACTION_STATUSES: TransactionStatus[] = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export const generatorService = {
  generateDemoTransactions(count: number): { 
    newTransactions: TechMartTransaction[]; 
    newItems: TechMartTransactionItem[] 
  } {
    const products = storageService.getProducts();
    const customers = storageService.getCustomers();
    const inventory = storageService.getInventory();

    const existingTxns = storageService.getTransactions();
    const existingItems = storageService.getTransactionItems();

    let nextTxnId = 100000 + existingTxns.length + 1;
    let nextLineId = existingItems.length + 1;

    const newTransactions: TechMartTransaction[] = [];
    const newItems: TechMartTransactionItem[] = [];

    // Helper random choice
    const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const startDate = new Date('2026-01-01T00:00:00Z').getTime();
    const endDate = new Date('2026-09-30T23:59:59Z').getTime();

    for (let i = 0; i < count; i++) {
      const txnId = `TXN-TM-${nextTxnId++}`;
      const customer = getRandom(customers);
      const status = getRandom(TRANSACTION_STATUSES);
      const paymentChannel = getRandom(PAYMENT_CHANNELS);

      const randomTimestamp = new Date(startDate + Math.random() * (endDate - startDate)).toISOString();

      // Pick 1 to 4 distinct items
      const itemSlotsCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts: TechMartProduct[] = [];
      for (let s = 0; s < itemSlotsCount; s++) {
        const prod = getRandom(products);
        if (!selectedProducts.find((p) => p.sku === prod.sku)) {
          selectedProducts.push(prod);
        }
      }

      let gross_value = 0;
      let discount_value = 0;

      selectedProducts.forEach((prod) => {
        const units = Math.floor(Math.random() * 2) + 1;
        const discountPerUnit = prod.discount_percent ? Math.round((prod.unit_price * prod.discount_percent) / 100) : 0;
        const lineTotal = (prod.unit_price - discountPerUnit) * units;

        gross_value += prod.unit_price * units;
        discount_value += discountPerUnit * units;

        newItems.push({
          line_id: `LINE-${txnId.replace('TXN-TM-', '')}-${nextLineId++}`,
          transaction_id: txnId,
          sku: prod.sku,
          item_title: prod.item_title,
          units,
          unit_price: prod.unit_price,
          discount: discountPerUnit * units,
          line_total: lineTotal
        });

        // Deduct inventory stock if confirmed/shipped/delivered
        if (['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(status)) {
          const targetInv = inventory.find((inv) => inv.sku === prod.sku && inv.available_units > units);
          if (targetInv) {
            targetInv.available_units -= units;
            targetInv.last_updated = randomTimestamp;
          }
        }
      });

      const tax_value = Math.round((gross_value - discount_value) * 0.18);
      const shipping_value = gross_value > 50000 ? 0 : 150;
      const net_value = gross_value - discount_value + tax_value + shipping_value;

      newTransactions.push({
        transaction_id: txnId,
        user_code: customer.user_code,
        transaction_timestamp: randomTimestamp,
        transaction_status: status,
        payment_channel: paymentChannel,
        delivery_city: customer.city,
        delivery_state: customer.state,
        gross_value,
        discount_value,
        tax_value,
        shipping_value,
        net_value
      });
    }

    const updatedTransactions = [...existingTxns, ...newTransactions];
    const updatedItems = [...existingItems, ...newItems];

    storageService.saveTransactions(updatedTransactions);
    storageService.saveTransactionItems(updatedItems);
    storageService.saveInventory(inventory);

    return { newTransactions, newItems };
  },

  // DATA QUALITY SIMULATOR ANOMALY GENERATORS
  injectAnomaly(anomalyType: keyof AnomalyFlags): AnomalyFlags {
    const currentFlags = storageService.getAnomalies();
    currentFlags[anomalyType] = true;
    storageService.saveAnomalies(currentFlags);

    const transactions = storageService.getTransactions();
    const items = storageService.getTransactionItems();
    const inventory = storageService.getInventory();

    switch (anomalyType) {
      case 'missing_values':
        // Set user_code or payment_channel or delivery_city to empty string / null
        if (transactions.length > 0) {
          transactions[0].user_code = '';
          transactions[0].payment_channel = '' as any;
          transactions[1].delivery_city = null as any;
        }
        if (items.length > 0) {
          items[0].sku = '';
        }
        break;

      case 'duplicate_transactions':
        // Clone transaction 0 with duplicate transaction_id
        if (transactions.length > 0) {
          const dup = { ...transactions[0], net_value: transactions[0].net_value + 500 };
          transactions.push(dup);
        }
        break;

      case 'invalid_price':
        // Inject negative or zero unit price
        if (items.length > 0) {
          items[0].unit_price = -4999;
          items[0].line_total = -4999;
        }
        if (transactions.length > 0) {
          transactions[0].gross_value = -10000;
        }
        break;

      case 'invalid_quantity':
        // Inject negative units
        if (items.length > 0) {
          items[0].units = -5;
        }
        break;

      case 'invalid_sku':
        // Inject unregistered SKU
        if (items.length > 0) {
          items[0].sku = 'TM-INVALID-9999-CORRUPTED';
          items[0].item_title = 'UNKNOWN_CORRUPTED_ELECTRONIC_DEVICE';
        }
        break;

      case 'invalid_date':
        // Inject malformed date
        if (transactions.length > 0) {
          transactions[0].transaction_timestamp = '2026-99-99T99:99:99Z_CORRUPT';
        }
        break;

      case 'inventory_mismatch':
        // Inject negative stock or high discrepancy
        if (inventory.length > 0) {
          inventory[0].available_units = -45;
          inventory[1].available_units = 99999;
        }
        break;
    }

    storageService.saveTransactions(transactions);
    storageService.saveTransactionItems(items);
    storageService.saveInventory(inventory);

    return currentFlags;
  },

  resetAllDemoData(): void {
    storageService.resetAllData();
  }
};
