import type { SourceSummary, ShopPulseRecord, SourceInsights } from '../types';

export const shopPulseSummary: SourceSummary = {
  id: 'ShopPulse',
  name: 'ShopPulse',
  type: 'General E-Commerce Platform',
  description: 'Multi-category consumer retail marketplace with order, customer, product, and review streams.',
  availableRecords: 12450,
  dataAvailable: ['Customers', 'Products', 'Orders', 'Order Items', 'Reviews'],
  status: 'Available',
  icon: 'ShoppingBag',
  primaryColor: '#A068FF'
};

export const mockShopPulseRecords: ShopPulseRecord[] = [
  { id: '1', orderId: 'SP-10941', customer: 'Rohan Sharma', product: 'Wireless Headphones Pro', category: 'Electronics', quantity: 1, amount: 2999, orderDate: '2026-10-02', status: 'Delivered' },
  { id: '2', orderId: 'SP-10942', customer: 'Priya Patel', product: 'Cotton Casual Fit Shirt', category: 'Fashion', quantity: 2, amount: 1598, orderDate: '2026-10-02', status: 'Processing' },
  { id: '3', orderId: 'SP-10943', customer: 'Amit Verma', product: 'Smart Fitness Watch Series 5', category: 'Electronics', quantity: 1, amount: 4499, orderDate: '2026-10-01', status: 'Delivered' },
  { id: '4', orderId: 'SP-10944', customer: 'Neha Gupta', product: 'Insulated Stainless Water Bottle 1L', category: 'Home & Kitchen', quantity: 3, amount: 1197, orderDate: '2026-10-01', status: 'Shipped' },
  { id: '5', orderId: 'SP-10945', customer: 'Vikram Singh', product: 'Active Noise Cancelling Earbuds', category: 'Electronics', quantity: 1, amount: 6999, orderDate: '2026-09-30', status: 'Delivered' },
  { id: '6', orderId: 'SP-10946', customer: 'Ananya Roy', product: 'Pro Cushion Running Shoes', category: 'Sports', quantity: 1, amount: 3499, orderDate: '2026-09-30', status: 'Cancelled' },
  { id: '7', orderId: 'SP-10947', customer: 'Siddharth Rao', product: 'High-Back Ergonomic Desk Chair', category: 'Home & Kitchen', quantity: 1, amount: 8999, orderDate: '2026-09-29', status: 'Delivered' },
  { id: '8', orderId: 'SP-10948', customer: 'Kavita Reddy', product: 'Genuine Leather Laptop Backpack', category: 'Accessories', quantity: 1, amount: 2499, orderDate: '2026-09-29', status: 'Delivered' },
  { id: '9', orderId: 'SP-10949', customer: 'Manish Kumar', product: 'Waterproof Bluetooth Speaker 20W', category: 'Electronics', quantity: 2, amount: 3998, orderDate: '2026-09-28', status: 'Shipped' },
  { id: '10', orderId: 'SP-10950', customer: 'Divya Joshi', product: 'Matte Ceramic Coffee Mugs (Set of 4)', category: 'Home & Kitchen', quantity: 1, amount: 899, orderDate: '2026-09-28', status: 'Delivered' },
  { id: '11', orderId: 'SP-10951', customer: 'Arjun Mehta', product: 'Mechanical RGB Gaming Keyboard', category: 'Electronics', quantity: 1, amount: 5499, orderDate: '2026-09-27', status: 'Delivered' },
  { id: '12', orderId: 'SP-10952', customer: 'Sneha Kapoor', product: 'Yoga Mat Anti-Slip Extra Thick', category: 'Sports', quantity: 2, amount: 1798, orderDate: '2026-09-27', status: 'Processing' }
];

export const shopPulseInsights: SourceInsights = {
  source: 'ShopPulse',
  totalRevenue: '₹24.8L',
  totalOrdersOrTx: '8,421',
  topProduct: 'Wireless Headphones',
  topCategoryOrDept: 'Electronics',
  avgValue: '₹2,945',
  topLocationOrStock: 'Delhi NCR (3.8k users)',
  kpis: [
    { title: 'Total Revenue', value: '₹24.8L', subtext: '+14.2% vs last month', change: '+14.2%', isPositive: true, iconName: 'IndianRupee' },
    { title: 'Total Orders', value: '8,421', subtext: '+8.6% order volume', change: '+8.6%', isPositive: true, iconName: 'ShoppingCart' },
    { title: 'Top Product', value: 'Wireless Headphones', subtext: '1,420 units sold', iconName: 'Award' },
    { title: 'Top Category', value: 'Electronics', subtext: '45% of gross revenue', iconName: 'Layers' },
    { title: 'Avg Order Value', value: '₹2,945', subtext: '+4.1% basket size', change: '+4.1%', isPositive: true, iconName: 'TrendingUp' },
    { title: 'Top Region', value: 'Delhi NCR', subtext: '3,890 active customers', iconName: 'MapPin' }
  ],
  revenueTrend: [
    { period: 'Mon', revenue: 320000, count: 1100 },
    { period: 'Tue', revenue: 380000, count: 1250 },
    { period: 'Wed', revenue: 340000, count: 1180 },
    { period: 'Thu', revenue: 410000, count: 1390 },
    { period: 'Fri', revenue: 490000, count: 1650 },
    { period: 'Sat', revenue: 540000, count: 1820 },
    { period: 'Sun', revenue: 450000, count: 1530 }
  ],
  categoryBreakdown: [
    { name: 'Electronics', revenue: 1116000, count: 3789, percentage: 45, color: '#A068FF' },
    { name: 'Fashion', revenue: 545600, count: 1852, percentage: 22, color: '#3B82F6' },
    { name: 'Home & Kitchen', revenue: 446400, count: 1515, percentage: 18, color: '#10B981' },
    { name: 'Sports', revenue: 248000, count: 842, percentage: 10, color: '#F59E0B' },
    { name: 'Accessories', revenue: 124000, count: 423, percentage: 5, color: '#EC4899' }
  ],
  topProducts: [
    { rank: 1, name: 'Wireless Headphones Pro', categoryOrDept: 'Electronics', unitsSold: 1420, revenue: 4258580 },
    { rank: 2, name: 'Smart Fitness Watch S5', categoryOrDept: 'Electronics', unitsSold: 980, revenue: 4409020 },
    { rank: 3, name: 'High-Back Ergonomic Chair', categoryOrDept: 'Home & Kitchen', unitsSold: 640, revenue: 5759360 },
    { rank: 4, name: 'Cotton Casual Fit Shirt', categoryOrDept: 'Fashion', unitsSold: 1250, revenue: 998750 },
    { rank: 5, name: 'Noise Cancelling Earbuds', categoryOrDept: 'Electronics', unitsSold: 530, revenue: 3709470 }
  ],
  statusDistribution: [
    { status: 'Delivered', count: 6063, percentage: 72, color: '#10B981' },
    { status: 'Shipped', count: 1263, percentage: 15, color: '#3B82F6' },
    { status: 'Processing', count: 758, percentage: 9, color: '#F59E0B' },
    { status: 'Cancelled', count: 337, percentage: 4, color: '#EF4444' }
  ]
};

export const mockShopPulseService = {
  getSummary: () => shopPulseSummary,
  getRecords: () => mockShopPulseRecords,
  getInsights: () => shopPulseInsights
};
