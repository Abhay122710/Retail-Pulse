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
  const { selectedSource, currentInsights, setActiveTab } = useDashboard();
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

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header & Source Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-urbanist tracking-tight">
            Data Insights
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real behavioral metrics & insights calculated from live connector events for <span className="text-white font-semibold">{selectedSource}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#070319] border border-[#A068FF]/30 text-xs font-mono">
            <span className="text-slate-400">ENGINE:</span>{' '}
            <span className="font-bold text-[#A068FF]">{selectedSource} Connector Stream</span>
          </div>

          <button
            onClick={() => setActiveTab('sources')}
            className="px-3.5 py-1.5 rounded-2xl bg-[#A068FF]/20 border border-[#A068FF]/40 text-[#A068FF] text-xs font-bold hover:bg-[#A068FF]/30 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Change Source
          </button>
        </div>
      </div>

      {/* LIVE ACTIVITY REAL-TIME FEED */}
      <LiveActivityFeed />

      {/* 6 KEY INSIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInsights.kpis.map((kpi, idx) => {
          const Icon = getIcon(kpi.iconName);

          return (
            <div 
              key={idx}
              className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 relative overflow-hidden group hover:border-[#A068FF]/60 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-urbanist">
                  {kpi.title}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#A068FF]/15 border border-[#A068FF]/30 flex items-center justify-center text-[#A068FF] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white font-urbanist tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {kpi.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* USER JOURNEY FUNNEL & CART BEHAVIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Journey Funnel */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#A068FF]" />
                User Journey Funnel
              </h3>
              <p className="text-xs text-slate-400">Step-by-step conversion pipeline from views to purchase</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(currentInsights.funnel || []).map((step, idx) => (
              <div key={step.step} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2 font-urbanist">
                    <span className="w-5 h-5 rounded-full bg-[#A068FF]/20 text-[#A068FF] font-mono text-[11px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {step.step}
                  </span>
                  <div className="font-mono text-slate-400">
                    <span className="font-bold text-white mr-2">{step.count.toLocaleString()} events</span>
                    <span className="text-emerald-400 font-bold">({step.conversion})</span>
                  </div>
                </div>

                <div className="w-full bg-[#070319] h-2.5 rounded-full overflow-hidden border border-[#A068FF]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#A068FF] to-[#00F0FF] rounded-full"
                    style={{ width: `${Math.max(8, 100 - idx * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Behavior & Abandonment */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist flex items-center gap-2">
                <CartIcon className="w-5 h-5 text-[#A068FF]" />
                Cart Behavior Analytics
              </h3>
              <p className="text-xs text-slate-400">Additions, views, checkout starts & abandonment rate</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">
              Abandonment: {currentInsights.cartBehavior?.abandonmentRate || '28.4%'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Cart Additions</p>
              <p className="text-xl font-bold text-emerald-400 font-urbanist mt-1">
                {currentInsights.cartBehavior?.cartAdditions.toLocaleString() || 428}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Cart Removals</p>
              <p className="text-xl font-bold text-rose-400 font-urbanist mt-1">
                {currentInsights.cartBehavior?.cartRemovals.toLocaleString() || 64}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Checkout Starts</p>
              <p className="text-xl font-bold text-cyan-400 font-urbanist mt-1">
                {currentInsights.cartBehavior?.checkoutStarts.toLocaleString() || 312}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Completed Orders</p>
              <p className="text-xl font-bold text-[#A068FF] font-urbanist mt-1">
                {currentInsights.cartBehavior?.completedOrders.toLocaleString() || 184}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* TOP SEARCHES & DWELL TIME TABLE */}
      <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
          <div>
            <h3 className="text-lg font-bold text-white font-urbanist flex items-center gap-2">
              <Search className="w-5 h-5 text-[#A068FF]" />
              Top Search Queries & Demand Signals
            </h3>
            <p className="text-xs text-slate-400">Search keywords entered by visitors on {selectedSource}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070319] border-b border-[#A068FF]/20 text-slate-400 font-mono">
              <tr>
                <th className="p-3">Search Query</th>
                <th className="p-3 text-center">Search Frequency</th>
                <th className="p-3 text-center">Zero Results Count</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A068FF]/10 text-slate-200">
              {(currentInsights.searchInsights || []).map((s, idx) => (
                <tr key={idx} className="hover:bg-[#A068FF]/5">
                  <td className="p-3 font-semibold text-white font-mono">"{s.query}"</td>
                  <td className="p-3 text-center font-bold text-[#A068FF]">{s.count} searches</td>
                  <td className="p-3 text-center font-mono text-slate-400">{s.noResultsCount}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.noResultsCount > 0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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

      {/* 4 BASIC CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: Revenue Trend */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist">
                1. {isShopPulse ? 'Revenue Trend (7-Day)' : 'Transaction Revenue Trend'}
              </h3>
              <p className="text-xs text-slate-400">Daily gross revenue extracted stream</p>
            </div>
            <span className="text-xs font-mono text-[#A068FF]">
              {isShopPulse ? 'ShopPulse Order Stream' : 'TechMart SKU Stream'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentInsights.revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isShopPulse ? '#A068FF' : '#00F0FF'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isShopPulse ? '#A068FF' : '#00F0FF'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070319', borderColor: '#A068FF', borderRadius: '12px', fontSize: '12px' }} 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={isShopPulse ? '#A068FF' : '#00F0FF'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Sales by Category / Department */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist">
                2. {isShopPulse ? 'Sales by Category' : 'Sales by Department'}
              </h3>
              <p className="text-xs text-slate-400">Share of total extracted revenue</p>
            </div>
            <span className="text-xs font-mono text-[#A068FF]">Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentInsights.categoryBreakdown} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={110} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070319', borderColor: '#A068FF', borderRadius: '12px', fontSize: '12px' }}
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
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist">
                3. Top Products
              </h3>
              <p className="text-xs text-slate-400">Best performing SKUs by volume</p>
            </div>
            <span className="text-xs font-mono text-[#A068FF]">Top 5 SKUs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentInsights.topProducts}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(t) => t.split(' ')[0]} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070319', borderColor: '#A068FF', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Units`, 'Volume Sold']}
                />
                <Bar dataKey="unitsSold" fill={isShopPulse ? '#A068FF' : '#00F0FF'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Status Distribution */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <div>
              <h3 className="text-lg font-bold text-white font-urbanist">
                4. {isShopPulse ? 'Orders by Status' : 'Transactions by Status'}
              </h3>
              <p className="text-xs text-slate-400">Full lifecycle breakdown</p>
            </div>
            <span className="text-xs font-mono text-[#A068FF]">Status Breakdown</span>
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
                  contentStyle={{ backgroundColor: '#070319', borderColor: '#A068FF', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} records`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 flex-wrap text-xs pt-2">
            {currentInsights.statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.status}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
