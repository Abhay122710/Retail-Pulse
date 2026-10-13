import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Activity, Database, CheckCircle2 } from 'lucide-react';

export const FooterTicker: React.FC = () => {
  const { selectedSource, lastExtractionResult } = useDashboard();

  return (
    <footer className="w-full glass-panel border-t border-[#A068FF]/30 bg-[#060218]/95 py-3 px-4 sm:px-8 mt-12 text-xs font-mono text-slate-400">
      <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white font-bold font-urbanist">
            <Activity className="w-4 h-4 text-[#A068FF] animate-pulse" />
            <span>Retail Pulse Extraction Pipeline</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Active Stream: {selectedSource}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Last Extraction:</span>
            <span className="text-white font-bold">
              {lastExtractionResult ? lastExtractionResult.timestamp : 'Just Now'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#A068FF]" />
            <span className="text-slate-500">Sources:</span>
            <span className="text-white font-bold">ShopPulse & TechMart</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Status: Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
