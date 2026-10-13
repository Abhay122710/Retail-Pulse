import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardTab } from '../../types';
import { 
  Activity, 
  Search, 
  Menu, 
  X
} from 'lucide-react';

const NAV_TABS: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'sources', label: 'Data Sources' },
  { id: 'extraction', label: 'Extraction' },
  { id: 'extracted-data', label: 'Data Records' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' }
];

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedSource, 
    selectSource,
    searchQuery, 
    setSearchQuery,
    isConnectorConnected
  } = useDashboard();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="w-full pb-6 border-b border-neutral-100 dark:border-neutral-800 mb-6">
      <div className="flex items-center justify-between gap-4">
        
        {/* LEFT: Logo & Mindora-style menu button */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-white font-heading">
                Retail<span className="font-light text-neutral-500 dark:text-neutral-400">Pulse</span>
              </span>
            </div>
          </div>

          {/* Quick Menu Indicator */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#18181b] transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            <span className="tracking-wide text-[11px] uppercase">menu</span>
          </button>
        </div>

        {/* CENTER: Mindora-style Floating Tab Pills */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-neutral-100/80 dark:bg-[#141414] p-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-black shadow-sm font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1c1c1c]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Source Selector & Live Status Pill */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search toggle */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center animate-fadeIn">
                <input
                  type="text"
                  placeholder="Search telemetry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setShowSearch(false)}
                  className="pl-8 pr-3 py-1.5 w-44 sm:w-56 rounded-full text-xs bg-neutral-100 dark:bg-[#141414] text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#141414] transition-colors cursor-pointer"
                title="Search records"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Data Source Toggle Pill */}
          <div className="flex items-center rounded-full p-1 bg-neutral-100 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-semibold">
            <button
              onClick={() => selectSource('ShopPulse')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSource === 'ShopPulse'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              ShopPulse
            </button>
            <button
              onClick={() => selectSource('TechMart')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSource === 'TechMart'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              TechMart
            </button>
          </div>

          {/* Live Ingestion Indicator Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">
              {isConnectorConnected ? 'Ingestion Live' : 'Offline'}
            </span>
          </div>

        </div>

      </div>

      {/* Mobile / Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fadeIn">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-2xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-black dark:border-white font-bold'
                  : 'bg-neutral-50 dark:bg-[#141414] border-neutral-200/60 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c1c1c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
