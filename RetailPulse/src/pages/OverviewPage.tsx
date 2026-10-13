import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { LiveActivityFeed } from '../components/layout/LiveActivityFeed';
import { 
  ShoppingBag, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Database,
  Download,
  LineChart,
  Table
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { 
    selectedSource, 
    selectSource, 
    setActiveTab, 
    lastExtractionResult,
    currentInsights 
  } = useDashboard();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Flow Pipeline */}
      <DataPipelineVisual />

      {/* Hero Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-[#A068FF]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A068FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A068FF]/20 border border-[#A068FF]/40 text-[#A068FF] text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            E-Commerce Data Extraction Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white font-urbanist tracking-tight leading-tight">
            RETAIL <span className="text-[#A068FF] purple-glow-text">PULSE</span>
          </h1>
          <p className="text-xl text-[#A068FF] font-semibold font-urbanist tracking-wide">
            "Extract. Understand. Act."
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Direct multi-source data extraction pipeline for e-commerce stores. Connect your data source, extract structured records, and unlock immediate revenue insights.
          </p>
        </div>
      </div>

      {/* LIVE ACTIVITY REAL-TIME STREAM FEED */}
      <LiveActivityFeed />

      {/* 1. SELECT DATA SOURCE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-urbanist flex items-center gap-2">
              <Database className="w-5 h-5 text-[#A068FF]" />
              Select Data Source
            </h2>
            <p className="text-xs text-slate-400">Choose an e-commerce platform to extract data from</p>
          </div>

          <button
            onClick={() => setActiveTab('sources')}
            className="text-xs text-[#A068FF] hover:underline font-semibold flex items-center gap-1"
          >
            View All Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ShopPulse Card */}
          <div 
            onClick={() => {
              selectSource('ShopPulse');
              setActiveTab('extraction');
            }}
            className={`glass-card p-6 rounded-3xl cursor-pointer relative overflow-hidden group border ${
              selectedSource === 'ShopPulse'
                ? 'border-[#A068FF] bg-[#A068FF]/10 shadow-lg shadow-[#A068FF]/20'
                : 'border-[#A068FF]/20 hover:border-[#A068FF]/60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#A068FF]/20 border border-[#A068FF]/40 flex items-center justify-center text-[#A068FF]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                ● Connected
              </span>
            </div>

            <h3 className="text-xl font-bold text-white font-urbanist">ShopPulse</h3>
            <p className="text-xs text-slate-400 mb-4">General E-Commerce Platform</p>
            
            <div className="text-xs text-slate-300 space-y-1 mb-6">
              <p className="font-semibold text-slate-200">Data Available:</p>
              <p className="text-slate-400">Customers, Products, Orders, Order Items, Reviews</p>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A068FF] to-[#7C3AED] text-white font-bold text-xs shadow-md shadow-[#A068FF]/30 group-hover:scale-[1.02] transition-transform">
              Select ShopPulse
            </button>
          </div>

          {/* TechMart Card */}
          <div 
            onClick={() => {
              selectSource('TechMart');
              setActiveTab('extraction');
            }}
            className={`glass-card p-6 rounded-3xl cursor-pointer relative overflow-hidden group border ${
              selectedSource === 'TechMart'
                ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-lg shadow-[#00F0FF]/20'
                : 'border-[#A068FF]/20 hover:border-[#00F0FF]/60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                ● Connected
              </span>
            </div>

            <h3 className="text-xl font-bold text-white font-urbanist">TechMart</h3>
            <p className="text-xs text-slate-400 mb-4">Electronics E-Commerce Platform</p>
            
            <div className="text-xs text-slate-300 space-y-1 mb-6">
              <p className="font-semibold text-slate-200">Data Available:</p>
              <p className="text-slate-400">Users, Products, Transactions, Transaction Items, Inventory, Reviews</p>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-500/30 group-hover:scale-[1.02] transition-transform">
              Select TechMart
            </button>
          </div>

        </div>
      </div>

      {/* 2. RECENT EXTRACTION & 3. LATEST INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT EXTRACTION */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <h3 className="text-lg font-bold text-white font-urbanist flex items-center gap-2">
              <Download className="w-5 h-5 text-[#A068FF]" />
              Recent Data Extraction
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Successful
            </span>
          </div>

          {lastExtractionResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
                  <p className="text-slate-400">Last Source</p>
                  <p className="text-base font-bold text-white font-urbanist">{lastExtractionResult.source}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
                  <p className="text-slate-400">Records Extracted</p>
                  <p className="text-base font-bold text-[#A068FF] font-urbanist">
                    {lastExtractionResult.recordsExtracted.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
                  <p className="text-slate-400">Extraction Time</p>
                  <p className="text-sm font-semibold text-slate-200">{lastExtractionResult.extractionTime}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
                  <p className="text-slate-400">Timestamp</p>
                  <p className="text-sm font-semibold text-slate-200">{lastExtractionResult.timestamp}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('extracted-data')}
                className="w-full py-2.5 rounded-2xl bg-[#070319] border border-[#A068FF]/40 text-[#A068FF] font-bold text-xs hover:bg-[#A068FF]/10 transition-colors flex items-center justify-center gap-2"
              >
                <Table className="w-4 h-4" />
                View Extracted Data Table
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">No extraction run yet. Select a source and click Extract Data.</p>
          )}
        </div>

        {/* LATEST INSIGHTS */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
            <h3 className="text-lg font-bold text-white font-urbanist flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#A068FF]" />
              Latest Insights ({selectedSource})
            </h3>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs text-[#A068FF] hover:underline font-semibold"
            >
              Full Analytics →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Total Revenue</p>
              <p className="text-base font-bold text-emerald-400 font-urbanist">{currentInsights.totalRevenue}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">{selectedSource === 'ShopPulse' ? 'Total Orders' : 'Transactions'}</p>
              <p className="text-base font-bold text-[#A068FF] font-urbanist">{currentInsights.totalOrdersOrTx}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Top Product</p>
              <p className="text-xs font-bold text-white truncate">{currentInsights.topProduct}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('insights')}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#A068FF]/30 to-[#7C3AED]/30 border border-[#A068FF] text-white font-bold text-xs hover:bg-[#A068FF]/40 transition-colors flex items-center justify-center gap-2"
          >
            <LineChart className="w-4 h-4" />
            View Generated Insights
          </button>
        </div>

      </div>

    </div>
  );
};
