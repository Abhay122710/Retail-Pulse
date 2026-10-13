import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardTab } from '../../types';
import { 
  Database, 
  Download, 
  Table, 
  LineChart, 
  Settings,
  LayoutDashboard
} from 'lucide-react';

interface SidebarItem {
  id: DashboardTab;
  label: string;
  icon: any;
}

const PRIMARY_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sources', label: 'Data Sources', icon: Database },
  { id: 'extraction', label: 'Data Extraction', icon: Download },
  { id: 'extracted-data', label: 'Extracted Data', icon: Table },
  { id: 'insights', label: 'Insights', icon: LineChart }
];

const SECONDARY_ITEMS: SidebarItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, selectedSource } = useDashboard();

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-24 glass-panel rounded-3xl border border-[#A068FF]/30 p-4 space-y-6">
        
        <div className="px-3 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Extraction & Analytics
          </p>
        </div>

        <nav className="space-y-1.5">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A068FF]/30 to-[#7C3AED]/20 text-white font-bold border border-[#A068FF]/50 shadow-lg shadow-[#A068FF]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#070319]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#A068FF]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#A068FF]/20 pt-4 space-y-1.5">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-medium transition-all flex items-center gap-3 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A068FF]/30 to-[#7C3AED]/20 text-white font-bold border border-[#A068FF]/50'
                    : 'text-slate-400 hover:text-white hover:bg-[#070319]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A068FF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Source Widget */}
        <div className="pt-4 border-t border-[#A068FF]/20 px-2 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Connection
          </div>
          <div className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{selectedSource}</p>
              <p className="text-[10px] text-slate-400">Mock Data API</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          </div>
        </div>

      </div>
    </aside>
  );
};
