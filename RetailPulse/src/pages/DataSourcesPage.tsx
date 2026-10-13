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
  Globe,
  Send
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
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
            Connected Storefront Sources
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Select an e-commerce platform or combine all streams to extract canonical data.
          </p>
        </div>

        <button
          onClick={() => sendTestEvent()}
          className="pill-btn-subtle px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simulate Telemetry</span>
        </button>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOURCE 1: ShopPulse */}
        <div 
          onClick={() => handleSelectSource('ShopPulse')}
          className={`p-6 rounded-[28px] relative overflow-hidden transition-all border cursor-pointer flex flex-col justify-between ${
            selectedSource === 'ShopPulse'
              ? 'bg-neutral-950 text-white dark:bg-[#18181b] dark:text-white dark:border-white/50 shadow-xl'
              : 'bg-neutral-50 dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
          }`}
        >
          {selectedSource === 'ShopPulse' && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </div>
          )}

          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
              selectedSource === 'ShopPulse'
                ? 'bg-white/10 dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-[#18181b] text-neutral-900 dark:text-white shadow-xs'
            }`}>
              <ShoppingBag className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold font-heading">ShopPulse</h2>
            <p className={`text-xs mb-4 ${selectedSource === 'ShopPulse' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
              General Apparel & Lifestyle Storefront
            </p>

            <div className="space-y-2 mb-6 text-xs">
              <p className="font-bold">Data Available:</p>
              <ul className={`space-y-1 ${selectedSource === 'ShopPulse' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <li className="flex items-center gap-2">● Customers & Orders</li>
                <li className="flex items-center gap-2">● Products & Reviews</li>
                <li className="flex items-center gap-2">● Behavioral Dwell Events</li>
              </ul>
            </div>
          </div>

          <div>
            <div className={`flex items-center justify-between pt-4 border-t mb-4 text-xs ${
              selectedSource === 'ShopPulse'
                ? 'border-white/20 dark:border-neutral-700'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
            }`}>
              <span>Status:</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                ● Connected
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSource('ShopPulse');
              }}
              className={`w-full py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                selectedSource === 'ShopPulse'
                  ? 'bg-white text-neutral-950 dark:bg-white dark:text-black'
                  : 'pill-btn-dark'
              }`}
            >
              {selectedSource === 'ShopPulse' ? 'Selected ✓' : 'Select Source'}
            </button>
          </div>
        </div>

        {/* SOURCE 2: TechMart */}
        <div 
          onClick={() => handleSelectSource('TechMart')}
          className={`p-6 rounded-[28px] relative overflow-hidden transition-all border cursor-pointer flex flex-col justify-between ${
            selectedSource === 'TechMart'
              ? 'bg-neutral-950 text-white dark:bg-[#18181b] dark:text-white dark:border-white/50 shadow-xl'
              : 'bg-neutral-50 dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
          }`}
        >
          {selectedSource === 'TechMart' && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </div>
          )}

          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
              selectedSource === 'TechMart'
                ? 'bg-white/10 dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-[#18181b] text-neutral-900 dark:text-white shadow-xs'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold font-heading">TechMart</h2>
            <p className={`text-xs mb-4 ${selectedSource === 'TechMart' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
              Consumer Tech & Hardware Storefront
            </p>

            <div className="space-y-2 mb-6 text-xs">
              <p className="font-bold">Data Available:</p>
              <ul className={`space-y-1 ${selectedSource === 'TechMart' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <li className="flex items-center gap-2">● Users & SKU Specs</li>
                <li className="flex items-center gap-2">● Transactions & Inventory</li>
                <li className="flex items-center gap-2">● Hardware Search Logs</li>
              </ul>
            </div>
          </div>

          <div>
            <div className={`flex items-center justify-between pt-4 border-t mb-4 text-xs ${
              selectedSource === 'TechMart'
                ? 'border-white/20 dark:border-neutral-700'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
            }`}>
              <span>Status:</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                ● Connected
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSource('TechMart');
              }}
              className={`w-full py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                selectedSource === 'TechMart'
                  ? 'bg-white text-neutral-950 dark:bg-white dark:text-black'
                  : 'pill-btn-dark'
              }`}
            >
              {selectedSource === 'TechMart' ? 'Selected ✓' : 'Select Source'}
            </button>
          </div>
        </div>

        {/* SOURCE 3: ALL SOURCES (Unified) */}
        <div 
          onClick={() => handleSelectSource('ALL SOURCES')}
          className={`p-6 rounded-[28px] relative overflow-hidden transition-all border cursor-pointer flex flex-col justify-between ${
            selectedSource === 'ALL SOURCES'
              ? 'bg-neutral-950 text-white dark:bg-[#18181b] dark:text-white dark:border-white/50 shadow-xl'
              : 'bg-neutral-50 dark:bg-[#121212] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
          }`}
        >
          {selectedSource === 'ALL SOURCES' && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </div>
          )}

          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
              selectedSource === 'ALL SOURCES'
                ? 'bg-white/10 dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-[#18181b] text-neutral-900 dark:text-white shadow-xs'
            }`}>
              <Globe className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold font-heading">ALL SOURCES</h2>
            <p className={`text-xs mb-4 ${selectedSource === 'ALL SOURCES' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
              Combined Multi-Store Pipeline
            </p>

            <div className="space-y-2 mb-6 text-xs">
              <p className="font-bold">Combined Streams:</p>
              <ul className={`space-y-1 ${selectedSource === 'ALL SOURCES' ? 'text-neutral-300 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <li className="flex items-center gap-2">● Normalized Canonical Events</li>
                <li className="flex items-center gap-2">● Aggregated Revenue Insights</li>
                <li className="flex items-center gap-2">● Cross-Store Behavioral Funnel</li>
              </ul>
            </div>
          </div>

          <div>
            <div className={`flex items-center justify-between pt-4 border-t mb-4 text-xs ${
              selectedSource === 'ALL SOURCES'
                ? 'border-white/20 dark:border-neutral-700'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
            }`}>
              <span>Status:</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                ● 2 Sources Active
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSource('ALL SOURCES');
              }}
              className={`w-full py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                selectedSource === 'ALL SOURCES'
                  ? 'bg-white text-neutral-950 dark:bg-white dark:text-black'
                  : 'pill-btn-dark'
              }`}
            >
              {selectedSource === 'ALL SOURCES' ? 'Selected ✓' : 'Select All'}
            </button>
          </div>
        </div>

      </div>

      {/* SELECTED SOURCE SUMMARY BANNER */}
      <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">ACTIVE CONFIGURATION</p>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white font-heading">
                {selectedSource}
              </h3>
            </div>
          </div>

          <button
            onClick={handleProceedToExtraction}
            className="pill-btn-dark px-6 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
          >
            <span>Proceed to Extraction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-700">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-neutral-900 dark:text-white" /> Architecture
            </span>
            <p className="font-bold text-neutral-950 dark:text-white font-heading text-sm">
              {selectedSource === 'ShopPulse' ? 'Lifestyle E-Commerce' : selectedSource === 'TechMart' ? 'Electronics Storefront' : 'Unified Warehouse'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-700">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1 font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-900 dark:text-white" /> Estimated Record Pool
            </span>
            <p className="font-bold text-neutral-950 dark:text-white font-heading text-sm">
              {selectedSource === 'ShopPulse' ? '12,450 Records' : selectedSource === 'TechMart' ? '18,920 Records' : '31,370 Records (Combined)'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-700">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Pipeline Status
            </span>
            <p className="font-bold text-neutral-950 dark:text-white font-heading text-sm">
              Ready for Live Extraction
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
