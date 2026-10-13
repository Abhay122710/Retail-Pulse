import { storageService } from './storageService';

export const apiService = {
  // Simulated REST Endpoints
  getUsersAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getCustomers().length,
      data: storageService.getCustomers()
    };
  },

  getProductsAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getProducts().length,
      data: storageService.getProducts()
    };
  },

  getTransactionsAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getTransactions().length,
      data: storageService.getTransactions()
    };
  },

  getTransactionItemsAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getTransactionItems().length,
      data: storageService.getTransactionItems()
    };
  },

  getInventoryAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getInventory().length,
      data: storageService.getInventory()
    };
  },

  getReviewsAPI() {
    return {
      status: 200,
      source: 'TechMart-ECommerce-Core-Database',
      timestamp: new Date().toISOString(),
      count: storageService.getReviews().length,
      data: storageService.getReviews()
    };
  },

  // CSV Generator Helper
  convertToCSV(objArray: any[]): string {
    if (!objArray || !objArray.length) return '';
    const headers = Object.keys(objArray[0]);
    const csvRows: string[] = [];
    csvRows.push(headers.join(','));

    objArray.forEach((item) => {
      const values = headers.map((header) => {
        let val = item[header];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val).replace(/"/g, '""');
        }
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  },

  downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportUsersCSV(): void {
    const csv = this.convertToCSV(storageService.getCustomers());
    this.downloadCSV('techmart_users.csv', csv);
  },

  exportProductsCSV(): void {
    const csv = this.convertToCSV(storageService.getProducts());
    this.downloadCSV('techmart_products.csv', csv);
  },

  exportTransactionsCSV(): void {
    const csv = this.convertToCSV(storageService.getTransactions());
    this.downloadCSV('techmart_transactions.csv', csv);
  },

  exportTransactionItemsCSV(): void {
    const csv = this.convertToCSV(storageService.getTransactionItems());
    this.downloadCSV('techmart_transaction_items.csv', csv);
  },

  exportInventoryCSV(): void {
    const csv = this.convertToCSV(storageService.getInventory());
    this.downloadCSV('techmart_inventory.csv', csv);
  },

  exportReviewsCSV(): void {
    const csv = this.convertToCSV(storageService.getReviews());
    this.downloadCSV('techmart_reviews.csv', csv);
  }
};
