import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Activity, Database, CheckCircle2 } from 'lucide-react';

export const FooterTicker: React.FC = () => {
  const { selectedSource, lastExtractionResult, isConnectorConnected } = useDashboard();

  return (
    <footer className="w-full text-xs text-neutral-500 dark:text-neutral-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold font-heading">
            <Activity className="w-3.5 h-3.5 text-neutral-900 dark:text-white animate-pulse" />
            <span>Retail Pulse Ingestion Bus</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target: {selectedSource}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Last Sync:</span>
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
              {lastExtractionResult ? lastExtractionResult.timestamp : 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-400">Connected:</span>
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">ShopPulse + TechMart</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isConnectorConnected ? 'Operational' : 'Simulated'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
