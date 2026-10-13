import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { FooterTicker } from './components/layout/FooterTicker';

import { OverviewPage } from './pages/OverviewPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { DataExtractionPage } from './pages/DataExtractionPage';
import { ExtractedDataPage } from './pages/ExtractedDataPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

import glassRibbonBg from './assets/glass_ribbon_bg.jpg';
import { 
  Sun, 
  Moon, 
  ArrowUpRight, 
  DownloadCloud
} from 'lucide-react';

const MainDashboardContent: React.FC = () => {
  const { 
    activeTab, 
    theme, 
    toggleTheme, 
    sendTestEvent, 
    setActiveTab
  } = useDashboard();
  const [injectingEvent, setInjectingEvent] = useState(false);

  const handleQuickAction = async () => {
    setInjectingEvent(true);
    try {
      await sendTestEvent();
    } finally {
      setTimeout(() => setInjectingEvent(false), 800);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F3F5F8] dark:bg-[#060218] text-neutral-900 dark:text-white transition-colors duration-300">
      
      {/* 3D Glass Ribbon Organic Artwork in the Background (Matching Mindora reference) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* The Glass Ribbon Image positioned gracefully on the right & top */}
        <div 
          className="absolute -top-12 -right-16 w-[70vw] max-w-[1200px] h-[85vh] bg-contain bg-right-top bg-no-repeat opacity-40 dark:opacity-20 transition-opacity duration-500 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
          style={{ backgroundImage: `url(${glassRibbonBg})` }}
        />
        
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-100/40 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-sky-100/40 dark:bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Floating Outer Utilities (Top Right like Mindora login & export actions) */}
      <div className="relative z-30 max-w-[1600px] mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-end gap-3">
        
        {/* Export / Quick Trigger Pill */}
        <button
          onClick={() => setActiveTab('extraction')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm hover:shadow-md hover:bg-white transition-all backdrop-blur-md"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          <span>Quick Sync</span>
        </button>

        {/* Theme Switcher Pill (Light / Dark) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* User Pill Button with Avatar (Mindora style '+ Login [Avatar]') */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 shadow-sm backdrop-blur-md">
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">+ Admin</span>
          <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-[11px] flex items-center justify-center shadow-xs">
            RP
          </div>
        </div>

      </div>

      {/* Main Floating Rounded Card Container */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-2">
        <div className="rounded-[32px] sm:rounded-[44px] bg-white/95 dark:bg-[#070319]/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_20px_70px_-15px_rgba(15,23,42,0.06)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)] p-6 sm:p-10 transition-all">
          
          {/* Top Header inside the Card */}
          <Header />

          {/* Dynamic Content Views */}
          <main className="mt-4">
            {activeTab === 'overview' && <OverviewPage />}
            {activeTab === 'sources' && <DataSourcesPage />}
            {activeTab === 'extraction' && <DataExtractionPage />}
            {activeTab === 'extracted-data' && <ExtractedDataPage />}
            {activeTab === 'insights' && <InsightsPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </main>

          {/* Integrated Bottom Ticker */}
          <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800/80">
            <FooterTicker />
          </div>

        </div>
      </div>

      {/* Floating Circular Quick-Action Arrow (Bottom-Right, matching Mindora reference) */}
      <button
        onClick={handleQuickAction}
        title="Simulate Real-Time Telemetry Event"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700 shadow-lg hover:shadow-xl text-neutral-900 dark:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        <ArrowUpRight className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${injectingEvent ? 'animate-spin' : ''}`} />
      </button>

    </div>
  );
};

export function App() {
  return (
    <DashboardProvider>
      <MainDashboardContent />
    </DashboardProvider>
  );
}

export default App;
