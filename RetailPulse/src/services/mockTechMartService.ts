import type { SourceSummary, TechMartRecord, SourceInsights } from '../types';

export const techMartSummary: SourceSummary = {
  id: 'TechMart',
  name: 'TechMart',
  type: 'Electronics E-Commerce Platform',
  description: 'High-tech consumer electronics and hardware platform with transactions, inventory SKU logs, and tech specs.',
  availableRecords: 18920,
  dataAvailable: ['Users', 'Products', 'Transactions', 'Transaction Items', 'Inventory', 'Reviews'],
  status: 'Available',
  icon: 'Cpu',
  primaryColor: '#00F0FF'
};

export const mockTechMartRecords: TechMartRecord[] = [
  { id: '1', transactionId: 'TM-9901', user: 'tech_guru99', sku: 'TM-AUD-001', product: 'Sony WH-1000XM5 Wireless ANC', units: 1, grossValue: 29990, netValue: 26991, status: 'Completed' },
  { id: '2', transactionId: 'TM-9902', user: 'sarah_m', sku: 'TM-LAP-042', product: 'Apple MacBook Air M3 15"', units: 1, grossValue: 134900, netValue: 124900, status: 'Completed' },
  { id: '3', transactionId: 'TM-9903', user: 'alex_dev', sku: 'TM-DIS-012', product: 'Dell UltraSharp 27" 4K USB-C Hub', units: 2, grossValue: 96000, netValue: 88000, status: 'Pending' },
  { id: '4', transactionId: 'TM-9904', user: 'priya_tech', sku: 'TM-PHN-088', product: 'Samsung Galaxy S24 Ultra 512GB', units: 1, grossValue: 129999, netValue: 119999, status: 'Completed' },
  { id: '5', transactionId: 'TM-9905', user: 'david_k', sku: 'TM-ACC-005', product: 'Logitech MX Master 3S Wireless Mouse', units: 1, grossValue: 9995, netValue: 8995, status: 'Completed' },
  { id: '6', transactionId: 'TM-9906', user: 'rachel_b', sku: 'TM-AUD-009', product: 'Bose QuietComfort Ultra Headphones', units: 1, grossValue: 35900, netValue: 32900, status: 'Refunded' },
  { id: '7', transactionId: 'TM-9907', user: 'sam_wilson', sku: 'TM-GAM-019', product: 'Sony PlayStation 5 Slim 1TB', units: 1, grossValue: 54990, netValue: 49990, status: 'Completed' },
  { id: '8', transactionId: 'TM-9908', user: 'lisa_v', sku: 'TM-ACC-021', product: 'Keychron Q1 Pro Wireless Mechanical', units: 1, grossValue: 17990, netValue: 16191, status: 'Failed' },
  { id: '9', transactionId: 'TM-9909', user: 'karan_c', sku: 'TM-DIS-018', product: 'LG C3 55" OLED evo 4K Smart TV', units: 1, grossValue: 144990, netValue: 132990, status: 'Completed' },
  { id: '10', transactionId: 'TM-9910', user: 'megha_s', sku: 'TM-LAP-050', product: 'ASUS ROG Zephyrus G16 Gaming Laptop', units: 1, grossValue: 189990, netValue: 175990, status: 'Completed' },
  { id: '11', transactionId: 'TM-9911', user: 'varun_t', sku: 'TM-PHN-095', product: 'Google Pixel 8 Pro 256GB', units: 1, grossValue: 106999, netValue: 98999, status: 'Completed' },
  { id: '12', transactionId: 'TM-9912', user: 'tanvi_r', sku: 'TM-AUD-015', product: 'Sennheiser Momentum 4 Wireless', units: 1, grossValue: 27990, netValue: 24990, status: 'Pending' }
];

export const techMartInsights: SourceInsights = {
  source: 'TechMart',
  totalRevenue: '₹42.5L',
  totalOrdersOrTx: '6,190',
  topProduct: 'Sony WH-1000XM5',
  topCategoryOrDept: 'Audio & Headphones',
  avgValue: '₹6,865',
  topLocationOrStock: '94% In-Stock',
  kpis: [
    { title: 'Total Revenue', value: '₹42.5L', subtext: '+18.7% vs last month', change: '+18.7%', isPositive: true, iconName: 'IndianRupee' },
    { title: 'Total Transactions', value: '6,190', subtext: '+11.3% transaction rate', change: '+11.3%', isPositive: true, iconName: 'Activity' },
    { title: 'Top Product', value: 'Sony WH-1000XM5', subtext: '840 units fulfilled', iconName: 'Cpu' },
    { title: 'Top Department', value: 'Audio & Headphones', subtext: '38% revenue share', iconName: 'Headphones' },
    { title: 'Avg Tx Value', value: '₹6,865', subtext: '+6.5% high margin order', change: '+6.5%', isPositive: true, iconName: 'TrendingUp' },
    { title: 'Inventory Stock', value: '94% In-Stock', subtext: '18,920 SKUs synced', iconName: 'CheckCircle2' }
  ],
  revenueTrend: [
    { period: 'Mon', revenue: 580000, count: 820 },
    { period: 'Tue', revenue: 640000, count: 910 },
    { period: 'Wed', revenue: 610000, count: 870 },
    { period: 'Thu', revenue: 720000, count: 1040 },
    { period: 'Fri', revenue: 850000, count: 1210 },
    { period: 'Sat', revenue: 920000, count: 1340 },
    { period: 'Sun', revenue: 780000, count: 1100 }
  ],
  categoryBreakdown: [
    { name: 'Audio & Headphones', revenue: 1615000, count: 2352, percentage: 38, color: '#00F0FF' },
    { name: 'Laptops & PCs', revenue: 1275000, count: 1857, percentage: 30, color: '#3B82F6' },
    { name: 'Mobile Phones', revenue: 850000, count: 1238, percentage: 20, color: '#A068FF' },
    { name: 'Accessories', revenue: 510000, count: 743, percentage: 12, color: '#10B981' }
  ],
  topProducts: [
    { rank: 1, name: 'Sony WH-1000XM5 ANC', categoryOrDept: 'Audio & Headphones', unitsSold: 840, revenue: 25191600 },
    { rank: 2, name: 'MacBook Air M3 15"', categoryOrDept: 'Laptops & PCs', unitsSold: 280, revenue: 37772000 },
    { rank: 3, name: 'Samsung Galaxy S24 Ultra', categoryOrDept: 'Mobile Phones', unitsSold: 310, revenue: 40299690 },
    { rank: 4, name: 'Logitech MX Master 3S', categoryOrDept: 'Accessories', unitsSold: 1150, revenue: 11494250 },
    { rank: 5, name: 'PlayStation 5 Slim 1TB', categoryOrDept: 'Gaming', unitsSold: 420, revenue: 23095800 }
  ],
  statusDistribution: [
    { status: 'Completed', count: 5199, percentage: 84, color: '#10B981' },
    { status: 'Pending', count: 495, percentage: 8, color: '#F59E0B' },
    { status: 'Refunded', count: 310, percentage: 5, color: '#3B82F6' },
    { status: 'Failed', count: 186, percentage: 3, color: '#EF4444' }
  ]
};

export const mockTechMartService = {
  getSummary: () => techMartSummary,
  getRecords: () => mockTechMartRecords,
  getInsights: () => techMartInsights
};
