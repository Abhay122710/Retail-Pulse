import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import {
  RefreshCw,
  AlertTriangle,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const BenchmarkingPage: React.FC = () => {
  const { theme } = useDashboard();
  const isDark = theme === 'dark';

  const [benchmarkData, setBenchmarkData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await retailPulseApiService.getBenchmark();
      if (res && res.success) {
        setBenchmarkData(res);
      } else {
        setError('Failed to fetch benchmark analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with benchmarking service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !benchmarkData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-500">Generating Cross-Store Benchmark Analytics...</span>
      </div>
    );
  }

  const sp = benchmarkData?.stores?.ShopPulse;
  const tm = benchmarkData?.stores?.TechMart;
  const summary = benchmarkData?.comparison_summary;
  const timeline = benchmarkData?.comparative_timeline || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Comparative Intelligence
            </span>
            <span className="text-xs text-neutral-400">• ShopPulse vs TechMart</span>
          </div>
          <h2 className="text-2xl font-black mt-2 text-neutral-900 dark:text-white font-heading">
            Cross-Store Benchmarking & Performance Parity
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Standardized side-by-side comparison across financial, conversion, inventory, and order velocity metrics.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-850'
              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Live Recalculate'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. EXECUTIVE COMPARISON HIGHLIGHTS */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/15 via-purple-900/10 to-cyan-900/15 border border-purple-500/20 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Revenue Leader: <span className="text-purple-600 dark:text-purple-400">{summary?.revenue_leading_store}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Leading by <strong>₹{summary?.revenue_difference_amount?.toLocaleString() ?? 0}</strong> in net settled revenue. Combined network volume is <strong>₹{summary?.total_combined_net_revenue?.toLocaleString() ?? 0}</strong> across <strong>{summary?.total_combined_active_orders ?? 0}</strong> fulfilled orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-black/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Higher AOV</span>
              <span className="text-sm font-black text-neutral-900 dark:text-white font-heading">{summary?.higher_aov_store}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-black/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Higher Conversion</span>
              <span className="text-sm font-black text-neutral-900 dark:text-white font-heading">{summary?.higher_conversion_store}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE KPI CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ShopPulse Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-blue-500/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-xs">
                SP
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-heading">
                  ShopPulse General E-Commerce
                </h3>
                <span className="text-xs text-neutral-400">Port 3000 • Consumer Electronics</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {sp?.freshness_label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Net Revenue</span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-heading">
                ₹{sp?.net_revenue?.toLocaleString() ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">Gross: ₹{sp?.gross_revenue?.toLocaleString() ?? 0}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Active Orders</span>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-1 font-heading">
                {sp?.active_orders_count ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">{sp?.total_orders_created ?? 0} total created</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Avg Order Value</span>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-1 font-heading">
                ₹{sp?.average_order_value?.toLocaleString() ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">Per active order</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Cancellation Rate</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 font-heading">
                {sp?.cancellation_rate_pct ?? 0}%
              </div>
              <span className="text-[10px] text-neutral-500">{sp?.cancelled_or_refunded_count ?? 0} orders cancelled</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Conversion Rate</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-heading">
                {sp?.conversion_rate_pct ?? 0}%
              </div>
              <span className="text-[10px] text-neutral-500">{sp?.sessions_count ?? 0} total sessions</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Avg Dwell Time</span>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 font-heading">
                {sp?.avg_dwell_seconds ?? 0}s
              </div>
              <span className="text-[10px] text-neutral-500">Cart drop: {sp?.cart_abandonment_rate_pct ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* TechMart Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-cyan-500/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center font-black text-white shadow-xs">
                TM
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-heading">
                  TechMart Electronics Store
                </h3>
                <span className="text-xs text-neutral-400">Port 5174 • Laptops & Peripherals</span>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {tm?.freshness_label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Net Revenue</span>
              <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1 font-heading">
                ₹{tm?.net_revenue?.toLocaleString() ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">Gross: ₹{tm?.gross_revenue?.toLocaleString() ?? 0}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Active Orders</span>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-1 font-heading">
                {tm?.active_orders_count ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">{tm?.total_orders_created ?? 0} total created</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Avg Order Value</span>
              <div className="text-xl font-black text-neutral-900 dark:text-white mt-1 font-heading">
                ₹{tm?.average_order_value?.toLocaleString() ?? 0}
              </div>
              <span className="text-[10px] text-neutral-500">Per active order</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Cancellation Rate</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 font-heading">
                {tm?.cancellation_rate_pct ?? 0}%
              </div>
              <span className="text-[10px] text-neutral-500">{tm?.cancelled_or_refunded_count ?? 0} orders cancelled</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Conversion Rate</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-heading">
                {tm?.conversion_rate_pct ?? 0}%
              </div>
              <span className="text-[10px] text-neutral-500">{tm?.sessions_count ?? 0} total sessions</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Avg Dwell Time</span>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 font-heading">
                {tm?.avg_dwell_seconds ?? 0}s
              </div>
              <span className="text-[10px] text-neutral-500">Cart drop: {tm?.cart_abandonment_rate_pct ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPARATIVE REVENUE TIMELINE CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
              Comparative Daily Net Revenue Trajectory
            </h3>
            <p className="text-xs text-neutral-500">
              Aligned calendar timeline showing daily net settlements across both storefronts.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ShopPulse
            </span>
            <span className="flex items-center gap-1.5 text-cyan-500">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> TechMart
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tmColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#E5E7EB'} />
              <XAxis dataKey="date" stroke={isDark ? '#737373' : '#9CA3AF'} fontSize={11} tickLine={false} />
              <YAxis
                stroke={isDark ? '#737373' : '#9CA3AF'}
                fontSize={11}
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
              <Area type="monotone" dataKey="shoppulse_revenue" name="ShopPulse Revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#spColor)" />
              <Area type="monotone" dataKey="techmart_revenue" name="TechMart Revenue" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#tmColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. CATEGORY & INVENTORY PROFILE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share Comparison */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
            Category Revenue Share Matrix
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-500 block mb-2">ShopPulse Categories</span>
              <div className="space-y-2">
                {sp?.top_categories?.map((cat: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{cat.category}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        ₹{cat.revenue.toLocaleString()} ({cat.share_pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${cat.share_pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
              <span className="text-xs font-bold text-cyan-500 block mb-2">TechMart Categories</span>
              <div className="space-y-2">
                {tm?.top_categories?.map((cat: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{cat.category}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        ₹{cat.revenue.toLocaleString()} ({cat.share_pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${cat.share_pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Risk Breakdown Side-by-Side */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
            Inventory Stockout Risk Distribution
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* ShopPulse Risks */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-blue-500 block">ShopPulse Risks</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-rose-500 font-semibold">Critical Stockouts:</span>
                  <span className="font-black text-neutral-900 dark:text-white">{sp?.inventory_risk_counts?.critical ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500 font-semibold">High Risk:</span>
                  <span className="font-black text-neutral-900 dark:text-white">{sp?.inventory_risk_counts?.high ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Adequate Stock:</span>
                  <span className="font-black text-neutral-900 dark:text-white">
                    {(sp?.inventory_risk_counts?.medium ?? 0) + (sp?.inventory_risk_counts?.low ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* TechMart Risks */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-cyan-500 block">TechMart Risks</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-rose-500 font-semibold">Critical Stockouts:</span>
                  <span className="font-black text-neutral-900 dark:text-white">{tm?.inventory_risk_counts?.critical ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500 font-semibold">High Risk:</span>
                  <span className="font-black text-neutral-900 dark:text-white">{tm?.inventory_risk_counts?.high ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Adequate Stock:</span>
                  <span className="font-black text-neutral-900 dark:text-white">
                    {(tm?.inventory_risk_counts?.medium ?? 0) + (tm?.inventory_risk_counts?.low ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Normalization & Compatibility Notes */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1 mt-4">
            <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Data Lineage & Normalization Guarantee:
            </span>
            {benchmarkData?.compatibility_notes?.map((note: string, idx: number) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-purple-500 font-bold">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
