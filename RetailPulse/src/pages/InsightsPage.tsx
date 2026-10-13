import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { LiveActivityFeed } from '../components/layout/LiveActivityFeed';
import { 
  LineChart as LineChartIcon, 
  IndianRupee, 
  ShoppingCart, 
  Award, 
  Layers, 
  TrendingUp, 
  MapPin, 
  Activity, 
  Cpu, 
  Headphones, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Filter,
  ShoppingCart as CartIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const InsightsPage: React.FC = () => {
  const { selectedSource, currentInsights, setActiveTab, theme } = useDashboard();
  const isShopPulse = selectedSource === 'ShopPulse';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'IndianRupee': return IndianRupee;
      case 'ShoppingCart': return ShoppingCart;
      case 'Award': return Award;
      case 'Layers': return Layers;
      case 'TrendingUp': return TrendingUp;
      case 'MapPin': return MapPin;
      case 'Activity': return Activity;
      case 'Cpu': return Cpu;
      case 'Headphones': return Headphones;
      case 'CheckCircle2': return CheckCircle2;
      default: return LineChartIcon;
    }
  };

  const tooltipBg = theme === 'dark' ? '#070319' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#A068FF' : '#E2E8F0';
  const tooltipColor = theme === 'dark' ? '#FFFFFF' : '#0F172A';

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header & Source Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
            Behavioral Intelligence & Metrics
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Real telemetry & metrics dynamically calculated from live events for <span className="font-semibold text-neutral-900 dark:text-white">{selectedSource}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-400">ENGINE:</span>{' '}
            <span className="font-bold text-neutral-900 dark:text-white">{selectedSource} Stream</span>
          </div>

          <button
            onClick={() => setActiveTab('sources')}
            className="pill-btn-subtle px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Switch Source
          </button>
        </div>
      </div>

      {/* LIVE ACTIVITY REAL-TIME FEED */}
      <LiveActivityFeed />

      {/* 6 KEY INSIGHT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInsights.kpis.map((kpi, idx) => {
          const Icon = getIcon(kpi.iconName);

          return (
            <div 
              key={idx}
              className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 relative overflow-hidden group hover:border-neutral-400 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-heading">
                  {kpi.title}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {kpi.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* USER JOURNEY FUNNEL & CART BEHAVIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Journey Funnel */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-900 dark:text-white" />
                User Journey Funnel
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Step-by-step conversion pipeline from views to purchase</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(currentInsights.funnel || []).map((step, idx) => (
              <div key={step.step} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 font-heading">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {step.step}
                  </span>
                  <div className="font-mono text-neutral-500">
                    <span className="font-bold text-neutral-900 dark:text-white mr-2">{step.count.toLocaleString()}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">({step.conversion})</span>
                  </div>
                </div>

                <div className="w-full bg-neutral-200/70 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(8, 100 - idx * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Behavior & Abandonment */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
                <CartIcon className="w-4 h-4 text-neutral-900 dark:text-white" />
                Cart Behavior Analytics
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Additions, views, checkout starts & abandonment rate</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
              Abandonment: {currentInsights.cartBehavior?.abandonmentRate || '28.4%'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs pt-1">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Cart Additions</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-1">
                {currentInsights.cartBehavior?.cartAdditions.toLocaleString() || 428}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Cart Removals</p>
              <p className="text-xl font-bold text-rose-500 font-heading mt-1">
                {currentInsights.cartBehavior?.cartRemovals.toLocaleString() || 64}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Checkout Starts</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white font-heading mt-1">
                {currentInsights.cartBehavior?.checkoutStarts.toLocaleString() || 312}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Completed Orders</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white font-heading mt-1">
                {currentInsights.cartBehavior?.completedOrders.toLocaleString() || 184}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* TOP SEARCHES & DEMAND SIGNALS */}
      <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-900 dark:text-white" />
              Top Search Queries & Demand Signals
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Search keywords entered by storefront visitors on {selectedSource}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white dark:bg-neutral-800/80 border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase font-medium">
              <tr>
                <th className="p-3">Search Query</th>
                <th className="p-3 text-center">Search Frequency</th>
                <th className="p-3 text-center">Zero Results Count</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {(currentInsights.searchInsights || []).map((s, idx) => (
                <tr key={idx} className="hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40">
                  <td className="p-3 font-semibold text-neutral-900 dark:text-white font-mono">"{s.query}"</td>
                  <td className="p-3 text-center font-bold">{s.count} searches</td>
                  <td className="p-3 text-center font-mono text-neutral-400">{s.noResultsCount}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.noResultsCount > 0
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {s.noResultsCount > 0 ? 'Demand Gap' : 'Full Matches'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 MODERN CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Revenue Trend */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading">
                1. {isShopPulse ? 'Revenue Trend (7-Day)' : 'Transaction Revenue Trend'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Daily gross revenue extracted stream</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">
              {isShopPulse ? 'ShopPulse Stream' : 'TechMart Stream'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentInsights.revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#A068FF' : '#0F172A'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={theme === 'dark' ? '#A068FF' : '#0F172A'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    color: tooltipColor,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }} 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme === 'dark' ? '#A068FF' : '#0F172A'} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Sales by Category / Department */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading">
                2. {isShopPulse ? 'Sales by Category' : 'Sales by Department'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Share of total extracted revenue</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentInsights.categoryBreakdown} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    color: tooltipColor,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                  {currentInsights.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Top Products */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading">
                3. Top Performing SKUs
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Best performing products by unit volume</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Top 5 SKUs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentInsights.topProducts}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(t) => t.split(' ')[0]} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    color: tooltipColor,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  formatter={(val: any) => [`${val} Units`, 'Volume Sold']}
                />
                <Bar dataKey="unitsSold" fill={theme === 'dark' ? '#A068FF' : '#0F172A'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Status Distribution */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading">
                4. {isShopPulse ? 'Orders by Status' : 'Transactions by Status'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Lifecycle distribution</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Breakdown</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentInsights.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {currentInsights.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    color: tooltipColor,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  formatter={(val: any) => [`${val} records`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 flex-wrap text-xs pt-2">
            {currentInsights.statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">{item.status}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
