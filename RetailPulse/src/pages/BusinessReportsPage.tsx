import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import { ActionMenu } from '../components/common/ActionMenu';
import { SegmentedControl } from '../components/common/SegmentedControl';
import {
  Printer,
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Building,
  ShieldCheck,
  Package,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

export const BusinessReportsPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);

  const loadReport = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const src = selectedSource === 'ALL SOURCES' ? undefined : selectedSource;
      const res = await retailPulseApiService.getExecutiveReport(src, periodDays);
      if (res && res.success && res.data) {
        setReport(res.data);
      } else {
        setError('Failed to load executive business report.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with report service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedSource, periodDays]);

  const handlePrint = () => {
    window.print();
  };

  const getCsvUrl = (section: string) => {
    return retailPulseApiService.getReportCsvUrl(section, selectedSource);
  };

  if (loading && !report) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Compiling executive business intelligence report...</p>
      </div>
    );
  }

  const exec = report?.executive_summary;
  const period = report?.reporting_period;
  const storeBench = report?.store_benchmarking;
  const pipeline = report?.pipeline_health_summary;
  const inv = report?.inventory_risk_summary;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 print:m-0 print:p-0">
      {/* Non-Printable Header & Toolbar */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Automated Business Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Audit Reconciled
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Executive-ready business performance report with verified financial metrics, supply chain risks, and CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <SegmentedControl
            value={periodDays}
            onChange={(d) => setPeriodDays(d)}
            options={[
              { value: 7, label: '7d' },
              { value: 14, label: '14d' },
              { value: 30, label: '30d' },
              { value: 90, label: '90d' }
            ]}
          />

          {/* Consolidated Export CSV Menu */}
          <ActionMenu
            label="Export CSV"
            icon={FileSpreadsheet}
            variant="secondary"
            items={[
              {
                id: 'csv-kpis',
                label: 'KPIs Summary CSV',
                description: 'Financial & operational performance',
                icon: Download,
                href: getCsvUrl('kpis'),
                download: true
              },
              {
                id: 'csv-products',
                label: 'Product Economics CSV',
                description: 'Unit sales, gross margins & Pareto tiers',
                icon: Download,
                href: getCsvUrl('products'),
                download: true
              },
              {
                id: 'csv-inventory',
                label: 'Inventory Risk CSV',
                description: 'Stockouts, safety stock & reorder point data',
                icon: Download,
                href: getCsvUrl('inventory'),
                download: true
              }
            ]}
          />

          {/* Refresh Action */}
          <button
            onClick={() => loadReport(true)}
            disabled={refreshing}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-[#18181b] border-neutral-800 text-neutral-300 hover:bg-[#222226]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
            title="Recalculate report from live store telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Primary Action: Print / PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-neutral-950 text-white dark:bg-white dark:text-black shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-3 print:hidden">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Printable Executive Report Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm print:border-none print:shadow-none p-6 md:p-10 space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                RP
              </div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                RetailPulse Executive Business Review
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Multi-Source Business Intelligence & Supply Chain Performance Report
            </p>
          </div>

          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{report?.report_id}</div>
            <div>Generated: {report?.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium">Scope: {period?.source}</div>
          </div>
        </div>

        {/* Reporting Period Badge */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-300 gap-2">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Analyzed Period: <strong>{period?.days_analyzed} Days</strong> ({period?.start_date?.slice(0, 10)} to {period?.end_date?.slice(0, 10)})
          </span>
          <span className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Active Channels: <strong>ShopPulse</strong> & <strong>TechMart</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Data Quality Status: <strong className="text-emerald-600">{pipeline?.overall_health}</strong>
          </span>
        </div>

        {/* Section 1: Executive KPI Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> 1. Financial & Transaction Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Gross Sales Volume</div>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100 font-mono">
                ${exec?.total_gross_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Sum of all completed orders</div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Net Reconciled Revenue</div>
              <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                ${exec?.net_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Net of cancellations & refunds</div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Orders & Cancellation Rate</div>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                {exec?.total_orders_placed} Orders
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                {exec?.cancellation_rate_pct}% Cancellation Rate ({exec?.cancelled_orders} voided)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="text-xs text-gray-500">Average Order Value (AOV)</div>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100 font-mono">
                ${exec?.average_order_value?.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{exec?.total_active_products} Catalog SKUs active</div>
            </div>
          </div>
        </div>

        {/* Section 2: Store Benchmarking Performance */}
        {storeBench && storeBench.shop_pulse && storeBench.tech_mart && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" /> 2. Multi-Store Comparative Benchmarking
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Operating Store</th>
                    <th className="px-4 py-3">Gross Revenue</th>
                    <th className="px-4 py-3">Net Revenue</th>
                    <th className="px-4 py-3">Active Orders</th>
                    <th className="px-4 py-3">AOV</th>
                    <th className="px-4 py-3">Conversion Rate</th>
                    <th className="px-4 py-3">Cart Abandonment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-sans font-bold text-gray-900 dark:text-gray-100">
                      ShopPulse (E-Commerce)
                    </td>
                    <td className="px-4 py-3">${storeBench.shop_pulse.gross_revenue?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                      ${storeBench.shop_pulse.net_revenue?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{storeBench.shop_pulse.active_orders_count}</td>
                    <td className="px-4 py-3">${storeBench.shop_pulse.average_order_value?.toFixed(2)}</td>
                    <td className="px-4 py-3">{storeBench.shop_pulse.conversion_rate_pct}%</td>
                    <td className="px-4 py-3">{storeBench.shop_pulse.cart_abandonment_rate_pct}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-sans font-bold text-gray-900 dark:text-gray-100">
                      TechMart (Electronics)
                    </td>
                    <td className="px-4 py-3">${storeBench.tech_mart.gross_revenue?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                      ${storeBench.tech_mart.net_revenue?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{storeBench.tech_mart.active_orders_count}</td>
                    <td className="px-4 py-3">${storeBench.tech_mart.average_order_value?.toFixed(2)}</td>
                    <td className="px-4 py-3">{storeBench.tech_mart.conversion_rate_pct}%</td>
                    <td className="px-4 py-3">{storeBench.tech_mart.cart_abandonment_rate_pct}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {storeBench.comparison && (
              <p className="text-xs text-gray-500 italic">
                Leading Revenue Channel: <strong>{storeBench.comparison.revenue_leading_store}</strong> (leading by ${storeBench.comparison.revenue_difference_amount?.toFixed(2)}). Higher AOV: <strong>{storeBench.comparison.higher_aov_store}</strong>.
              </p>
            )}
          </div>
        )}

        {/* Section 3: Top Products Performance */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" /> 3. Top Contributing Products
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Units Sold</th>
                  <th className="px-4 py-3">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                {report?.top_products?.map((p: any) => (
                  <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-sans font-medium text-gray-900 dark:text-gray-100">
                      {p.product_name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.product_id}</td>
                    <td className="px-4 py-3 font-sans text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">{p.units_sold}</td>
                    <td className="px-4 py-3 font-bold">${p.gross_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Supply Chain & Operational Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supply Chain Risks */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Supply Chain & Inventory Risk Summary
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Critical Risk (Imminent Stockout):</span>
                <strong className="text-red-500">{inv?.critical_items_count} SKUs</strong>
              </div>
              <div className="flex justify-between">
                <span>High Risk (Approaching ROP):</span>
                <strong className="text-amber-500">{inv?.high_risk_items_count} SKUs</strong>
              </div>
              <div className="flex justify-between">
                <span>Safe / Adequate Stock:</span>
                <strong className="text-emerald-500">{inv?.low_risk_items_count} SKUs</strong>
              </div>
            </div>
            {inv?.urgent_replenishment_needed?.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-[11px] font-semibold text-gray-500">Urgent Reorder SKUs:</span>
                <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  {inv.urgent_replenishment_needed.slice(0, 3).join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Operational Pipeline Health */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Ingestion & Data Quality Status
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Overall Connector Health:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{pipeline?.overall_health}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Events Ingested:</span>
                <strong className="font-mono">{pipeline?.total_events_ingested}</strong>
              </div>
              <div className="flex justify-between">
                <span>Validation Rejections:</span>
                <strong className="font-mono text-red-500">{pipeline?.rejected_events}</strong>
              </div>
              <div className="flex justify-between">
                <span>Deduplicated Events:</span>
                <strong className="font-mono text-gray-500">{pipeline?.deduplicated_events}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Evidenced Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> 5. Evidenced Strategic Recommendations
          </h3>
          <div className="space-y-3">
            {report?.evidenced_recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    {rec.title}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{rec.category}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <strong>Supporting Telemetry:</strong> {rec.evidence}
                </div>
                <div className="text-xs text-indigo-700 dark:text-indigo-400">
                  <strong>Recommended Action:</strong> {rec.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit & Integrity Disclaimer */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-400 leading-relaxed">
          <strong>Audit & Non-Fabrication Notice:</strong> {report?.integrity_disclaimer}
        </div>
      </div>
    </div>
  );
};
export default BusinessReportsPage;
