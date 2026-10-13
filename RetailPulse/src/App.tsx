import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FooterTicker } from './components/layout/FooterTicker';

import { OverviewPage } from './pages/OverviewPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { DataExtractionPage } from './pages/DataExtractionPage';
import { ExtractedDataPage } from './pages/ExtractedDataPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainDashboardContent: React.FC = () => {
  const { activeTab } = useDashboard();

  return (
    <div className="min-h-screen bg-[#060218] text-white flex flex-col justify-between selection:bg-[#A068FF] selection:text-white font-sans">
      
      <div>
        {/* Top Header */}
        <Header />

        {/* Dashboard Main Layout */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex gap-8">
          
          {/* Sidebar */}
          <Sidebar />

          {/* Active View Container */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && <OverviewPage />}
            {activeTab === 'sources' && <DataSourcesPage />}
            {activeTab === 'extraction' && <DataExtractionPage />}
            {activeTab === 'extracted-data' && <ExtractedDataPage />}
            {activeTab === 'insights' && <InsightsPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </main>

        </div>
      </div>

      {/* Bottom Status Ticker Footer */}
      <FooterTicker />

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
