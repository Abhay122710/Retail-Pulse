import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { FooterTicker } from './components/layout/FooterTicker';
import { LiveBackground } from './components/layout/LiveBackground';
import { FluentaDock } from './components/layout/FluentaDock';
import { ThemePresetSwitcher } from './components/common/ThemePresetSwitcher';

import { OverviewPage } from './pages/OverviewPage';
import { DataExtractionPage } from './pages/DataExtractionPage';
import { LiveStreamPage } from './pages/LiveStreamPage';
import { PredictiveAnalyticsPage } from './pages/PredictiveAnalyticsPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { ProfitabilityPage } from './pages/ProfitabilityPage';
import { BenchmarkingPage } from './pages/BenchmarkingPage';
import { PipelineMonitoringPage } from './pages/PipelineMonitoringPage';
import { SegmentationPage } from './pages/SegmentationPage';
import { BusinessReportsPage } from './pages/BusinessReportsPage';
import { PulseAIPage } from './pages/PulseAIPage';
import { PulseAIChatDrawer } from './components/PulseAIChatDrawer';
import { LoginPage } from './pages/LoginPage';

import { ArrowUpRight } from 'lucide-react';

const MainDashboardContent: React.FC = () => {
  const { 
    activeTab, 
    theme, 
    stylePreset,
    sendTestEvent
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
  const isFluenta = stylePreset === 'fluenta';

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 font-sans ${
      isDark 
        ? 'dark bg-black text-white' 
        : 'bg-[#F0F3F8] text-neutral-900'
    }`}>
      
      {/* Dynamic Animated Live Background with interactive particles & floating caustics */}
      <LiveBackground />

      {/* Main Container */}
      <div className="relative z-20 max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Fluenta Dock + Main Card Flex Container */}
        <div className="flex items-start gap-5">
          
          {/* Fluenta Left Dock (Visible in Fluenta mode) */}
          {isFluenta && <FluentaDock />}

          {/* Main Floating Bento Card */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-[32px] sm:rounded-[40px] backdrop-blur-2xl transition-all duration-300 p-5 sm:p-8 lg:p-10 ${
              isDark
                ? 'bg-[#0A0A0A]/95 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,1)] text-white'
                : 'bg-white/95 border border-neutral-200/80 shadow-[0_20px_70px_-15px_rgba(15,23,42,0.06)] text-neutral-900'
            }`}>
              
              {/* Top Header inside the Card */}
              <Header />

              {/* Dynamic Content Views */}
              <main className="mt-4">
                {activeTab === 'overview' ? (
                  <OverviewPage />
                ) : activeTab === 'live-stream' ? (
                  <LiveStreamPage />
                ) : activeTab === 'predictive' ? (
                  <PredictiveAnalyticsPage />
                ) : activeTab === 'simulator' ? (
                  <WhatIfSimulatorPage />
                ) : activeTab === 'profitability' ? (
                  <ProfitabilityPage />
                ) : activeTab === 'benchmarking' ? (
                  <BenchmarkingPage />
                ) : activeTab === 'segmentation' ? (
                  <SegmentationPage />
                ) : activeTab === 'reports' ? (
                  <BusinessReportsPage />
                ) : activeTab === 'pipeline' ? (
                  <PipelineMonitoringPage />
                ) : activeTab === 'pulse-ai' ? (
                  <PulseAIPage />
                ) : (
                  <DataExtractionPage />
                )}
              </main>

              {/* Integrated Bottom Ticker */}
              <div className={`mt-10 pt-6 border-t ${
                isDark ? 'border-white/10' : 'border-neutral-100'
              }`}>
                <FooterTicker />
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Bottom Floating Theme Switcher matching both images [✦ Fluenta | 🟠 Ember] */}
      <ThemePresetSwitcher />

      {/* Floating Circular Quick-Action Arrow (Bottom-Right, placed above PulseAI trigger) */}
      <button
        onClick={handleQuickAction}
        title="Simulate Real-Time Telemetry Event"
        className={`fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full border shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer ${
          isDark
            ? 'bg-[#121212] border-white/10 text-white'
            : 'bg-white border-neutral-200/80 text-neutral-900'
        }`}
      >
        <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${injectingEvent ? 'animate-spin' : ''}`} />
      </button>

      {/* PulseAI Floating Chat Assistant Drawer */}
      <PulseAIChatDrawer />

    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useDashboard();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainDashboardContent />;
};

export function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

export default App;
