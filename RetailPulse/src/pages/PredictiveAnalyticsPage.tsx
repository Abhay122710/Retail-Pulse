import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Award,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Info,
  Check
} from 'lucide-react';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import { SegmentedControl } from '../components/common/SegmentedControl';
import type {
  ForecastRecord,
  InventoryRecommendation,
  InventoryItemInfo,
  AnomalyRecord
} from '../types';

export const PredictiveAnalyticsPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  // Sub-tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'forecasts' | 'inventory' | 'anomalies' | 'evaluation'>('forecasts');

  // Filters
  const [horizonDays, setHorizonDays] = useState<7 | 30>(7);
  const [targetMetric, setTargetMetric] = useState<'UNITS' | 'REVENUE'>('UNITS');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [anomalySeverityFilter, setAnomalySeverityFilter] = useState<string>('ALL');

  // State
  const [forecastData, setForecastData] = useState<ForecastRecord | null>(null);
  const [historicalSeries, setHistoricalSeries] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<InventoryRecommendation[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemInfo[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [engineSource, setEngineSource] = useState<string>('Python-FastAPI');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ackingId, setAckingId] = useState<string | null>(null);

  // Load data whenever filters change
  const loadAllPredictiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const src = selectedSource === 'ALL SOURCES' ? undefined : selectedSource;
      const prodId = selectedProduct === 'ALL' ? undefined : selectedProduct;

      // 1. Fetch Forecast
      const fcRes = await retailPulseApiService.getForecasts({
        source: src,
        productId: prodId,
        horizonDays,
        targetMetric
      });

      if (fcRes?.data) {
        setForecastData(fcRes.data);
        if (fcRes.engine) setEngineSource(fcRes.engine);
      }

      // 2. Fetch Historical Actuals
      const histRes = await retailPulseApiService.getTimeSeries(src, prodId);
      if (histRes?.points) {
        setHistoricalSeries(histRes.points);
      }

      // 3. Fetch Inventory Recommendations
      const invRes = await retailPulseApiService.getInventory(src);
      if (invRes?.data) {
        setRecommendations(invRes.data.recommendations || []);
        setInventoryItems(invRes.data.inventory_items || []);
      }

      // 4. Fetch Anomalies
      const anomRes = await retailPulseApiService.getAnomalies({ source: src });
      if (anomRes?.data) {
        setAnomalies(anomRes.data.anomalies || []);
      }
    } catch (err: any) {
      console.error('Failed to load predictive data:', err);
      setError(err.message || 'Error communicating with Predictive Analytics Engine');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllPredictiveData();
  }, [selectedSource, horizonDays, targetMetric, selectedProduct]);

  // Handle explicit recalculation
  const handleRegenerate = async () => {
    setRefreshing(true);
    await loadAllPredictiveData();
  };

  // Handle anomaly acknowledgment
  const handleAcknowledge = async (id: string) => {
    setAckingId(id);
    const success = await retailPulseApiService.acknowledgeAnomaly(id);
    if (success) {
      setAnomalies((prev) =>
        prev.map((a) => (a.anomaly_id === id ? { ...a, acknowledged: true } : a))
      );
    }
    setAckingId(null);
  };

  // Merge historical actuals with future forecasts for combined chart view
  const combinedChartData = useMemo(() => {
    const list: any[] = [];

    // Recent historical days (up to last 14 days)
    const recentHistory = historicalSeries.slice(-14);
    recentHistory.forEach((h) => {
      list.push({
        date: h.date.slice(5), // MM-DD
        fullDate: h.date,
        type: 'Historical',
        actual: targetMetric === 'UNITS' ? h.units_sold ?? h.units ?? 0 : h.revenue_net ?? h.revenue ?? 0,
        forecast: null,
        lowerBound: null,
        upperBound: null
      });
    });

    // Bridge point: last historical value connects to first forecast point
    if (forecastData && forecastData.forecast_points.length > 0 && list.length > 0) {
      const lastHist = list[list.length - 1];
      lastHist.forecast = lastHist.actual;
      lastHist.lowerBound = lastHist.actual;
      lastHist.upperBound = lastHist.actual;
    }

    // Future forecast days
    if (forecastData && forecastData.forecast_points) {
      forecastData.forecast_points.forEach((f) => {
        list.push({
          date: f.date.slice(5),
          fullDate: f.date,
          type: 'Forecast',
          actual: null,
          forecast: f.predicted_demand,
          lowerBound: f.lower_bound,
          upperBound: f.upper_bound
        });
      });
    }

    return list;
  }, [historicalSeries, forecastData, targetMetric]);

  // Filtered anomalies
  const filteredAnomalies = useMemo(() => {
    if (anomalySeverityFilter === 'ALL') return anomalies;
    return anomalies.filter((a) => a.severity === anomalySeverityFilter);
  }, [anomalies, anomalySeverityFilter]);

  // Inventory summary metrics
  const criticalStockouts = recommendations.filter((r) => r.stockout_risk_level === 'CRITICAL');
  const highRiskItems = recommendations.filter((r) => r.stockout_risk_level === 'HIGH');
  const reordersNeeded = recommendations.filter((r) => r.suggested_reorder_qty > 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ML Engine Active
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Runtime: <strong className="text-neutral-800 dark:text-neutral-200">{engineSource}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-neutral-900 dark:text-white font-heading">
            Predictive Analytics & Inventory Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Statistical demand forecasting, transparent Reorder Point (ROP = LTD + SS) recommendations, and rolling anomaly detection.
          </p>
        </div>

        {/* Global Action / Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#141414] border-neutral-800 text-neutral-200 hover:bg-[#1f1f1f]'
                : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Recalculating...' : 'Regenerate Models'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-50/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          Error communicating with predictive service: {error}
        </div>
      )}

      {/* Consolidated Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={activeSubTab}
          onChange={(tab) => setActiveSubTab(tab as any)}
          options={[
            { value: 'forecasts', label: 'Demand Forecasts', icon: TrendingUp },
            {
              value: 'inventory',
              label: 'Inventory Optimization',
              icon: Package,
              badge: criticalStockouts.length > 0 ? 'critical' : undefined
            },
            {
              value: 'anomalies',
              label: 'Anomaly Alerts',
              icon: AlertTriangle,
              count: anomalies.filter((a) => !a.acknowledged).length > 0 ? anomalies.filter((a) => !a.acknowledged).length : undefined
            },
            { value: 'evaluation', label: 'Model Evaluation', icon: Award }
          ]}
        />

        {/* Status / Data Sufficiency Pill */}
        {forecastData && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Data Coverage:</span>
            <span
              className={`px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wide border ${
                forecastData.status === 'SUFFICIENT_DATA'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : forecastData.status === 'LIMITED_DATA'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {forecastData.status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Warnings & Assumptions Alert Drawer */}
      {forecastData?.warnings && forecastData.warnings.length > 0 && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isDark
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            : 'bg-amber-50/70 border-amber-200 text-amber-800'
        }`}>
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-bold">Statistical Assumptions & Data Notices:</span>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-300">
              {forecastData.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SUB-SECTION A: DEMAND FORECASTING */}
      {activeSubTab === 'forecasts' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800">
            {/* Horizon Segmented Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Horizon:</span>
              <SegmentedControl
                value={horizonDays}
                onChange={(h) => setHorizonDays(h as any)}
                options={[
                  { value: 7, label: '7 Days Ahead' },
                  { value: 30, label: '30 Days Ahead' }
                ]}
              />
            </div>

            {/* Target Metric Segmented Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Metric:</span>
              <SegmentedControl
                value={targetMetric}
                onChange={(m) => setTargetMetric(m as any)}
                options={[
                  { value: 'UNITS', label: 'Units Sold' },
                  { value: 'REVENUE', label: 'Net Revenue (₹)' }
                ]}
              />
            </div>

            {/* Product Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">SKU / Product:</span>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 focus:outline-none`}
              >
                <option value="ALL">All Store Products (Aggregate)</option>
                {inventoryItems.map((item) => (
                  <option key={item.product_id} value={item.product_id}>
                    [{item.source}] {item.product_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Visual Forecast Chart Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Historical Actuals vs {horizonDays}-Day Model Forecast
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Solid line denotes verified past actuals; dashed line denotes statistical projections with 95% confidence intervals.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <span className="w-3 h-0.5 bg-neutral-900 dark:bg-white" /> Actual Past Sales
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" /> Forecast Projection
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-3 h-3 bg-emerald-500/20 rounded-xs" /> 95% Confidence Band
                </span>
              </div>
            </div>

            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : combinedChartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-neutral-400 text-xs">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <span>No historical sales events found for this filter criteria.</span>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222' : '#f0f0f0'} />
                    <XAxis dataKey="date" stroke={isDark ? '#777' : '#999'} fontSize={11} />
                    <YAxis stroke={isDark ? '#777' : '#999'} fontSize={11} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const pt = payload[0].payload;
                        return (
                          <div className={`p-3 rounded-xl border text-xs shadow-lg backdrop-blur-md ${
                            isDark ? 'bg-neutral-900/90 border-neutral-800 text-white' : 'bg-white/95 border-neutral-200 text-neutral-900'
                          }`}>
                            <div className="font-bold border-b pb-1 mb-1 border-neutral-200 dark:border-neutral-800">
                              {pt.fullDate} ({pt.type})
                            </div>
                            {pt.actual !== null && (
                              <div className="flex justify-between gap-4">
                                <span className="text-neutral-500">Actual Value:</span>
                                <span className="font-bold">{targetMetric === 'REVENUE' ? `₹${pt.actual.toLocaleString()}` : `${pt.actual} units`}</span>
                              </div>
                            )}
                            {pt.forecast !== null && (
                              <div className="flex justify-between gap-4 text-emerald-500">
                                <span>Model Forecast:</span>
                                <span className="font-bold">{targetMetric === 'REVENUE' ? `₹${pt.forecast.toLocaleString()}` : `${pt.forecast} units`}</span>
                              </div>
                            )}
                            {pt.lowerBound !== null && (
                              <div className="flex justify-between gap-4 text-neutral-400 text-[10px]">
                                <span>Expected Range:</span>
                                <span>[{pt.lowerBound} – {pt.upperBound}]</span>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    {/* Confidence Band */}
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="none"
                      fill="#10b981"
                      fillOpacity={0.12}
                    />
                    {/* Historical Actuals Line */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke={isDark ? '#ffffff' : '#0f172a'}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: isDark ? '#ffffff' : '#0f172a' }}
                      connectNulls={false}
                    />
                    {/* Forecast Future Line */}
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 3.5, fill: '#10b981' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Daily Forecast Breakdown Cards */}
          {forecastData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecastData.forecast_points.slice(0, 7).map((pt, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all text-center ${
                    isDark
                      ? 'bg-[#111111] border-neutral-800/80 hover:border-neutral-700'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-xs'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Day +{idx + 1} ({pt.date.slice(5)})
                  </span>
                  <div className="text-lg font-black mt-1 text-emerald-600 dark:text-emerald-400 font-heading">
                    {targetMetric === 'REVENUE' ? `₹${Math.round(pt.predicted_demand).toLocaleString()}` : `${pt.predicted_demand}`}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    CI: [{pt.lower_bound} – {pt.upper_bound}]
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION B: INVENTORY RECOMMENDATIONS */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Health Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-3xl border ${
              isDark ? 'bg-[#111111] border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">Critical Stockouts</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-rose-500 font-heading">
                {criticalStockouts.length}
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">SKUs with 0 units remaining</span>
            </div>

            <div className={`p-5 rounded-3xl border ${
              isDark ? 'bg-[#111111] border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">High Stockout Risk</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-amber-500 font-heading">
                {highRiskItems.length}
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Stock below Lead-Time Demand (LTD)</span>
            </div>

            <div className={`p-5 rounded-3xl border ${
              isDark ? 'bg-[#111111] border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">Reorders Recommended</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-emerald-500 font-heading">
                {reordersNeeded.length}
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Breached Reorder Point (ROP = LTD + SS)</span>
            </div>
          </div>

          {/* Recommendations Table */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden bg-white dark:bg-[#0E0E0E]">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  Deterministic Reorder Points & Safety Stock Policy
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Target policy: ROP = ceil(DailyRate * LeadTime + 1.65 * sqrt(LeadTime) * sigma). Stock data source strictly labeled.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                Source: DEMO_ESTIMATED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">SKU / Product</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Daily Burn</th>
                    <th className="py-3 px-4">Lead Time</th>
                    <th className="py-3 px-4">Safety Stock</th>
                    <th className="py-3 px-4">Reorder Point</th>
                    <th className="py-3 px-4">Suggested Reorder</th>
                    <th className="py-3 px-4">Stockout Risk</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {recommendations.map((rec) => (
                    <tr key={rec.recommendation_id} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515] transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        <div>{rec.product_name}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {rec.source} • SKU: {rec.product_id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-neutral-900 dark:text-white">
                          {rec.current_stock}
                        </span>{' '}
                        <span className="text-[10px] text-neutral-400">units</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">
                        {rec.daily_forecast_rate}/day
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {rec.supplier_lead_time_days} days
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {rec.safety_stock} units
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        {rec.reorder_point} units
                      </td>
                      <td className="py-3 px-4">
                        {rec.suggested_reorder_qty > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            +{rec.suggested_reorder_qty} units
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            rec.stockout_risk_level === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : rec.stockout_risk_level === 'HIGH'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : rec.stockout_risk_level === 'MEDIUM'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {rec.stockout_risk_level} ({Math.round(rec.stockout_risk_percentage)}%)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-semibold ${
                            rec.urgency === 'IMMEDIATE'
                              ? 'text-rose-500 font-bold'
                              : rec.urgency === 'UPCOMING'
                              ? 'text-amber-500'
                              : 'text-neutral-400'
                          }`}
                        >
                          {rec.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION C: ANOMALY DETECTION */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Filter Severity:</span>
              <div className="inline-flex p-1 rounded-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
                {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAnomalySeverityFilter(sev)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      anomalySeverityFilter === sev
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Showing <strong>{filteredAnomalies.length}</strong> alerts (Deduplicated via rolling Z-score & Isolation Forest)
            </div>
          </div>

          {/* Anomaly Cards Grid */}
          {filteredAnomalies.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E0E0E]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">All Clear — No Anomalies Detected</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                All daily observations remain within the expected 7-day rolling statistical baseline range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnomalies.map((anom) => (
                <div
                  key={anom.anomaly_id}
                  className={`p-5 rounded-3xl border transition-all ${
                    anom.acknowledged
                      ? 'opacity-60 bg-neutral-50 dark:bg-[#101010] border-neutral-200 dark:border-neutral-800'
                      : anom.severity === 'CRITICAL'
                      ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-500/30'
                      : anom.severity === 'WARNING'
                      ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-500/30'
                      : 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            anom.severity === 'CRITICAL'
                              ? 'bg-rose-500 text-white'
                              : anom.severity === 'WARNING'
                              ? 'bg-amber-500 text-black'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {anom.severity}
                        </span>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {anom.metric.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          • {anom.source}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Date: {anom.observation_date}
                      </div>
                    </div>

                    {/* Acknowledge Button */}
                    {!anom.acknowledged ? (
                      <button
                        onClick={() => handleAcknowledge(anom.anomaly_id)}
                        disabled={ackingId === anom.anomaly_id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        {ackingId === anom.anomaly_id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-3 leading-relaxed">
                    {anom.explanation}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-200/40 dark:border-neutral-800/60 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Observed</span>
                      <strong className="text-neutral-900 dark:text-white">
                        {anom.observed_value.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Expected Baseline</span>
                      <strong className="text-neutral-600 dark:text-neutral-300">
                        {anom.expected_baseline.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Z-Score</span>
                      <strong className="text-neutral-900 dark:text-white">
                        {anom.z_score !== null ? `${anom.z_score}σ` : 'Non-param'}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION D: MODEL EVALUATION */}
      {activeSubTab === 'evaluation' && forecastData?.evaluation && (
        <div className="space-y-6">
          {/* Model Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Benchmarked via Chronological Train/Test Split
                </span>
                <h3 className="text-xl font-bold mt-2 text-neutral-900 dark:text-white font-heading">
                  {forecastData.model_name} (v{forecastData.model_version}) vs Seasonal-Naive Baseline
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Evaluated strictly on held-out out-of-sample data. Zero future leakage.
                </p>
              </div>

              <div className="text-xs text-neutral-500 space-y-1">
                <div>
                  Train Window: <strong>{forecastData.evaluation.train_period.start_date}</strong> to{' '}
                  <strong>{forecastData.evaluation.train_period.end_date}</strong> ({forecastData.evaluation.train_period.sample_size_days} days)
                </div>
                <div>
                  Test Window: <strong>{forecastData.evaluation.test_period.start_date}</strong> to{' '}
                  <strong>{forecastData.evaluation.test_period.end_date}</strong> ({forecastData.evaluation.test_period.test_days} held-out days)
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Model MAE</span>
                <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-heading">
                  {forecastData.evaluation.mae}
                </div>
                <span className="text-[10px] text-neutral-500">Mean Absolute Error</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Model RMSE</span>
                <div className="text-2xl font-black mt-1 text-teal-600 dark:text-teal-400 font-heading">
                  {forecastData.evaluation.rmse ?? 'N/A'}
                </div>
                <span className="text-[10px] text-neutral-500">Root Mean Sq. Error</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Baseline MAE</span>
                <div className="text-2xl font-black mt-1 text-neutral-800 dark:text-neutral-200 font-heading">
                  {forecastData.evaluation.baseline_mae}
                </div>
                <span className="text-[10px] text-neutral-500">RMSE: {forecastData.evaluation.baseline_rmse ?? 'N/A'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">WAPE (%)</span>
                <div className="text-2xl font-black mt-1 text-blue-500 font-heading">
                  {forecastData.evaluation.wape}%
                </div>
                <span className="text-[10px] text-neutral-500">Weighted Abs. % Error</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Improvement</span>
                <div className="text-2xl font-black mt-1 text-emerald-500 font-heading">
                  +{forecastData.evaluation.improvement_percentage}%
                </div>
                <span className="text-[10px] text-neutral-500">Over naive benchmark</span>
              </div>
            </div>
          </div>

          {/* Model Comparison Benchmark Table */}
          {forecastData.evaluation.model_comparison && forecastData.evaluation.model_comparison.length > 0 && (
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden bg-white dark:bg-[#0E0E0E] shadow-xs">
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white font-heading">
                    Multi-Model Performance Comparison (Chronological Holdout Validation)
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Rigorous benchmarking against alternative algorithms on held-out out-of-sample data.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero Data Leakage
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Algorithm & Model</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">MAE</th>
                      <th className="py-2.5 px-4">RMSE</th>
                      <th className="py-2.5 px-4">WAPE (%)</th>
                      <th className="py-2.5 px-4">Improvement vs Baseline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {forecastData.evaluation.model_comparison.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515]">
                        <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{m.model_name}</td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-medium">{m.role}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              m.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : m.status === 'CANDIDATE'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">{m.mae}</td>
                        <td className="py-3 px-4 font-semibold text-teal-600 dark:text-teal-400">{m.rmse}</td>
                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-semibold">{m.wape}%</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {m.improvement_vs_baseline_pct > 0 ? `+${m.improvement_vs_baseline_pct}%` : `${m.improvement_vs_baseline_pct}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Test Split Residuals Table */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden bg-white dark:bg-[#0E0E0E]">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-bold text-xs text-neutral-800 dark:text-neutral-200">
              Held-Out Test Data Residuals (Actual vs Model Prediction vs Baseline)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Test Date</th>
                    <th className="py-2.5 px-4">Held-Out Actual</th>
                    <th className="py-2.5 px-4">Model Prediction</th>
                    <th className="py-2.5 px-4">Baseline Prediction</th>
                    <th className="py-2.5 px-4">Absolute Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {forecastData.evaluation.actual_vs_predicted_test.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515]">
                      <td className="py-2.5 px-4 font-semibold">{row.date}</td>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">{row.actual}</td>
                      <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{row.predicted}</td>
                      <td className="py-2.5 px-4 text-neutral-500">{row.baseline}</td>
                      <td className="py-2.5 px-4 font-semibold text-neutral-700 dark:text-neutral-300">{row.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
