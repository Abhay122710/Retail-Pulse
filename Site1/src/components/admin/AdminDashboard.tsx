import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Database,
  Download,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  CheckCircle2,
  Code,
  Sparkles,
  FileSpreadsheet,
  Layers,
  FileText,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { Product, Customer, Order, OrderItem, Review, ProductCategory, OrderStatus } from '../../types';
import {
  api,
  exportCustomersCSV,
  exportProductsCSV,
  exportOrdersCSV,
  exportOrderItemsCSV,
  exportReviewsCSV,
  downloadCSV,
} from '../../services/api';
import { ProductImage } from '../common/ProductImage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  showToast: (title: string, type?: 'success' | 'info' | 'warning' | 'error', message?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'customers' | 'orders' | 'generator' | 'export' | 'simulator'
  >('overview');

  // Generator State
  const [generating, setGenerating] = useState(false);
  const [generatorLog, setGeneratorLog] = useState<string[]>([]);

  // Search states inside admin tabs
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // API Explorer Tab State
  const [apiEndpoint, setApiEndpoint] = useState<'products' | 'customers' | 'orders' | 'order-items' | 'reviews'>('products');

  // New Product Modal State inside Admin
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCat, setNewProductCat] = useState<ProductCategory>('Electronics');
  const [newProductSubcat, setNewProductSubcat] = useState('Audio');
  const [newProductBrand, setNewProductBrand] = useState('ShopPulse');
  const [newProductPrice, setNewProductPrice] = useState(1999);
  const [newProductDiscount, setNewProductDiscount] = useState(15);
  const [newProductStock, setNewProductStock] = useState(50);
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  );
  const [newProductDesc, setNewProductDesc] = useState('Premium demo e-commerce product.');

  if (!isOpen) return null;

  // Live Metrics
  const products = api.getProducts();
  const customers = api.getCustomers();
  const orders = api.getOrders();
  const orderItems = api.getOrderItems();
  const reviews = api.getReviews();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 5);

  // Handlers
  const handleGenerateOrders = (count: number) => {
    setGenerating(true);
    setTimeout(() => {
      const result = api.generateDemoOrders(count);
      setGenerating(false);
      setGeneratorLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Generated ${result.ordersGenerated} orders with ${result.itemsGenerated} items successfully.`,
        ...prev,
      ]);
      onDataChanged();
      showToast('Demo Orders Generated', 'success', `Added ${result.ordersGenerated} realistic orders into database.`);
    }, 400);
  };

  const handleRunDefect = (type: 'missing_values' | 'duplicate_records' | 'invalid_quantity' | 'invalid_price' | 'invalid_date') => {
    const msg = api.generateDefect(type);
    onDataChanged();
    showToast('Data Simulator Action Executed', 'warning', msg);
  };

  const handleResetDB = () => {
    if (confirm('Are you sure you want to reset the database back to initial seed data?')) {
      api.resetDatabase();
      onDataChanged();
      showToast('Database Reset', 'info', 'Restored pristine seed database state.');
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = Math.round(newProductPrice * (1 - newProductDiscount / 100));
    api.addProduct({
      product_name: newProductName,
      category: newProductCat,
      subcategory: newProductSubcat,
      brand: newProductBrand,
      price: Number(newProductPrice),
      discount: Number(newProductDiscount),
      final_price: finalPrice,
      stock_quantity: Number(newProductStock),
      rating: 4.5,
      review_count: 1,
      image_url: newProductImage,
      description: newProductDesc,
    });
    setShowAddProduct(false);
    onDataChanged();
    showToast('Product Added', 'success', `${newProductName} added to products inventory.`);
  };

  const handleRestock = (p: Product) => {
    const updated = { ...p, stock_quantity: p.stock_quantity + 20 };
    api.updateProduct(updated);
    onDataChanged();
    showToast('Stock Replenished', 'success', `Added +20 stock units to ${p.product_name}`);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      api.deleteProduct(id);
      onDataChanged();
      showToast('Product Deleted', 'info', 'Product removed from catalog.');
    }
  };

  // API Data Payload based on selection
  let apiJsonData: any = [];
  if (apiEndpoint === 'products') apiJsonData = products;
  if (apiEndpoint === 'customers') apiJsonData = customers;
  if (apiEndpoint === 'orders') apiJsonData = orders;
  if (apiEndpoint === 'order-items') apiJsonData = orderItems;
  if (apiEndpoint === 'reviews') apiJsonData = reviews;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold">ShopPulse Data Engine & Admin Portal</h2>
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Retail Pulse Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Manage e-commerce entities, generate randomized datasets & export CSV / JSON APIs.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 overflow-x-auto no-scrollbar text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'customers' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'generator' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Demo Generator
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'export' ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV & API Export
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-white text-rose-700 border-t-2 border-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Data Simulator
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-xl font-extrabold text-indigo-950">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Orders</p>
                  <p className="text-xl font-extrabold text-emerald-950">{orders.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Total Customers</p>
                  <p className="text-xl font-extrabold text-purple-950">{customers.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Products</p>
                  <p className="text-xl font-extrabold text-blue-950">{products.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Low Stock Items</p>
                  <p className="text-xl font-extrabold text-amber-950">{lowStockProducts.length}</p>
                </div>
              </div>

              {/* Low Stock Alerts Table */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Low Stock Inventory Alerts (&le; 5 units)
                  </h3>
                </div>

                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-slate-500">All products have healthy inventory levels.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Product ID</th>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Current Stock</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lowStockProducts.map((p) => (
                          <tr key={p.product_id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{p.product_id}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{p.product_name}</td>
                            <td className="p-2.5 text-slate-500">{p.category}</td>
                            <td className="p-2.5 font-extrabold text-rose-600">{p.stock_quantity} units left</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleRestock(p)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                              >
                                + Add Stock (+20)
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders Feed */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Order ID</th>
                        <th className="p-2.5">Customer ID</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Payment Method</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 6).map((o) => (
                        <tr key={o.order_id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-indigo-600">{o.order_id}</td>
                          <td className="p-2.5 text-slate-700">{o.customer_id}</td>
                          <td className="p-2.5 text-slate-500">{new Date(o.order_date).toLocaleDateString()}</td>
                          <td className="p-2.5 text-slate-700">{o.payment_method}</td>
                          <td className="p-2.5 font-bold">{o.order_status}</td>
                          <td className="p-2.5 text-right font-extrabold text-slate-900">₹{o.total_amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>

                <button
                  onClick={() => setShowAddProduct(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">MRP (₹)</th>
                      <th className="p-3">Disc %</th>
                      <th className="p-3">Final (₹)</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter((p) => p.product_name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.product_id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{p.product_id}</td>
                          <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border">
                              <ProductImage src={p.image_url} alt={p.product_name} />
                            </div>
                            <span className="line-clamp-1">{p.product_name}</span>
                          </td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3 text-slate-600">{p.brand}</td>
                          <td className="p-3 font-medium text-slate-500">₹{p.price}</td>
                          <td className="p-3 font-bold text-rose-600">{p.discount}%</td>
                          <td className="p-3 font-extrabold text-slate-900">₹{p.final_price}</td>
                          <td className="p-3 font-bold">{p.stock_quantity}</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleDeleteProduct(p.product_id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Add Product Modal Drawer */}
              {showAddProduct && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-indigo-900">Add New Product to Database</h4>
                    <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <select
                      value={newProductCat}
                      onChange={(e) => setNewProductCat(e.target.value as ProductCategory)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Sports">Sports</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Subcategory"
                      value={newProductSubcat}
                      onChange={(e) => setNewProductSubcat(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Brand"
                      value={newProductBrand}
                      onChange={(e) => setNewProductBrand(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={newProductDiscount}
                      onChange={(e) => setNewProductDiscount(Number(e.target.value))}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock Quantity"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(Number(e.target.value))}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl sm:col-span-2"
                      required
                    />
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search customers by name/city..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Customer ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">City</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Pincode</th>
                      <th className="p-3">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.city.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase())
                      )
                      .map((c) => (
                        <tr key={c.customer_id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-indigo-600">{c.customer_id}</td>
                          <td className="p-3 font-bold text-slate-800">{c.name}</td>
                          <td className="p-3 text-slate-600">{c.email}</td>
                          <td className="p-3 text-slate-600">{c.phone}</td>
                          <td className="p-3 font-semibold text-slate-800">{c.city}</td>
                          <td className="p-3 text-slate-600">{c.state}</td>
                          <td className="p-3 text-slate-600">{c.pincode}</td>
                          <td className="p-3 text-slate-400">{new Date(c.registration_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter((o) => o.order_id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_id.toLowerCase().includes(orderSearch.toLowerCase()))
                      .map((o) => (
                        <tr key={o.order_id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-indigo-600">{o.order_id}</td>
                          <td className="p-3 text-slate-700">{o.customer_id}</td>
                          <td className="p-3 text-slate-500">{new Date(o.order_date).toLocaleDateString()}</td>
                          <td className="p-3 text-slate-700">{o.payment_method}</td>
                          <td className="p-3 text-slate-700">{o.shipping_city}</td>
                          <td className="p-3">
                            <select
                              value={o.order_status}
                              onChange={(e) => {
                                api.updateOrderStatus(o.order_id, e.target.value as OrderStatus);
                                onDataChanged();
                                showToast('Status Updated', 'info', `Order ${o.order_id} status set to ${e.target.value}`);
                              }}
                              className="p-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right font-extrabold text-slate-900">₹{o.total_amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEMO DATA GENERATOR */}
          {activeTab === 'generator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-extrabold text-slate-900">Automated E-Commerce Order Batch Generator</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generate realistic randomized transactions with Indian customer profiles, locations (Delhi, Noida, Gurugram, Jaipur, Lucknow, Bengaluru, Mumbai, Pune, etc.), products, quantities, tax, shipping, and realistic dates over the last 90 days.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <button
                    onClick={() => handleGenerateOrders(10)}
                    disabled={generating}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-center shadow-xs disabled:opacity-50"
                  >
                    <p className="text-lg font-extrabold text-indigo-600">+10 Orders</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Quick Small Batch</p>
                  </button>
                  <button
                    onClick={() => handleGenerateOrders(50)}
                    disabled={generating}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-center shadow-xs disabled:opacity-50"
                  >
                    <p className="text-lg font-extrabold text-indigo-600">+50 Orders</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Standard Pipeline Batch</p>
                  </button>
                  <button
                    onClick={() => handleGenerateOrders(100)}
                    disabled={generating}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-center shadow-xs disabled:opacity-50"
                  >
                    <p className="text-lg font-extrabold text-purple-600">+100 Orders</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Large Dataset Batch</p>
                  </button>
                  <button
                    onClick={() => handleGenerateOrders(500)}
                    disabled={generating}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-center shadow-xs disabled:opacity-50"
                  >
                    <p className="text-lg font-extrabold text-amber-600">+500 Orders</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Stress Testing Dataset</p>
                  </button>
                </div>
              </div>

              {/* Generator Logs */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Generation Console Logs</span>
                  <span className="text-[10px] text-slate-400">{generatorLog.length} events logged</span>
                </div>
                <div className="h-40 overflow-y-auto space-y-1 text-[11px]">
                  {generatorLog.length === 0 ? (
                    <p className="text-slate-500 italic">Click any button above to synthesize demo orders.</p>
                  ) : (
                    generatorLog.map((log, i) => (
                      <p key={i} className="text-emerald-400">{log}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATA EXPORT & REST API EXPLORER */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* CSV Export Cards */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Entity CSV Datasets (For Retail Pulse ETL)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <button
                    onClick={exportCustomersCSV}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-center space-y-1 group"
                  >
                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Customers.csv</p>
                    <p className="text-[10px] text-slate-400">{customers.length} records</p>
                  </button>
                  <button
                    onClick={exportProductsCSV}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-center space-y-1 group"
                  >
                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Products.csv</p>
                    <p className="text-[10px] text-slate-400">{products.length} records</p>
                  </button>
                  <button
                    onClick={exportOrdersCSV}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-center space-y-1 group"
                  >
                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Orders.csv</p>
                    <p className="text-[10px] text-slate-400">{orders.length} records</p>
                  </button>
                  <button
                    onClick={exportOrderItemsCSV}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-center space-y-1 group"
                  >
                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Order_Items.csv</p>
                    <p className="text-[10px] text-slate-400">{orderItems.length} records</p>
                  </button>
                  <button
                    onClick={exportReviewsCSV}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-center space-y-1 group"
                  >
                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Reviews.csv</p>
                    <p className="text-[10px] text-slate-400">{reviews.length} records</p>
                  </button>
                </div>
              </div>

              {/* REST API Console Explorer */}
              <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Live REST API Endpoint Preview</span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto text-[11px]">
                    {(['products', 'customers', 'orders', 'order-items', 'reviews'] as const).map((ep) => (
                      <button
                        key={ep}
                        onClick={() => setApiEndpoint(ep)}
                        className={`px-2.5 py-1 rounded-lg border transition ${
                          apiEndpoint === ep
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        GET /api/{ep}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Response Headers: <strong className="text-emerald-400">200 OK (application/json)</strong></span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(apiJsonData, null, 2));
                      showToast('JSON Copied', 'success', 'API payload copied to clipboard.');
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Copy JSON
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] h-64 overflow-y-auto text-emerald-400">
                  {JSON.stringify(apiJsonData.slice(0, 5), null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 7: DATA SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-extrabold">Controlled Data Quality Simulator</h3>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Notice: This tool introduces synthetic data quality defects to test Retail Pulse's data cleansing and ETL pipeline resilience. Use with caution during demo evaluation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleRunDefect('missing_values')}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-900">[Generate Missing Values]</p>
                    <p className="text-[11px] text-rose-700">Clears shipping city/state on test orders</p>
                  </button>

                  <button
                    onClick={() => handleRunDefect('duplicate_records')}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-900">[Generate Duplicate Records]</p>
                    <p className="text-[11px] text-rose-700">Clones an order record with same ID</p>
                  </button>

                  <button
                    onClick={() => handleRunDefect('invalid_quantity')}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-900">[Generate Invalid Quantity]</p>
                    <p className="text-[11px] text-rose-700">Injects negative item quantity (-2)</p>
                  </button>

                  <button
                    onClick={() => handleRunDefect('invalid_price')}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-900">[Generate Invalid Price]</p>
                    <p className="text-[11px] text-rose-700">Injects negative price (-₹999)</p>
                  </button>

                  <button
                    onClick={() => handleRunDefect('invalid_date')}
                    className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-900">[Generate Invalid Date]</p>
                    <p className="text-[11px] text-rose-700">Injects malformed order date string</p>
                  </button>

                  <button
                    onClick={handleResetDB}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition text-left text-xs space-y-1"
                  >
                    <p className="font-bold text-emerald-400">[Reset Database State]</p>
                    <p className="text-[11px] text-slate-300">Restore clean seed database</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
