import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { FooterTicker } from './components/layout/FooterTicker';
import { LiveBackground } from './components/layout/LiveBackground';

import { OverviewPage } from './pages/OverviewPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { DataExtractionPage } from './pages/DataExtractionPage';
import { ExtractedDataPage } from './pages/ExtractedDataPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

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

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 font-sans ${
      isDark 
        ? 'dark bg-black text-white' 
        : 'bg-[#F3F5F8] text-neutral-900'
    }`}>
      
      {/* Dynamic Animated Live Background with interactive particles & floating caustics */}
      <LiveBackground />

      {/* Floating Outer Utilities (Top Right like Mindora login & export actions) */}
      <div className="relative z-30 max-w-[1600px] mx-auto px-4 sm:px-8 pt-4 pb-2 flex items-center justify-end gap-3">
        
        {/* Export / Quick Trigger Pill */}
        <button
          onClick={() => setActiveTab('extraction')}
          className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer ${
            isDark
              ? 'bg-[#121212] border-neutral-800 text-neutral-200 hover:bg-[#1a1a1a]'
              : 'bg-white/90 border-neutral-200/80 text-neutral-800 hover:bg-white'
          }`}
        >
          <DownloadCloud className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} />
          <span>Quick Sync</span>
        </button>

        {/* Theme Switcher Pill (Light / All-Black Dark) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle All-Black Theme"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer ${
            isDark
              ? 'bg-[#121212] border-neutral-800 text-neutral-200 hover:bg-[#1a1a1a]'
              : 'bg-white/90 border-neutral-200/80 text-neutral-800 hover:bg-white'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-bold">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden sm:inline font-bold">All-Black Mode</span>
            </>
          )}
        </button>

        {/* User Pill Button with Avatar (Mindora style '+ Login [Avatar]') */}
        <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${
          isDark
            ? 'bg-[#121212] border-neutral-800 text-neutral-200'
            : 'bg-white/90 border-neutral-200/80 text-neutral-700'
        }`}>
          <span className="text-xs font-bold">+ Admin</span>
          <div className={`w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shadow-xs ${
            isDark
              ? 'bg-white text-black'
              : 'bg-neutral-900 text-white'
          }`}>
            RP
          </div>
        </div>

      </div>

      {/* Main Floating Rounded Card Container */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-2">
        <div className={`rounded-[32px] sm:rounded-[44px] backdrop-blur-2xl transition-all duration-300 p-6 sm:p-10 ${
          isDark
            ? 'bg-[#0A0A0A] border border-neutral-800/90 shadow-[0_30px_90px_rgba(0,0,0,1)] text-white'
            : 'bg-white/95 border border-neutral-200/80 shadow-[0_20px_70px_-15px_rgba(15,23,42,0.06)] text-neutral-900'
        }`}>
          
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
          <div className={`mt-12 pt-6 border-t ${
            isDark ? 'border-neutral-850 border-neutral-800/80' : 'border-neutral-100'
          }`}>
            <FooterTicker />
          </div>

        </div>
      </div>

      {/* Floating Circular Quick-Action Arrow (Bottom-Right, matching Mindora reference) */}
      <button
        onClick={handleQuickAction}
        title="Simulate Real-Time Telemetry Event"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer ${
          isDark
            ? 'bg-[#121212] border-neutral-800 text-white'
            : 'bg-white border-neutral-200/80 text-neutral-900'
        }`}
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
