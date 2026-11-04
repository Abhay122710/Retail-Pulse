import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Sparkles, 
  Sun, 
  Moon,
  Download
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardTab } from '../../types';

export const FluentaDock: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme } = useDashboard();
  const isDark = theme === 'dark';

  const NAV_ITEMS: Array<{ id: DashboardTab; label: string; icon: any }> = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-stream', label: 'Activity Radar', icon: Activity },
    { id: 'extraction', label: 'Data Lake', icon: Download },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'pulse-ai', label: 'PulseAI', icon: Sparkles }
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-16 py-6 px-2 rounded-[32px] glass-card border border-neutral-200/80 dark:border-white/10 shrink-0 select-none">
      
      {/* Top Logo Chip */}
      <div 
        onClick={() => setActiveTab('overview')}
        className="w-10 h-10 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
        title="RetailPulse Dashboard"
      >
        <div className="w-4 h-4 rounded-md border-2 border-current flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-current rounded-xs" />
        </div>
      </div>

      {/* Center Nav Icons */}
      <nav className="flex flex-col items-center gap-3 my-6">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>

      {/* Bottom Theme Switcher Capsule matching Image 1 */}
      <div className="flex flex-col items-center gap-1 p-1 rounded-full bg-neutral-100 dark:bg-white/10 border border-neutral-200/60 dark:border-white/10">
        <button
          onClick={() => !isDark || toggleTheme()}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            !isDark ? 'bg-white text-amber-500 shadow-xs' : 'text-neutral-400 hover:text-white'
          }`}
          title="Light Mode"
        >
          <Sun size={13} />
        </button>
        <button
          onClick={() => isDark || toggleTheme()}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isDark ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
          title="Dark Mode"
        >
          <Moon size={13} />
        </button>
      </div>

    </aside>
  );
};

export default FluentaDock;
