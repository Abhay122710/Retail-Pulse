import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DATA_SCOPES } from '../services/extractionService';
import { 
  Download, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  Activity, 
  Zap, 
  Cpu, 
  ShoppingBag, 
  Code, 
  Table as TableIcon,
  MousePointerClick,
  RefreshCw
} from 'lucide-react';

export const DataExtractionPage: React.FC = () => {
  const {
    selectedSource,
    selectSource,
    selectedDataTypes,
    toggleDataType,
    selectAllDataTypes,
    clearAllDataTypes,
    startExtraction,
    isExtracting,
    extractionStep,
    extractionProgress,
    extractionLogMessage,
    lastExtractionResult,
    extractedJsonData,
    extractedRecords,
    downloadCurrentExtractionJson,
    liveEvents,
    sendTestEvent
  } = useDashboard();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [tableSearch, setTableSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  // Calculate live counts of events per source
  const shopPulseCount = useMemo(() => {
    return liveEvents.filter(e => e.source === 'ShopPulse').length;
  }, [liveEvents]);

  const techMartCount = useMemo(() => {
    return liveEvents.filter(e => e.source === 'TechMart').length;
  }, [liveEvents]);

  const totalLiveCount = liveEvents.length;

  const handleCopyJson = () => {
    if (!extractedJsonData) return;
    const jsonStr = JSON.stringify(extractedJsonData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter extracted records
  const filteredRecords = useMemo(() => {
    const list = extractedRecords && extractedRecords.length > 0 ? extractedRecords : liveEvents;
    return list.filter((item: any) => {
      // Event type filter
      if (eventTypeFilter !== 'ALL') {
        if (eventTypeFilter === 'CLICKBAIT' && item.event_type !== 'CLICKBAIT_CLICK' && item.event_type !== 'BANNER_CLICK') return false;
        if (eventTypeFilter === 'PRODUCT_VIEW' && item.event_type !== 'PRODUCT_VIEW') return false;
        if (eventTypeFilter === 'SEARCH' && item.event_type !== 'SEARCH') return false;
        if (eventTypeFilter === 'ORDERS' && item.event_type !== 'ORDER_CREATED') return false;
        if (eventTypeFilter === 'CART' && !['ADD_TO_CART', 'REMOVE_FROM_CART', 'CART_VIEW'].includes(item.event_type)) return false;
      }

      // Search query filter
      if (!tableSearch) return true;
      const q = tableSearch.toLowerCase();
      return (
        item.event_id?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q) ||
        item.event_type?.toLowerCase().includes(q) ||
        item.product_name?.toLowerCase().includes(q) ||
        item.search_query?.toLowerCase().includes(q) ||
        item.session_id?.toLowerCase().includes(q) ||
        item.order_id?.toLowerCase().includes(q)
      );
    });
  }, [extractedRecords, liveEvents, tableSearch, eventTypeFilter]);

  return (
    <div className="space-y-10 animate-fadeIn">
      
      {/* 1. Mindora Centered Hero Header */}
      <section className="text-center pt-2 pb-6 max-w-3xl mx-auto space-y-4">
        
        {/* Floating Centered Avatar Badge */}
        <div className="inline-flex items-center justify-center relative mb-1">
          <div className="w-14 h-14 rounded-full border-2 border-neutral-900 dark:border-white bg-white dark:bg-black flex items-center justify-center overflow-hidden shadow-sm">
            <span className="font-extrabold text-lg text-neutral-900 dark:text-white font-heading">
              RP
            </span>
          </div>
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-neutral-950 dark:text-white font-heading leading-tight">
            Pulse your commerce <br className="hidden sm:inline" />
            <span className="relative inline-block">
              with Retail Pulse
              <svg 
                className="absolute left-0 -bottom-2 w-full h-3 text-neutral-300 dark:text-neutral-700 pointer-events-none" 
                viewBox="0 0 250 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 9C50 2 100 11 150 4C200 -3 230 9 248 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-xl mx-auto leading-relaxed pt-2">
            Multi-source telemetry & canonical extraction pipeline. Record live clickbaits, dwell time & store events, then extract structured canonical JSON ready for immediate download.
          </p>
        </div>

      </section>

      {/* 2. Real-Time Live Storefront Radar (No Fake Data) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ShopPulse Live Card */}
        <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white font-heading">
                  ShopPulse Storefront
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  General E-Commerce &bull; Local Port 3000
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">Recorded Live Events</span>
              <p className="text-base font-extrabold text-neutral-950 dark:text-white font-heading">
                {shopPulseCount} <span className="text-xs font-normal text-neutral-500">events</span>
              </p>
            </div>

            <button
              onClick={() => sendTestEvent('ShopPulse')}
              className="pill-btn-subtle px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simulate live user click on ShopPulse"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
              <span>Simulate Click</span>
            </button>
          </div>
        </div>

        {/* TechMart Live Card */}
        <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white font-heading">
                  TechMart Storefront
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Electronics Store &bull; Local Port 5174
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">Recorded Live Events</span>
              <p className="text-base font-extrabold text-neutral-950 dark:text-white font-heading">
                {techMartCount} <span className="text-xs font-normal text-neutral-500">events</span>
              </p>
            </div>

            <button
              onClick={() => sendTestEvent('TechMart')}
              className="pill-btn-subtle px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simulate live user click on TechMart"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-500" />
              <span>Simulate Click</span>
            </button>
          </div>
        </div>

      </section>

      {/* 3. Canonical Extraction Control Panel */}
      <section className="p-6 sm:p-8 rounded-[32px] bg-neutral-50/80 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 space-y-6">
        
        {/* Source & Scopes Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-neutral-900 dark:text-white" />
              Extract Live Store Data
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select extraction source and entity scopes, then click Extract Data to generate downloadable JSON
            </p>
          </div>

          {/* Source Toggle Pills */}
          <div className="flex items-center rounded-full p-1 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => selectSource('ALL SOURCES')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedSource === 'ALL SOURCES'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              All Sources ({totalLiveCount})
            </button>
            <button
              onClick={() => selectSource('ShopPulse')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedSource === 'ShopPulse'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              ShopPulse ({shopPulseCount})
            </button>
            <button
              onClick={() => selectSource('TechMart')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedSource === 'TechMart'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              TechMart ({techMartCount})
            </button>
          </div>
        </div>

        {/* Entity Scopes Checkbox Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Data Entity Scopes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllDataTypes}
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                Select All
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
              <button
                onClick={clearAllDataTypes}
                className="text-xs font-semibold text-neutral-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DATA_SCOPES.map((scope) => {
              const isChecked = selectedDataTypes.includes(scope);
              return (
                <div
                  key={scope}
                  onClick={() => toggleDataType(scope)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-black border-neutral-950 dark:border-white shadow-sm'
                      : 'bg-white dark:bg-[#18181b] border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold font-heading truncate">{scope}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isChecked ? 'opacity-80' : 'text-neutral-400'}`}>
                    Active
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Extraction Trigger Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200/60 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Target: <strong className="text-neutral-900 dark:text-white">{selectedSource}</strong> &bull; {selectedDataTypes.length} scopes active &bull; Fresh data from port 5000
          </p>

          <button
            onClick={startExtraction}
            disabled={selectedDataTypes.length === 0 || isExtracting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedDataTypes.length === 0 || isExtracting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'pill-btn-dark hover:scale-105 active:scale-95'
            }`}
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Extracting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Extract Data & Generate JSON
              </>
            )}
          </button>
        </div>

      </section>

      {/* 4. Extraction Progress Modal */}
      {isExtracting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] max-w-md w-full p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-800 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-[#18181b] flex items-center justify-center relative">
              <span className="absolute inset-0 rounded-full border-2 border-neutral-900 dark:border-white border-t-transparent animate-spin" />
              <Activity className="w-7 h-7 text-neutral-900 dark:text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white font-heading">
                Extracting Store Data
              </h3>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">
                {extractionStep}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-neutral-500">
                <span>Ingestion Progress</span>
                <span className="font-bold text-neutral-900 dark:text-white">{extractionProgress}%</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono bg-neutral-50 dark:bg-[#18181b] p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
              {extractionLogMessage}
            </p>
          </div>
        </div>
      )}

      {/* 5. Extraction Results & Direct Download Hub */}
      {lastExtractionResult && (
        <section className="p-6 sm:p-8 rounded-[32px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
                  Extraction Complete: {lastExtractionResult.extractionId}
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    FRESH ACTIVE DATA
                  </span>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {lastExtractionResult.recordsExtracted} active records compiled into standardized JSON at {lastExtractionResult.timestamp}
                </p>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={downloadCurrentExtractionJson}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON File</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="pill-btn-subtle px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Copy raw JSON payload to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Source</p>
              <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                {lastExtractionResult.source}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Fresh Records</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">
                {lastExtractionResult.recordsExtracted}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">File Format</p>
              <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                application/json
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Execution Time</p>
              <p className="text-sm font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                {lastExtractionResult.extractionTime}
              </p>
            </div>
          </div>

        </section>
      )}

      {/* 6. Extracted Data Explorer & JSON Inspector */}
      <section className="space-y-4">
        
        {/* Explorer Header with View Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-950 dark:text-white font-heading">
              Active Store Records & Telemetry
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing fresh live data from ShopPulse and TechMart ({filteredRecords.length} records)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher Pills */}
            <div className="flex items-center rounded-full p-1 bg-neutral-100 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table View
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> Raw JSON Schema
              </button>
            </div>

            {/* Event Filter Pills */}
            {activeTab === 'table' && (
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold">
                {['ALL', 'CLICKBAIT', 'PRODUCT_VIEW', 'SEARCH', 'ORDERS', 'CART'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEventTypeFilter(f)}
                    className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      eventTypeFilter === f
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white font-bold'
                        : 'bg-white dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                    }`}
                  >
                    {f === 'ALL' ? 'All Types' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar for Table View */}
        {activeTab === 'table' && (
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records by ID, product, clickbait banner, search query, or session..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </div>
        )}

        {/* Tab Content A: Table View */}
        {activeTab === 'table' && (
          <div className="rounded-[24px] bg-white dark:bg-[#101010] border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#161616] border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Product / Banner / Query</th>
                    <th className="px-4 py-3">User / Session</th>
                    <th className="px-4 py-3">Value / Detail</th>
                    <th className="px-4 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((item: any, idx: number) => {
                      const isClickbait = item.event_type === 'CLICKBAIT_CLICK' || item.event_type === 'BANNER_CLICK';
                      const isOrder = item.event_type === 'ORDER_CREATED';
                      const isSearch = item.event_type === 'SEARCH';

                      return (
                        <tr key={item.event_id || idx} className="hover:bg-neutral-50/60 dark:hover:bg-[#161616] transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-neutral-600 dark:text-neutral-400">
                            {item.event_id || `REC-${idx + 1}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.source === 'ShopPulse'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                            }`}>
                              {item.source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isClickbait 
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300'
                                : isOrder 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                : isSearch 
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                            }`}>
                              {item.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white max-w-[240px] truncate">
                            {item.product_name || item.search_query || item.category || 'System Action'}
                          </td>
                          <td className="px-4 py-3 font-mono text-neutral-500 dark:text-neutral-400 text-[11px] truncate max-w-[160px]">
                            {item.canonical_user_id || item.user_id || item.session_id || 'Anonymous'}
                          </td>
                          <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 font-medium">
                            {item.total_amount ? `₹${item.total_amount.toLocaleString()}` : (item.view_duration_seconds ? `${item.view_duration_seconds}s dwell` : (item.results_count !== null && item.results_count !== undefined ? `${item.results_count} results` : '—'))}
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-400 font-mono text-[11px]">
                            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                        No records match the current filters. Click "Simulate Click" above to stream live events!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content B: Raw JSON Schema Inspector */}
        {activeTab === 'json' && (
          <div className="rounded-[24px] bg-[#0A0A0A] border border-neutral-800 p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-neutral-400 text-[11px]">
                Canonical JSON Dataset Preview (Schema v2.0.0)
              </span>
              <button
                onClick={handleCopyJson}
                className="px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            <pre className="max-h-96 overflow-y-auto text-emerald-400 text-[11px] leading-relaxed">
              {JSON.stringify(
                extractedJsonData || {
                  metadata: {
                    source: selectedSource,
                    total_events: liveEvents.length,
                    status: 'Live Stream Recording',
                    pipeline: 'Retail Pulse Canonical ETL'
                  },
                  events_sample: liveEvents.slice(0, 5)
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

      </section>

    </div>
  );
};
