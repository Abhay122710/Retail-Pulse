import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { 
  ShoppingBag, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Layers,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import type { SourceSelection } from '../types';

export const DataSourcesPage: React.FC = () => {
  const { selectedSource, selectSource, setActiveTab, sendTestEvent } = useDashboard();

  const handleSelectSource = (source: SourceSelection) => {
    selectSource(source);
  };

  const handleProceedToExtraction = () => {
    setActiveTab('extraction');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-urbanist tracking-tight">
            Select Data Source
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Choose an e-commerce platform or combine all streams to extract data from.
          </p>
        </div>

        <button
          onClick={() => sendTestEvent()}
          className="px-4 py-2 rounded-2xl bg-[#A068FF]/20 border border-[#A068FF]/40 text-[#A068FF] text-xs font-bold hover:bg-[#A068FF]/30 transition-all flex items-center gap-2"
        >
          Send Test Event
        </button>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOURCE 1: ShopPulse */}
        <div 
          onClick={() => handleSelectSource('ShopPulse')}
          className={`glass-card p-6 rounded-3xl relative overflow-hidden transition-all border cursor-pointer ${
            selectedSource === 'ShopPulse'
              ? 'border-[#A068FF] bg-gradient-to-b from-[#A068FF]/15 to-[#070319] shadow-xl shadow-[#A068FF]/25 scale-[1.01]'
              : 'border-[#A068FF]/30 hover:border-[#A068FF]/60 hover:bg-[#A068FF]/5'
          }`}
        >
          {selectedSource === 'ShopPulse' && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#A068FF] text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
            </div>
          )}

          <div className="w-12 h-12 rounded-2xl bg-[#A068FF]/20 border border-[#A068FF]/40 flex items-center justify-center text-[#A068FF] mb-5">
            <ShoppingBag className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-white font-urbanist">ShopPulse</h2>
          <p className="text-xs font-semibold text-[#A068FF] mb-4">General E-Commerce Platform</p>

          <div className="space-y-2 mb-6 text-xs">
            <p className="font-bold text-slate-200">Data Available:</p>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#A068FF]" /> Customers & Orders</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#A068FF]" /> Products & Reviews</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#A068FF]" /> Behavioral Dwell Events</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#A068FF]/20 mb-5 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectSource('ShopPulse');
            }}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg ${
              selectedSource === 'ShopPulse'
                ? 'bg-[#A068FF] text-white shadow-[#A068FF]/40'
                : 'bg-gradient-to-r from-[#A068FF]/30 to-[#7C3AED]/30 border border-[#A068FF] text-white hover:bg-[#A068FF]/40'
            }`}
          >
            {selectedSource === 'ShopPulse' ? 'Selected ShopPulse ✓' : 'Select ShopPulse'}
          </button>
        </div>

        {/* SOURCE 2: TechMart */}
        <div 
          onClick={() => handleSelectSource('TechMart')}
          className={`glass-card p-6 rounded-3xl relative overflow-hidden transition-all border cursor-pointer ${
            selectedSource === 'TechMart'
              ? 'border-[#00F0FF] bg-gradient-to-b from-[#00F0FF]/15 to-[#070319] shadow-xl shadow-[#00F0FF]/25 scale-[1.01]'
              : 'border-[#A068FF]/30 hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/5'
          }`}
        >
          {selectedSource === 'TechMart' && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#00F0FF] text-black text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
            </div>
          )}

          <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] mb-5">
            <Cpu className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-white font-urbanist">TechMart</h2>
          <p className="text-xs font-semibold text-[#00F0FF] mb-4">Electronics E-Commerce Platform</p>

          <div className="space-y-2 mb-6 text-xs">
            <p className="font-bold text-slate-200">Data Available:</p>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Users & SKU Specs</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Transactions & Inventory</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" /> Live Hardware Logs</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#A068FF]/20 mb-5 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectSource('TechMart');
            }}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg ${
              selectedSource === 'TechMart'
                ? 'bg-[#00F0FF] text-black shadow-[#00F0FF]/40'
                : 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border border-[#00F0FF] text-white hover:bg-[#00F0FF]/30'
            }`}
          >
            {selectedSource === 'TechMart' ? 'Selected TechMart ✓' : 'Select TechMart'}
          </button>
        </div>

        {/* SOURCE 3: ALL SOURCES (Unified) */}
        <div 
          onClick={() => handleSelectSource('ALL SOURCES')}
          className={`glass-card p-6 rounded-3xl relative overflow-hidden transition-all border cursor-pointer ${
            selectedSource === 'ALL SOURCES'
              ? 'border-emerald-400 bg-gradient-to-b from-emerald-500/15 to-[#070319] shadow-xl shadow-emerald-500/25 scale-[1.01]'
              : 'border-[#A068FF]/30 hover:border-emerald-400/60 hover:bg-emerald-500/5'
          }`}
        >
          {selectedSource === 'ALL SOURCES' && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-400 text-black text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
            </div>
          )}

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5">
            <Globe className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-white font-urbanist">ALL SOURCES</h2>
          <p className="text-xs font-semibold text-emerald-400 mb-4">Unified E-Commerce Pipeline</p>

          <div className="space-y-2 mb-6 text-xs">
            <p className="font-bold text-slate-200">Combined Data Streams:</p>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Normalized Canonical Events</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Aggregated Revenue Insights</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cross-Platform Behavioral Funnel</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#A068FF]/20 mb-5 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active (2 Connected)
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectSource('ALL SOURCES');
            }}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg ${
              selectedSource === 'ALL SOURCES'
                ? 'bg-emerald-400 text-black shadow-emerald-400/40'
                : 'bg-gradient-to-r from-emerald-500/30 to-teal-600/30 border border-emerald-400 text-white hover:bg-emerald-400/30'
            }`}
          >
            {selectedSource === 'ALL SOURCES' ? 'Selected All Sources ✓' : 'Select All Sources'}
          </button>
        </div>

      </div>

      {/* SELECTED SOURCE SUMMARY BANNER */}
      <div className="p-6 rounded-3xl glass-panel border border-[#A068FF]/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#A068FF]/20">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#A068FF]" />
            <div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">SELECTED SOURCE</p>
              <h3 className="text-2xl font-black text-white font-urbanist flex items-center gap-2">
                [ {selectedSource} ]
              </h3>
            </div>
          </div>

          <button
            onClick={handleProceedToExtraction}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#A068FF] to-[#7C3AED] text-white font-bold text-xs shadow-lg shadow-[#A068FF]/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Extract Data <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-[#A068FF]" /> Source Type
            </span>
            <p className="font-bold text-white font-urbanist text-sm">
              {selectedSource === 'ShopPulse' ? 'General E-Commerce' : selectedSource === 'TechMart' ? 'Electronics E-Commerce' : 'Unified Multi-Platform'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#A068FF]" /> Available Records
            </span>
            <p className="font-bold text-[#A068FF] font-urbanist text-sm">
              {selectedSource === 'ShopPulse' ? '12,450 Records' : selectedSource === 'TechMart' ? '18,920 Records' : '31,370 Records (Combined)'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
            <span className="text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Available Data Streams
            </span>
            <p className="font-bold text-white font-urbanist text-xs truncate">
              {selectedSource === 'ShopPulse'
                ? 'Customers, Products, Orders, Reviews'
                : selectedSource === 'TechMart'
                ? 'Users, Products, Transactions, Inventory, Reviews'
                : 'All Normalized Streams & Events'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
