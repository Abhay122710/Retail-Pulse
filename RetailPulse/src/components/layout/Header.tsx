import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardTab } from '../../types';
import { SegmentedControl } from '../common/SegmentedControl';
import { ActionMenu } from '../common/ActionMenu';
import { 
  Activity, 
  Search, 
  Menu, 
  X,
  Sliders,
  DollarSign,
  Award,
  Users,
  ShieldCheck,
  LayoutGrid,
  Bell,
  Settings,
  Sun,
  Moon,
  LogOut,
  ShoppingBag,
  Cpu,
  ExternalLink
} from 'lucide-react';

const PRIMARY_NAV_TABS: Array<{ id: DashboardTab; label: string; icon?: any }> = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'extraction', label: 'Data Lake' },
  { id: 'predictive', label: 'Forecasts' },
  { id: 'reports', label: 'Reports' },
  { id: 'pulse-ai', label: 'PulseAI' }
];

const SECONDARY_MODULES: Array<{ id: DashboardTab; label: string; description: string; icon: any }> = [
  { id: 'live-stream', label: 'Live Stream Telemetry', description: 'Real-time clickstream & session radar', icon: Activity },
  { id: 'simulator', label: 'What-If Simulator', description: 'Elasticity, demand surge & lead-time models', icon: Sliders },
  { id: 'profitability', label: 'Profitability & Margins', description: 'Net revenue, COGS & unit economics', icon: DollarSign },
  { id: 'benchmarking', label: 'Cross-Store Benchmarking', description: 'ShopPulse vs TechMart performance parity', icon: Award },
  { id: 'segmentation', label: 'Segmentation & Cohorts', description: 'Customer retention & ABC Pareto (80/20)', icon: Users },
  { id: 'pipeline', label: 'Pipeline Health', description: 'Ingestion throughput & schema compliance', icon: ShieldCheck }
];

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedSource, 
    selectSource,
    searchQuery, 
    setSearchQuery,
    isConnectorConnected,
    theme,
    toggleTheme,
    stylePreset,
    currentUser,
    logout
  } = useDashboard();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarMenuOpen]);

  const [showSearch, setShowSearch] = useState(false);
  const isDark = theme === 'dark';
  const isEmber = stylePreset === 'ember';
  const isFluenta = stylePreset === 'fluenta';

  const activeSecondaryModule = SECONDARY_MODULES.find(m => m.id === activeTab);

  return (
    <header className="w-full pb-4 border-b border-neutral-100 dark:border-white/10 mb-6 space-y-4 select-none">
      
      {/* TOP BAR: Logo Chip + Center Pill Navigation + Right Controls (Bell, Theme, Avatar) */}
      <div className="flex items-center justify-between gap-3">
        
        {/* LEFT: Logo Chip matching '% Ember' in reference */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/15 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            title="RetailPulse Executive Dashboard"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
              isEmber ? 'bg-gradient-to-tr from-orange-600 to-amber-500' : 'bg-gradient-to-tr from-violet-600 to-indigo-500'
            }`}>
              %
            </div>
            <span className="text-sm font-extrabold tracking-tight text-neutral-950 dark:text-white font-heading">
              Retail
              <span className="font-light text-neutral-400 dark:text-white/40 ml-1 text-xs">
                Pulse
              </span>
            </span>
            <span 
              className={`w-2 h-2 rounded-full ${isConnectorConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} 
              title={isConnectorConnected ? 'Pipeline Ingestion Live' : 'Offline'} 
            />
          </div>

          {/* Storefront Source Filter Pill */}
          <div className="hidden md:block">
            <SegmentedControl
              value={selectedSource}
              onChange={(source) => selectSource(source as any)}
              size="xs"
              options={[
                { value: 'ALL SOURCES', label: 'All Stores' },
                { value: 'ShopPulse', label: 'ShopPulse' },
                { value: 'TechMart', label: 'TechMart' }
              ]}
            />
          </div>

          {/* Quick Launch Storefront Buttons */}
          <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-neutral-200/80 dark:border-white/10">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Open ShopPulse Storefront (Port 3000)"
            >
              <ShoppingBag size={12} className="text-purple-600 dark:text-purple-400" />
              <span>ShopPulse</span>
              <ExternalLink size={10} className="opacity-70" />
            </a>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Open TechMart Storefront (Port 5174)"
            >
              <Cpu size={12} className="text-sky-600 dark:text-sky-400" />
              <span>TechMart</span>
              <ExternalLink size={10} className="opacity-70" />
            </a>
          </div>

          {/* Mobile Menu Indicator */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            <span className="text-[10px] uppercase font-bold">Menu</span>
          </button>
        </div>

        {/* CENTER: Rounded Navigation Capsule Pills matching reference */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-neutral-100/90 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10">
          {PRIMARY_NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-extrabold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Secondary Modules Overflow Dropdown */}
          <ActionMenu
            label={activeSecondaryModule ? activeSecondaryModule.label : 'More ▾'}
            icon={LayoutGrid}
            variant={activeSecondaryModule ? 'primary' : 'ghost'}
            size="xs"
            menuClassName="w-72"
            items={SECONDARY_MODULES.map((mod) => ({
              id: mod.id,
              label: mod.label,
              description: mod.description,
              icon: mod.icon,
              active: activeTab === mod.id,
              onClick: () => setActiveTab(mod.id)
            }))}
          />
        </nav>

        {/* RIGHT: Quick Search, Theme Capsule, Notification Bell, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Search */}
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
                  className="pl-8 pr-3 py-1.5 w-40 sm:w-52 rounded-full text-xs bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 focus:outline-none"
                />
                <Search size={14} className="text-neutral-400 absolute left-2.5" />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="w-8 h-8 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/15 transition-all cursor-pointer"
                title="Search records"
              >
                <Search size={14} />
              </button>
            )}
          </div>

          {/* Sun/Moon Theme Capsule Toggle (Hidden on Fluenta dashboard to eliminate duplicate theme button) */}
          {!isFluenta && (
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="hidden sm:flex items-center p-0.5 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 transition-all cursor-pointer"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                !isDark ? 'bg-white shadow-xs text-amber-500' : 'text-neutral-400'
              }`}>
                <Sun size={13} />
              </span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isDark ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-400'
              }`}>
                <Moon size={13} />
              </span>
            </button>
          )}

          {/* Notification Bell with red badge dot */}
          <button
            onClick={() => setActiveTab('live-stream')}
            title="Live Telemetry Stream"
            className="relative w-8 h-8 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/15 transition-all cursor-pointer"
          >
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
          </button>

          {/* Settings / Pipeline Cog */}
          <button
            onClick={() => setActiveTab('pipeline')}
            title="Pipeline Monitoring & Health"
            className="w-8 h-8 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/15 transition-all cursor-pointer"
          >
            <Settings size={14} />
          </button>

          {/* Circular User Avatar Photo matching reference with Logout Dropdown */}
          <div className="relative" ref={avatarMenuRef}>
            <button 
              id="rp-avatar-btn"
              type="button"
              onClick={() => setAvatarMenuOpen(prev => !prev)}
              className="w-8 h-8 rounded-full ring-2 ring-neutral-200 dark:ring-white/20 overflow-hidden cursor-pointer bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white text-[11px] font-bold shadow-xs hover:scale-105 transition-transform"
              title="Admin User Account"
            >
              RP
            </button>

            {/* Small box showing admin and log out */}
            {avatarMenuOpen && (
              <div 
                id="admin-avatar-menu"
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-100 dark:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    RP
                  </div>
                  <div className="min-w-0 flex-1">
                    <p id="admin-user-label" className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {currentUser || 'admin'}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Administrator
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="admin-logout-btn"
                    type="button"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MOBILE EXPANDED MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 space-y-2 animate-fadeIn">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2">Navigation</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRIMARY_NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                    : 'bg-white/60 dark:bg-white/5 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 pt-2">Storefront Filter</p>
          <SegmentedControl
            value={selectedSource}
            onChange={(source) => selectSource(source as any)}
            size="xs"
            options={[
              { value: 'ALL SOURCES', label: 'All Stores' },
              { value: 'ShopPulse', label: 'ShopPulse' },
              { value: 'TechMart', label: 'TechMart' }
            ]}
          />

          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 pt-2">Launch Stores</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
            >
              <ShoppingBag size={12} />
              <span>ShopPulse</span>
              <ExternalLink size={10} />
            </a>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50"
            >
              <Cpu size={12} />
              <span>TechMart</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
