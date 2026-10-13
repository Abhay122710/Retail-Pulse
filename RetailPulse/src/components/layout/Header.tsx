import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Activity, 
  Search, 
  Settings,
  Database
} from 'lucide-react';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedSource, setActiveTab } = useDashboard();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#A068FF]/30 bg-[#060218]/90 backdrop-blur-xl">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* LEFT: Logo & Platform Badge */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#A068FF] to-[#7C3AED] p-0.5 shadow-lg shadow-[#A068FF]/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#060218] rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#A068FF] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-urbanist">
                Retail <span className="text-[#A068FF] purple-glow-text">Pulse</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#A068FF]/20 text-[#A068FF] border border-[#A068FF]/40 text-[10px] font-bold tracking-wider uppercase">
                Extraction & Insights
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Multi-Source E-Commerce Data Platform
            </p>
          </div>
        </div>

        {/* CENTER: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search extracted orders, transactions, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#070319]/90 border border-[#A068FF]/30 rounded-full text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#A068FF] focus:ring-1 focus:ring-[#A068FF] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        {/* RIGHT: Status Indicator & Active Source */}
        <div className="flex items-center gap-4">
          
          {/* Active Data Source Pill */}
          <button 
            onClick={() => setActiveTab('sources')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070319] border border-[#A068FF]/40 text-xs text-slate-200 hover:border-[#A068FF] transition-all"
          >
            <Database className="w-3.5 h-3.5 text-[#A068FF]" />
            <span>SOURCE:</span>
            <span className="font-bold text-[#A068FF]">{selectedSource}</span>
          </button>

          {/* Settings Icon Button */}
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-full bg-[#070319] border border-[#A068FF]/30 text-slate-300 hover:text-[#A068FF] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#A068FF]/20">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A068FF] to-blue-600 p-0.5">
              <div className="w-full h-full bg-[#060218] rounded-full flex items-center justify-center font-bold text-xs text-white">
                RP
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-none">Retail Pulse Admin</p>
              <p className="text-[10px] text-[#A068FF] leading-none mt-1">Data Architect</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
