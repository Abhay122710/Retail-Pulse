import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Database, 
  Download, 
  Table, 
  LineChart, 
  ArrowRight, 
  RefreshCw,
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import type { DashboardTab } from '../../types';

export const DataPipelineVisual: React.FC = () => {
  const { activeTab, setActiveTab, selectedSource, isConnectorConnected } = useDashboard();

  const steps: Array<{ id: DashboardTab; label: string; icon: any }> = [
    { id: 'sources', label: '1. Select Source', icon: Database },
    { id: 'extraction', label: '2. Data Extraction', icon: Download },
    { id: 'extracted-data', label: '3. Data Records', icon: Table },
    { id: 'insights', label: '4. Insights', icon: LineChart }
  ];

  return (
    <div className="w-full mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-[24px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 transition-all">
      
      {/* Visual Pipeline Flow */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          const isPassed = 
            (step.id === 'sources' && activeTab !== 'sources') ||
            (step.id === 'extraction' && (activeTab === 'extracted-data' || activeTab === 'insights')) ||
            (step.id === 'extracted-data' && activeTab === 'insights');

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveTab(step.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm scale-105'
                    : isPassed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'}`} />
                )}
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 hidden sm:block shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Connection Status & Source Indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Connector Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
          {isConnectorConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CONNECTOR ● Live</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Connector Standby</span>
            </span>
          )}
        </div>

        {/* Selected Source Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs shrink-0">
          <span className="text-neutral-400 font-medium">SOURCE:</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-[11px]">
            {selectedSource}
          </span>
          <button
            onClick={() => setActiveTab('sources')}
            className="ml-1 text-[11px] text-neutral-500 hover:text-neutral-950 dark:hover:text-white underline font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Return to Select Data Source"
          >
            <RefreshCw className="w-3 h-3" />
            Change
          </button>
        </div>

      </div>

    </div>
  );
};
