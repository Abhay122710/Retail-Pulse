import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { LiveActivityFeed } from '../components/layout/LiveActivityFeed';
import { 
  ShoppingBag, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Database,
  Download,
  LineChart,
  Table,
  Play,
  Layers
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { 
    selectedSource, 
    selectSource, 
    setActiveTab, 
    lastExtractionResult,
    currentInsights,
    liveEvents,
    sendTestEvent
  } = useDashboard();

  return (
    <div className="space-y-10 animate-fadeIn">
      
      {/* 1. MINDORA-INSPIRED HERO BANNER */}
      <section className="relative pt-6 pb-4 flex flex-col items-center text-center">
        
        {/* Floating Centered Avatar Badge with Pulse Ring */}
        <div className="relative mb-6 group cursor-pointer" onClick={() => sendTestEvent()}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-neutral-200 dark:to-neutral-500 p-1 shadow-lg shadow-neutral-900/10 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
              <span className="font-extrabold text-lg sm:text-xl text-neutral-900 dark:text-white font-heading">
                RP
              </span>
            </div>
          </div>
          {/* Live Pulse Ring */}
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </span>
        </div>

        {/* Hero Title with Mixed Typography (Calm your mind with Mindora style) */}
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight leading-[1.1] font-heading">
            <span className="font-extrabold">Pulse</span> your commerce <br className="hidden sm:inline" />
            with <span className="font-black text-neutral-900 dark:text-white">Retail Pulse</span>
          </h1>

          {/* Signature Organic Wavy Underline SVG Accent */}
          <div className="pt-1 pb-3 flex justify-center">
            <svg 
              className="w-48 sm:w-64 h-4 text-neutral-300 dark:text-neutral-700" 
              viewBox="0 0 200 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 8C20 2 40 14 60 8C80 2 100 14 120 8C140 2 160 14 180 8C190 5 198 8 198 8" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
            Multi-source e-commerce telemetry & canonical extraction pipeline. Normalize heterogeneous storefronts into unified real-time business intelligence.
          </p>
        </div>

        {/* Dark Pill CTA Button (Mindora 'Download Now ⤓' style) */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('extraction')}
            className="pill-btn-dark px-7 py-3.5 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Run Live Extraction</span>
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className="pill-btn-subtle px-6 py-3.5 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2. THE THREE FEATURE/STAT SUB-CARDS (Directly modeled on the reference image) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-12 text-left">
          
          {/* Sub-Card 1: Evidence-based tools / Canonical Ingestion */}
          <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white font-heading">
                  Unified Canonical Pipeline
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Automated schema normalization
                </p>
              </div>
              <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-600 dark:text-neutral-400 font-bold">
                i
              </span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">
                Grounded guidance for multi-store growth and sync.
              </p>
            </div>
          </div>

          {/* Sub-Card 2: Powered by Community / Live Telemetry Numbers */}
          <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white font-heading">
                Storefront Ingestion Volume
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Real-time telemetry records
              </p>
            </div>

            <div className="mt-8 flex items-baseline gap-6">
              <div>
                <span className="text-3xl font-extrabold text-neutral-950 dark:text-white font-heading">
                  12.4k
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  Events Streamed
                </p>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-neutral-400 dark:text-neutral-600 font-heading">
                  48.2k
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  Synced Records
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Teaser / Live Stream Radar with Preview Play Overlay */}
          <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white font-heading">
                  Live Stream Radar
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Real-time storefront pulse
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                Active
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {liveEvents.length > 0 ? `${liveEvents[0].event_type.replace('_', ' ')}` : 'Live Event Pipeline'}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {liveEvents.length > 0 ? `Source: ${liveEvents[0].source}` : 'Telemetry active'}
                </p>
              </div>

              {/* Mindora Teaser Play Pill/Square */}
              <button
                onClick={() => sendTestEvent()}
                title="Send simulated live event"
                className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 3. VISUAL PIPELINE FLOW */}
      <DataPipelineVisual />

      {/* 4. REAL-TIME ACTIVITY FEED STREAM */}
      <LiveActivityFeed />

      {/* 5. SELECT DATA SOURCE SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-neutral-900 dark:text-white" />
              Connected Storefront Sources
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select an e-commerce platform to extract data from
            </p>
          </div>

          <button
            onClick={() => setActiveTab('sources')}
            className="text-xs text-neutral-900 dark:text-neutral-200 hover:underline font-semibold flex items-center gap-1"
          >
            All Source Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ShopPulse Card */}
          <div 
            onClick={() => {
              selectSource('ShopPulse');
              setActiveTab('extraction');
            }}
            className={`p-6 rounded-[28px] cursor-pointer relative overflow-hidden transition-all border ${
              selectedSource === 'ShopPulse'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xl'
                : 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                selectedSource === 'ShopPulse'
                  ? 'bg-white/10 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              }`}>
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                ● Connected
              </span>
            </div>

            <h3 className="text-xl font-bold font-heading">ShopPulse</h3>
            <p className={`text-xs mb-4 ${selectedSource === 'ShopPulse' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
              Lifestyle & Apparel Storefront
            </p>
            
            <div className="text-xs space-y-1 mb-6">
              <p className="font-semibold">Schemas:</p>
              <p className={selectedSource === 'ShopPulse' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}>
                Customers, Products, Orders, Cart Telemetry, Reviews
              </p>
            </div>

            <button className={`w-full py-2.5 rounded-full font-bold text-xs transition-all ${
              selectedSource === 'ShopPulse'
                ? 'bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white'
                : 'pill-btn-dark'
            }`}>
              Select ShopPulse
            </button>
          </div>

          {/* TechMart Card */}
          <div 
            onClick={() => {
              selectSource('TechMart');
              setActiveTab('extraction');
            }}
            className={`p-6 rounded-[28px] cursor-pointer relative overflow-hidden transition-all border ${
              selectedSource === 'TechMart'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xl'
                : 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                selectedSource === 'TechMart'
                  ? 'bg-white/10 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              }`}>
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                ● Connected
              </span>
            </div>

            <h3 className="text-xl font-bold font-heading">TechMart</h3>
            <p className={`text-xs mb-4 ${selectedSource === 'TechMart' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
              Consumer Tech & Electronics Storefront
            </p>
            
            <div className="text-xs space-y-1 mb-6">
              <p className="font-semibold">Schemas:</p>
              <p className={selectedSource === 'TechMart' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}>
                Users, Products, Transactions, Inventory, Behavioral Logs
              </p>
            </div>

            <button className={`w-full py-2.5 rounded-full font-bold text-xs transition-all ${
              selectedSource === 'TechMart'
                ? 'bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white'
                : 'pill-btn-dark'
            }`}>
              Select TechMart
            </button>
          </div>

        </div>
      </section>

      {/* 6. RECENT EXTRACTION & INSIGHTS SUMMARY WIDGETS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT EXTRACTION */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-900 dark:text-white" />
              Recent Data Extraction
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Successful
            </span>
          </div>

          {lastExtractionResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400">Active Source</p>
                  <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                    {lastExtractionResult.source}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400">Records Extracted</p>
                  <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                    {lastExtractionResult.recordsExtracted.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400">Extraction Duration</p>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {lastExtractionResult.extractionTime}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400">Timestamp</p>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {lastExtractionResult.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('extracted-data')}
                className="w-full py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Table className="w-4 h-4" />
                View Extracted Data Table
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4">No extraction run yet. Select a source and click Extract Data.</p>
          )}
        </div>

        {/* LATEST INSIGHTS */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <LineChart className="w-4 h-4 text-neutral-900 dark:text-white" />
              Latest Insights Snapshot ({selectedSource})
            </h3>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs text-neutral-900 dark:text-neutral-200 hover:underline font-semibold"
            >
              Full Analytics →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Total Revenue</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">
                {currentInsights.totalRevenue}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Orders / Tx</p>
              <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                {currentInsights.totalOrdersOrTx}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
              <p className="text-neutral-500 dark:text-neutral-400">Top Product</p>
              <p className="text-xs font-bold text-neutral-950 dark:text-white truncate mt-0.5">
                {currentInsights.topProduct}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('insights')}
            className="w-full py-2.5 rounded-full pill-btn-subtle text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LineChart className="w-4 h-4" />
            Explore Visual Insights
          </button>
        </div>

      </section>

    </div>
  );
};
