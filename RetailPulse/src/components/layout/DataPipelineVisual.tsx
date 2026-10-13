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
    { id: 'extracted-data', label: '3. Extracted Data', icon: Table },
    { id: 'insights', label: '4. Insights', icon: LineChart }
  ];

  return (
    <div className="w-full mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-[#A068FF]/30 shadow-lg shadow-[#A068FF]/10">
      
      {/* Visual Pipeline Flow */}
      <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A068FF]/30 to-[#7C3AED]/30 border border-[#A068FF] text-white shadow-md shadow-[#A068FF]/20 scale-105'
                    : isPassed
                    ? 'bg-[#070319] border border-[#10B981]/40 text-emerald-400 hover:border-[#10B981]'
                    : 'bg-[#070319]/80 border border-slate-800 text-slate-400 hover:text-white hover:border-[#A068FF]/40'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A068FF] animate-pulse' : 'text-slate-400'}`} />
                )}
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Connection Status & Source Indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Connector Status Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070319] border border-[#A068FF]/30 text-xs font-mono">
          {isConnectorConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>CONNECTOR ● Connected</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Connector Offline</span>
            </span>
          )}
        </div>

        {/* Selected Source Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#070319] border border-[#A068FF]/30 text-xs shrink-0">
          <span className="text-slate-400 font-medium">SOURCE:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#A068FF]/20 text-[#A068FF] border border-[#A068FF]/40 font-bold flex items-center gap-1.5">
            {selectedSource}
          </span>
          <button
            onClick={() => setActiveTab('sources')}
            className="ml-1 text-[11px] text-slate-300 hover:text-white underline font-semibold flex items-center gap-1 hover:text-[#A068FF] transition-colors"
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
