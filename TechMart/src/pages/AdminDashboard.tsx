import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  LayoutDashboard, 
  Download, 
  RefreshCw, 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Warehouse, 
  Terminal,
  Copy,
  Check,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    customers, 
    transactions, 
    inventory, 
    anomalies, 
    generateBulkTransactions, 
    triggerAnomaly, 
    resetAllData,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'generator' | 'simulator' | 'export' | 'api' | 'inventory'>('overview');
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<string>('/api/transactions');
  const [copied, setCopied] = useState<boolean>(false);

  // Stats Calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.net_value) || 0), 0);

  const ncrStock = inventory.filter((i) => i.warehouse_code === 'WH-NCR').reduce((sum, i) => sum + i.available_units, 0);
  const northStock = inventory.filter((i) => i.warehouse_code === 'WH-NORTH').reduce((sum, i) => sum + i.available_units, 0);
  const westStock = inventory.filter((i) => i.warehouse_code === 'WH-WEST').reduce((sum, i) => sum + i.available_units, 0);

  const getApiResponse = () => {
    switch (selectedApiEndpoint) {
      case '/api/users':
        return apiService.getUsersAPI();
      case '/api/products':
        return apiService.getProductsAPI();
      case '/api/transactions':
        return apiService.getTransactionsAPI();
      case '/api/transaction-items':
        return apiService.getTransactionItemsAPI();
      case '/api/inventory':
        return apiService.getInventoryAPI();
      case '/api/reviews':
        return apiService.getReviewsAPI();
      default:
        return apiService.getTransactionsAPI();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied API response JSON to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">TechMart Operations & ETL Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data Source #2 Control Center for Retail Pulse Business Intelligence Pipeline
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'generator', label: 'Bulk Data Generator', icon: PlusCircle },
          { id: 'simulator', label: 'Data Quality Simulator', icon: ShieldAlert },
          { id: 'export', label: 'CSV Data Export', icon: Download },
          { id: 'api', label: 'Simulated REST API', icon: Terminal },
          { id: 'inventory', label: 'Multi-Warehouse Inventory', icon: Warehouse }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Revenue (Net)</span>
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-cyan-400">Cumulative sales across all payment channels</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Transactions</span>
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{transactions.length}</p>
              <p className="text-[11px] text-slate-400">Recorded orders with line items</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Registered Customers</span>
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{customers.length}</p>
              <p className="text-[11px] text-slate-400">Active customer profiles</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Catalog SKUs</span>
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{products.length}</p>
              <p className="text-[11px] text-slate-400">Electronics items in 7 departments</p>
            </div>

          </div>

          {/* Warehouse Stock Overview Cards */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-cyan-400" />
              <span>Multi-Warehouse Distribution Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-bold">WH-NCR (Delhi Hub)</span>
                <p className="text-2xl font-black text-cyan-400 mt-1">{ncrStock} units</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-bold">WH-NORTH (Chandigarh Hub)</span>
                <p className="text-2xl font-black text-blue-400 mt-1">{northStock} units</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-bold">WH-WEST (Mumbai Hub)</span>
                <p className="text-2xl font-black text-indigo-400 mt-1">{westStock} units</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.transaction_id} className="p-4 flex items-center justify-between gap-4 font-mono">
                  <div>
                    <span className="font-bold text-cyan-400">{t.transaction_id}</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      User: {t.user_code} • Channel: {t.payment_channel}
                    </p>
                  </div>
                  <StatusBadge status={t.transaction_status} />
                  <span className="font-black text-white">₹{t.net_value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DEMO DATA GENERATOR */}
      {activeTab === 'generator' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Generate Bulk Demo Transactions</h2>
            <p className="text-xs text-slate-400">
              Instantly create consistent historical transactions referencing registered SKUs and Customers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[10, 50, 100, 500, 1000].map((num) => (
              <button
                key={num}
                onClick={() => generateBulkTransactions(num)}
                className="glow-button p-4 rounded-2xl text-xs font-bold text-center flex flex-col items-center justify-center gap-1 shadow-md hover:scale-105 transition-all"
              >
                <PlusCircle className="w-5 h-5 text-slate-950" />
                <span>+ {num} Transactions</span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-cyan-400">Generator Consistency Rules:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Every transaction references a valid <code className="text-cyan-300">user_code</code> from customers dataset.</li>
              <li>Every transaction line item references a valid <code className="text-cyan-300">sku</code> from electronics catalog.</li>
              <li>Calculates gross_value, discount_value, tax_value (18% GST), shipping, and net_value dynamically.</li>
              <li>Deducts inventory stock across WH-NCR, WH-NORTH, WH-WEST.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: DATA QUALITY SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-6">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Data Quality Simulator for Retail Pulse</h2>
            </div>
            <p className="text-xs text-slate-400">
              Intentionally introduce controlled anomalies to evaluate Retail Pulse ETL pipeline validation & data trust scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <button
              onClick={() => triggerAnomaly('missing_values')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.missing_values
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Missing Values</div>
              <p className="text-[11px] text-slate-400">Injects null/empty fields in user_code and payment_channel</p>
            </button>

            <button
              onClick={() => triggerAnomaly('duplicate_transactions')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.duplicate_transactions
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Duplicate Transactions</div>
              <p className="text-[11px] text-slate-400">Injects duplicate transaction_ids with conflicting totals</p>
            </button>

            <button
              onClick={() => triggerAnomaly('invalid_price')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.invalid_price
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Invalid Price</div>
              <p className="text-[11px] text-slate-400">Injects negative unit prices (e.g. -₹4,999)</p>
            </button>

            <button
              onClick={() => triggerAnomaly('invalid_quantity')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.invalid_quantity
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Invalid Quantity</div>
              <p className="text-[11px] text-slate-400">Injects negative unit quantities in line items</p>
            </button>

            <button
              onClick={() => triggerAnomaly('invalid_sku')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.invalid_sku
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Invalid SKU</div>
              <p className="text-[11px] text-slate-400">Injects non-existent SKU references</p>
            </button>

            <button
              onClick={() => triggerAnomaly('invalid_date')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.invalid_date
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Invalid Date</div>
              <p className="text-[11px] text-slate-400">Injects malformed ISO timestamps</p>
            </button>

            <button
              onClick={() => triggerAnomaly('inventory_mismatch')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                anomalies.inventory_mismatch
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <div className="font-bold text-xs">Inventory Mismatch</div>
              <p className="text-[11px] text-slate-400">Injects negative warehouse inventory counts</p>
            </button>

            <button
              onClick={resetAllData}
              className="p-4 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Clean Data</span>
            </button>

          </div>

        </div>
      )}

      {/* TAB 4: CSV EXPORT */}
      {activeTab === 'export' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Export CSV Datasets for Retail Pulse</h2>
            <p className="text-xs text-slate-400">
              Download CSV files with TechMart's original field names for multi-source ingestion testing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_users.csv</span>
              <p className="text-[11px] text-slate-400">Fields: user_code, full_name, email_address, mobile_number, city, state, postal_code, account_created</p>
              <button
                onClick={() => apiService.exportUsersCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Users CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_products.csv</span>
              <p className="text-[11px] text-slate-400">Fields: sku, item_title, department, unit_price, available_units, brand_name, specs</p>
              <button
                onClick={() => apiService.exportProductsCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Products CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_transactions.csv</span>
              <p className="text-[11px] text-slate-400">Fields: transaction_id, user_code, transaction_status, payment_channel, gross_value, net_value</p>
              <button
                onClick={() => apiService.exportTransactionsCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Transactions CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_transaction_items.csv</span>
              <p className="text-[11px] text-slate-400">Fields: line_id, transaction_id, sku, item_title, units, unit_price, discount, line_total</p>
              <button
                onClick={() => apiService.exportTransactionItemsCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Transaction Items CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_inventory.csv</span>
              <p className="text-[11px] text-slate-400">Fields: inventory_id, sku, warehouse_code, available_units, reserved_units, reorder_level</p>
              <button
                onClick={() => apiService.exportInventoryCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Inventory CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 font-mono">techmart_reviews.csv</span>
              <p className="text-[11px] text-slate-400">Fields: review_code, sku, user_code, rating, review_text, review_timestamp</p>
              <button
                onClick={() => apiService.exportReviewsCSV()}
                className="glow-button w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Reviews CSV</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: SIMULATED REST API */}
      {activeTab === 'api' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Simulated REST Endpoints Viewer</h2>
              <p className="text-xs text-slate-400">Inspect live JSON responses exposed for Retail Pulse ETL connector</p>
            </div>

            {/* Endpoint Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Endpoint:</span>
              <select
                value={selectedApiEndpoint}
                onChange={(e) => setSelectedApiEndpoint(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="/api/users">GET /api/users</option>
                <option value="/api/products">GET /api/products</option>
                <option value="/api/transactions">GET /api/transactions</option>
                <option value="/api/transaction-items">GET /api/transaction-items</option>
                <option value="/api/inventory">GET /api/inventory</option>
                <option value="/api/reviews">GET /api/reviews</option>
              </select>
            </div>
          </div>

          {/* JSON Viewer */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[450px]">
            <button
              onClick={() => copyToClipboard(JSON.stringify(getApiResponse(), null, 2))}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <pre className="text-cyan-300">{JSON.stringify(getApiResponse(), null, 2)}</pre>
          </div>
        </div>
      )}

      {/* TAB 6: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Multi-Warehouse Inventory Live Monitor</h2>
            <p className="text-xs text-slate-400">WH-NCR, WH-NORTH, and WH-WEST stock levels per SKU</p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden text-xs font-mono">
            <div className="grid grid-cols-6 p-3 bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
              <span>Inventory ID</span>
              <span>SKU</span>
              <span>Warehouse</span>
              <span>Available</span>
              <span>Reserved</span>
              <span>Reorder Level</span>
            </div>
            <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
              {inventory.map((inv) => (
                <div key={inv.inventory_id} className="grid grid-cols-6 p-3 hover:bg-slate-900/60 transition-colors">
                  <span className="text-slate-500">{inv.inventory_id}</span>
                  <span className="text-cyan-400 font-bold">{inv.sku}</span>
                  <span className="text-slate-300">{inv.warehouse_code}</span>
                  <span className={inv.available_units < 5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {inv.available_units} units
                  </span>
                  <span className="text-slate-400">{inv.reserved_units}</span>
                  <span className="text-slate-500">{inv.reorder_level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
