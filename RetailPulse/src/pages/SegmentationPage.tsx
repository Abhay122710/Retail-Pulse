import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import { SegmentedControl } from '../components/common/SegmentedControl';
import {
  Users,
  Repeat,
  Layers,
  DollarSign,
  Search,
  RefreshCw,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const SegmentationPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'customers' | 'pareto' | 'pricing'>('customers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const src = selectedSource === 'ALL SOURCES' ? undefined : selectedSource;
      const res = await retailPulseApiService.getSegmentation(src);
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        setError('Failed to load sales segmentation data.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with segmentation API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSource]);

  if (loading && !data) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Computing customer cohorts and ABC segmentation...</p>
      </div>
    );
  }

  const cust = data?.customer_segmentation;
  const pareto = data?.product_abc_pareto;
  const priceBands = data?.price_band_segmentation || [];
  const velocity = data?.demand_velocity || [];

  // Filtered Pareto Items
  const filteredParetoItems = (pareto?.items || []).filter((item: any) => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'ALL' || item.abc_class === classFilter;
    return matchesSearch && matchesClass;
  });

  const getAbcBadgeColor = (abc: string) => {
    if (abc === 'A') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    if (abc === 'B') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Sales Segmentation & Cohort Analysis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Verified Fields Only
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Empirical repeat purchase behavior, customer retention cohorts, ABC Pareto (80/20), and price-band distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Level Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Identified Customers</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
            {cust?.identified_customers_count ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Verifiable user_id keys
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Repeat Purchase Rate</span>
            <Repeat className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {cust?.repeat_purchase_rate_pct !== undefined ? `${cust.repeat_purchase_rate_pct}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {cust?.repeat_customers_count ?? 0} repeat / {cust?.identified_customers_count ?? 0} total
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Avg Purchase Interval</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
            {cust?.avg_purchase_interval_days !== null ? `${cust?.avg_purchase_interval_days} Days` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Between repeat orders
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Class A Product Share</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
            {pareto?.summary?.class_a?.revenue_share_pct !== undefined
              ? `${pareto.summary.class_a.revenue_share_pct}%`
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {pareto?.summary?.class_a?.product_count ?? 0} products drive 80% revenue
          </div>
        </div>
      </div>

      {/* Consolidated Tabs Navigation */}
      <div className="flex items-center">
        <SegmentedControl
          value={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          options={[
            { value: 'customers', label: 'Customer Cohorts & Frequency', icon: Users },
            { value: 'pareto', label: 'Product ABC Pareto (80/20)', icon: Layers },
            { value: 'pricing', label: 'Price Bands & Velocity Tiers', icon: DollarSign }
          ]}
        />
      </div>

      {/* TAB 1: CUSTOMERS & COHORTS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Data Integrity Explanation Card */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Customer Identity & Privacy Contract</p>
              <p className="mt-0.5 text-indigo-700 dark:text-indigo-400 leading-relaxed">
                {cust?.data_integrity_notes}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Frequency Chart */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700">
                Customer Purchase Frequency Distribution
              </h3>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cust?.frequency_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="bucket" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 11 }} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} Customers`, 'Count']}
                    />
                    <Bar dataKey="customer_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Repeat Customer Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700">
                  Customer Loyalty Profile
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>One-Time Buyers</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{cust?.one_time_customers_count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gray-400 h-full rounded-full"
                        style={{
                          width: `${cust?.identified_customers_count ? (cust.one_time_customers_count / cust.identified_customers_count) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                    <div className="flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-300">
                      <span>Repeat Buyers (2+ Orders)</span>
                      <span className="font-bold">{cust?.repeat_customers_count}</span>
                    </div>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{
                          width: `${cust?.identified_customers_count ? (cust.repeat_customers_count / cust.identified_customers_count) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                Average Interval: <strong>{cust?.avg_purchase_interval_days ? `${cust.avg_purchase_interval_days} days` : 'N/A'}</strong> between successive verified transactions.
              </div>
            </div>
          </div>

          {/* Cohort Retention Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Monthly Customer Retention Cohorts
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {cust?.cohorts?.length || 0} Cohorts
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Cohort Month</th>
                    <th className="px-4 py-3">Initial Customers</th>
                    <th className="px-4 py-3">Month 0 (Base)</th>
                    <th className="px-4 py-3">Month +1 Retention</th>
                    <th className="px-4 py-3">Month +2 Retention</th>
                    <th className="px-4 py-3">Month +3 Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                  {cust?.cohorts?.map((coh: any) => (
                    <tr key={coh.cohort_month} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3 font-sans font-medium text-gray-900 dark:text-gray-100">
                        {coh.cohort_month}
                      </td>
                      <td className="px-4 py-3 font-bold">{coh.initial_customers}</td>
                      {coh.retention_by_month.map((m: any) => (
                        <td key={m.month_offset} className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              m.retention_rate_pct >= 50
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : m.retention_rate_pct > 0
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                : 'text-gray-400'
                            }`}
                          >
                            {m.retention_rate_pct}% ({m.active_customers})
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(!cust?.cohorts || cust.cohorts.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-sans">
                        No customer cohorts available in current date window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT ABC PARETO */}
      {activeTab === 'pareto' && (
        <div className="space-y-6">
          {/* ABC Pareto Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Class A (Top 80% Revenue)
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-600 text-white">
                  Class A
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-emerald-900 dark:text-emerald-200">
                ${pareto?.summary?.class_a?.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                {pareto?.summary?.class_a?.product_count} products ({pareto?.summary?.class_a?.revenue_share_pct}% total revenue)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  Class B (Next 15% Revenue)
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-blue-600 text-white">
                  Class B
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-blue-900 dark:text-blue-200">
                ${pareto?.summary?.class_b?.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                {pareto?.summary?.class_b?.product_count} products ({pareto?.summary?.class_b?.revenue_share_pct}% total revenue)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  Class C (Long Tail 5%)
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-purple-600 text-white">
                  Class C
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-purple-900 dark:text-purple-200">
                ${pareto?.summary?.class_c?.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                {pareto?.summary?.class_c?.product_count} products ({pareto?.summary?.class_c?.revenue_share_pct}% total revenue)
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <SegmentedControl
              value={classFilter}
              onChange={(cls) => setClassFilter(cls as any)}
              options={[
                { value: 'ALL', label: 'All Classes' },
                { value: 'A', label: 'Class A' },
                { value: 'B', label: 'Class B' },
                { value: 'C', label: 'Class C' }
              ]}
            />
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Units Sold</th>
                    <th className="px-4 py-3">Gross Revenue</th>
                    <th className="px-4 py-3">Cumul. Revenue</th>
                    <th className="px-4 py-3">Cumul. Share</th>
                    <th className="px-4 py-3">ABC Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                  {filteredParetoItems.map((item: any) => (
                    <tr key={item.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3 font-sans font-medium text-gray-900 dark:text-gray-100">
                        {item.product_name}
                        <span className="block text-[10px] text-gray-400 font-mono">{item.product_id}</span>
                      </td>
                      <td className="px-4 py-3 font-sans text-gray-500">{item.category}</td>
                      <td className="px-4 py-3">{item.units_sold}</td>
                      <td className="px-4 py-3 font-bold">${item.gross_revenue.toFixed(2)}</td>
                      <td className="px-4 py-3">${item.cumulative_revenue.toFixed(2)}</td>
                      <td className="px-4 py-3">{item.cumulative_share_pct}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getAbcBadgeColor(item.abc_class)}`}>
                          Class {item.abc_class}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredParetoItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-sans">
                        No products match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & VELOCITY */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Price Bands Chart & Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700">
                Revenue Contribution by Price Band
              </h3>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceBands}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="band_name" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 10 }} />
                    <YAxis
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="gross_revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {priceBands.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700">
                Price Band Breakdown
              </h3>
              <div className="space-y-3 mt-4">
                {priceBands.map((band: any) => (
                  <div
                    key={band.band_name}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{band.band_name}</div>
                      <div className="text-[11px] text-gray-500">Range: {band.price_range} • {band.product_count} items</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900 dark:text-gray-100">${band.gross_revenue.toFixed(2)}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{band.revenue_share_pct}% share</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demand Velocity Movement Tiers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-700">
              Demand Movement Velocity Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {velocity.map((v: any, idx: number) => (
                <div
                  key={v.tier}
                  className={`p-4 rounded-xl border ${
                    idx === 0
                      ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : idx === 1
                      ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    {v.tier}
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products in Tier:</span>
                      <span className="font-bold">{v.product_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Units Sold:</span>
                      <span className="font-bold">{v.units_sold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revenue Contribution:</span>
                      <span className="font-bold font-mono">${v.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SegmentationPage;
