import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import { ActionMenu } from '../components/common/ActionMenu';
import {
  RefreshCw,
  AlertTriangle,
  Search,
  ArrowDownUp,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ProfitabilityPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'margin' | 'units'>('revenue');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadProfitability = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const src = selectedSource === 'ALL SOURCES' ? undefined : selectedSource;
      const cat = categoryFilter === 'ALL' ? undefined : categoryFilter;
      const res = await retailPulseApiService.getProfitability(src, cat);
      if (res && res.success) {
        setData(res);
      } else {
        setError('Failed to fetch profitability analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with profitability service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfitability();
  }, [selectedSource, categoryFilter]);

  if (loading && !data) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-500">Calculating Product Profitability & COGS...</span>
      </div>
    );
  }

  const summary = data?.summary;
  const products = data?.products || [];
  const categories = data?.category_profitability || [];
  const highRevLowMargin = data?.high_revenue_low_margin_products || [];

  // Filter & sort products
  const filteredProducts = products.filter((p: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(term) ||
      p.product_id.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }).sort((a: any, b: any) => {
    if (sortBy === 'profit') return (b.gross_profit ?? -Infinity) - (a.gross_profit ?? -Infinity);
    if (sortBy === 'margin') return (b.gross_margin_pct ?? -Infinity) - (a.gross_margin_pct ?? -Infinity);
    if (sortBy === 'units') return b.units_sold - a.units_sold;
    return b.net_revenue - a.net_revenue;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Unit Economics & Margin Integrity
            </span>
            <span className="text-xs text-neutral-400">• Gross Profit & COGS</span>
          </div>
          <h2 className="text-2xl font-black mt-2 text-neutral-900 dark:text-white font-heading">
            Product Profitability & Margin Analytics
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Analyzing net revenue, cost of goods sold (COGS), gross margins, and profitability parity.
          </p>
        </div>

        <button
          onClick={() => loadProfitability(true)}
          disabled={refreshing}
          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-850'
              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Live Recalculate'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Net Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Net Revenue</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1 font-heading">
            ₹{summary?.aggregate_net_revenue?.toLocaleString() ?? 0}
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Cancellations netted out</span>
        </div>

        {/* COGS */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total COGS</span>
          <div className="text-2xl font-black text-neutral-800 dark:text-neutral-200 mt-1 font-heading">
            ₹{summary?.aggregate_cogs?.toLocaleString() ?? 0}
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Wholesale cost incurred</span>
        </div>

        {/* Gross Profit */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Gross Profit</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-heading">
            ₹{summary?.aggregate_gross_profit?.toLocaleString() ?? 0}
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Net Revenue - COGS</span>
        </div>

        {/* Gross Margin % */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Gross Margin %</span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 font-heading">
            {summary?.aggregate_gross_margin_pct ?? 0}%
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Across costed products</span>
        </div>

        {/* Cost Data Coverage */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Cost Coverage</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-heading">
            {summary?.cost_data_coverage_percentage ?? 0}%
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">
            {summary?.products_with_verified_cost}/{summary?.total_products_tracked} catalog items
          </span>
        </div>
      </div>

      {/* 3. HIGH REVENUE / LOW MARGIN ATTENTION CALLOUT */}
      {highRevLowMargin.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-heading">
              Margin Optimization Alert: High-Revenue / Low-Margin Products
            </h4>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            The following items drive significant top-line revenue but contribute proportionally lower gross margins (≤ 25%). Consider negotiating wholesale supplier tiers or bundling with high-margin accessories:
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {highRevLowMargin.map((p: any) => (
              <span
                key={p.product_id}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 dark:bg-black/50 border border-amber-500/30 text-neutral-900 dark:text-white"
              >
                {p.product_name}: ₹{p.net_revenue.toLocaleString()} (Margin: {p.gross_margin_pct}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORY PROFITABILITY CHART & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
              Category Profitability & Net Margins
            </h3>
            <span className="text-xs text-neutral-400">By Department</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#E5E7EB'} />
                <XAxis dataKey="category" stroke={isDark ? '#737373' : '#9CA3AF'} fontSize={10} tickLine={false} angle={-15} textAnchor="end" />
                <YAxis
                  stroke={isDark ? '#737373' : '#9CA3AF'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                    borderColor: isDark ? '#262626' : '#E2E8F0',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="gross_profit" name="Gross Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_cogs" name="COGS" fill="#6B7280" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
              Category Unit Economics Summary
            </h3>
            <span className="text-xs text-neutral-400">Cost Coverage</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Gross Profit</th>
                  <th className="py-2.5 px-3">Margin %</th>
                  <th className="py-2.5 px-3">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {categories.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515]">
                    <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">{c.category}</td>
                    <td className="py-2.5 px-3">₹{c.net_revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {c.gross_profit !== null ? `₹${c.gross_profit.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {c.gross_margin_pct !== null ? `${c.gross_margin_pct}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500">{c.cost_coverage_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. PRODUCT PROFITABILITY DATA TABLE */}
      <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden bg-white dark:bg-[#0E0E0E] shadow-xs">
        {/* Table Filters & Search Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-60 rounded-full text-xs bg-neutral-100 dark:bg-[#141414] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Menu */}
            <ActionMenu
              label={categoryFilter === 'ALL' ? 'All Categories' : categoryFilter}
              icon={Filter}
              variant={categoryFilter === 'ALL' ? 'subtle' : 'secondary'}
              items={[
                {
                  id: 'cat-all',
                  label: 'All Categories',
                  active: categoryFilter === 'ALL',
                  onClick: () => setCategoryFilter('ALL')
                },
                ...categories.map((c: any) => ({
                  id: `cat-${c.category}`,
                  label: c.category,
                  description: `₹${c.net_revenue?.toLocaleString() || 0} net`,
                  active: categoryFilter === c.category,
                  onClick: () => setCategoryFilter(c.category)
                }))
              ]}
            />

            {/* Sort Menu */}
            <ActionMenu
              label={`Sort: ${
                sortBy === 'revenue'
                  ? 'Net Revenue'
                  : sortBy === 'profit'
                  ? 'Gross Profit'
                  : sortBy === 'margin'
                  ? 'Margin %'
                  : 'Units Sold'
              }`}
              icon={ArrowDownUp}
              variant="subtle"
              items={[
                {
                  id: 'sort-rev',
                  label: 'Net Revenue',
                  description: 'Descending net revenue volume',
                  active: sortBy === 'revenue',
                  onClick: () => setSortBy('revenue')
                },
                {
                  id: 'sort-profit',
                  label: 'Gross Profit',
                  description: 'Total absolute gross profit contribution',
                  active: sortBy === 'profit',
                  onClick: () => setSortBy('profit')
                },
                {
                  id: 'sort-margin',
                  label: 'Gross Margin %',
                  description: 'Profit margin percentage efficiency',
                  active: sortBy === 'margin',
                  onClick: () => setSortBy('margin')
                },
                {
                  id: 'sort-units',
                  label: 'Units Sold',
                  description: 'Fulfillment order volume',
                  active: sortBy === 'units',
                  onClick: () => setSortBy('units')
                }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Product & Category</th>
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">Unit Price</th>
                <th className="py-2.5 px-4">Unit Cost (COGS)</th>
                <th className="py-2.5 px-4">Units Sold</th>
                <th className="py-2.5 px-4">Net Revenue</th>
                <th className="py-2.5 px-4">Gross Profit</th>
                <th className="py-2.5 px-4">Gross Margin %</th>
                <th className="py-2.5 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredProducts.map((p: any) => (
                <tr key={p.product_id} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-neutral-900 dark:text-white">{p.product_name}</div>
                    <div className="text-[10px] text-neutral-400">{p.product_id} • {p.category}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.source === 'ShopPulse'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {p.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                    ₹{p.unit_price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                    {p.unit_cost !== null ? `₹${p.unit_cost.toLocaleString()}` : (
                      <span className="text-neutral-400 italic">Unavailable</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-800 dark:text-neutral-200">
                    {p.units_sold}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                    ₹{p.net_revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {p.gross_profit !== null ? `₹${p.gross_profit.toLocaleString()}` : (
                      <span className="text-neutral-400 font-normal italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p.gross_margin_pct !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">{p.gross_margin_pct}%</span>
                        <div className="w-12 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              p.gross_margin_pct >= 35
                                ? 'bg-emerald-500'
                                : p.gross_margin_pct >= 20
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, p.gross_margin_pct)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.performance_classification === 'HIGH_MARGIN'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : p.performance_classification === 'LOW_MARGIN_HIGH_VOLUME'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : p.performance_classification === 'MODERATE_MARGIN'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20'
                      }`}
                    >
                      {p.performance_classification.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data Integrity Footer Accordion */}
        <div className="p-4 bg-neutral-50/60 dark:bg-[#121212] border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
          <div className="font-bold text-neutral-700 dark:text-neutral-300">
            Data Integrity & Accounting Principles:
          </div>
          {data?.data_integrity_notes?.map((note: string, idx: number) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
