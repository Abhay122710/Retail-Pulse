import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { StatsCard } from '../components/common/StatsCard';
import { IntegrationGaugeCard } from '../components/dashboard/IntegrationGaugeCard';
import { AccentActionCard } from '../components/dashboard/AccentActionCard';
import { PerformanceChartCard } from '../components/dashboard/PerformanceChartCard';
import { PipelineTasksCard } from '../components/dashboard/PipelineTasksCard';
import { LiveCustomerScoreCard } from '../components/dashboard/LiveCustomerScoreCard';
import { StorefrontCourseCards } from '../components/dashboard/StorefrontCourseCards';
import { IntelligenceNotesCard } from '../components/dashboard/IntelligenceNotesCard';
import { RegionalDemographicsCard } from '../components/dashboard/RegionalDemographicsCard';
import { DealsScheduleCard } from '../components/dashboard/DealsScheduleCard';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { LiveActivityFeed } from '../components/layout/LiveActivityFeed';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Search,
  Layers
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { 
    stylePreset, 
    searchQuery, 
    setSearchQuery, 
    currentInsights,
    liveEvents,
    setActiveTab
  } = useDashboard();

  const isFluenta = stylePreset === 'fluenta';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">

      {/* ============================================================== */}
      {/* 1. TOP HEADER / KPI BAR (Matching Reference Image 2 & Image 1) */}
      {/* ============================================================== */}
      {!isFluenta ? (
        /* Ember Style: Wide Search Input + 3 Inline KPI Badges */
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
          
          {/* Left: Search pill input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search something..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3 rounded-full text-sm bg-white dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
            <button className="absolute right-2 top-2 w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-transform hover:scale-105 cursor-pointer">
              <Search size={14} />
            </button>
          </div>

          {/* Right: Inline KPI Stat Badges matching Image 2 */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-start lg:justify-end">
            
            {/* KPI 1: Total Revenue / Project Deal */}
            <div 
              onClick={() => setActiveTab('profitability')}
              className="flex items-baseline gap-2 cursor-pointer group"
            >
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Total Project Deal
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-heading group-hover:text-amber-500 transition-colors">
                    1,354
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    +18%
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 2: Total Clients */}
            <div 
              onClick={() => setActiveTab('segmentation')}
              className="flex items-baseline gap-2 cursor-pointer group"
            >
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Total Clients
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-heading group-hover:text-amber-500 transition-colors">
                    578
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400">
                    -5%
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 3: Total Quotes / Orders */}
            <div 
              onClick={() => setActiveTab('extraction')}
              className="flex items-baseline gap-2 cursor-pointer group"
            >
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Total Quotes
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-heading group-hover:text-amber-500 transition-colors">
                    909
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    +12%
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Fluenta Style: Large Title + Subtext */
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight font-heading">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Multi-store canonical intelligence, real-time telemetry, & demand forecasting
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0D8FF] dark:bg-[#34275E] text-[#4C1D95] dark:text-[#E9D5FF]">
              Fluenta Serene Grid
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STATS CARDS ROW (Matching Code Snippet from image)          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Net Revenue"
          value={currentInsights.totalRevenue || '₹255,889'}
          change={18}
          icon={DollarSign}
          subtitle="vs previous cycle"
          onClick={() => setActiveTab('profitability')}
        />
        <StatsCard
          title="Gross Orders / Tx"
          value={currentInsights.totalOrdersOrTx || '1,354'}
          change={12}
          icon={ShoppingBag}
          subtitle="ShopPulse & TechMart"
          onClick={() => setActiveTab('extraction')}
        />
        <StatsCard
          title="Active Customers"
          value="578"
          change={-5}
          isPositive={false}
          icon={Users}
          subtitle="Unique client sessions"
          onClick={() => setActiveTab('segmentation')}
        />
        <StatsCard
          title="Live Telemetry Ingestion"
          value={liveEvents.length > 0 ? `${1240 + liveEvents.length}` : '1,240'}
          change={24}
          icon={Layers}
          subtitle="Canonical events synced"
          onClick={() => setActiveTab('live-stream')}
        />
      </div>

      {/* ============================================================== */}
      {/* 3. BENTO GRID LAYOUT                                          */}
      {/* ============================================================== */}
      {isFluenta ? (
        /* ================= FLUENTA BENTO GRID (Image 1) ================ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Span 1): Course/Storefront Selection with 3 Pastel Cards */}
          <div className="lg:col-span-1 space-y-6">
            <StorefrontCourseCards />
          </div>

          {/* Right Column (Span 2): Performance Chart + Tasks & Friends Score */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top: Performance Chart with smooth area curves */}
            <PerformanceChartCard />

            {/* Bottom: Homework Tasks + Friends Score Leaderboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PipelineTasksCard />
              <LiveCustomerScoreCard />
            </div>

          </div>

        </div>
      ) : (
        /* ================== EMBER BENTO GRID (Image 2) ================= */
        <div className="space-y-6">
          
          {/* Row 1: 4 Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <IntegrationGaugeCard />
            <AccentActionCard themeStyle="ember" />
            <IntelligenceNotesCard />
            <RegionalDemographicsCard />
          </div>

          {/* Row 2: Performance Chart + Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChartCard />
            </div>
            <div className="lg:col-span-1">
              <DealsScheduleCard />
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 4. VISUAL PIPELINE FLOW & REAL-TIME ACTIVITY FEED             */}
      {/* ============================================================== */}
      <div className="space-y-6 pt-4">
        <DataPipelineVisual />
        <LiveActivityFeed />
      </div>

    </div>
  );
};

export default OverviewPage;
