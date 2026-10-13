import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { Database, Sliders, KeyRound } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { selectedSource, selectSource } = useDashboard();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white font-urbanist tracking-tight">
          Platform Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Configure extraction parameters, API connections, and data sources.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Source Configuration */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#A068FF]/20">
            <Database className="w-5 h-5 text-[#A068FF]" />
            <h2 className="text-lg font-bold text-white font-urbanist">Data Source Connection</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Active E-Commerce Target</label>
              <select
                value={selectedSource}
                onChange={(e) => selectSource(e.target.value as any)}
                className="w-full bg-[#070319] border border-[#A068FF]/30 rounded-xl text-white p-3 focus:outline-none focus:border-[#A068FF]"
              >
                <option value="ShopPulse">ShopPulse (General E-Commerce)</option>
                <option value="TechMart">TechMart (Electronics E-Commerce)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Execution Mode</label>
              <div className="p-3 rounded-xl bg-[#070319] border border-[#A068FF]/20 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Simulated Mock Engine</p>
                  <p className="text-[10px] text-slate-400">Phase 1 Development Mode</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API & Extraction Limits */}
        <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#A068FF]/20">
            <Sliders className="w-5 h-5 text-[#A068FF]" />
            <h2 className="text-lg font-bold text-white font-urbanist">Extraction Parameters</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Max Records per Batch</label>
              <input
                type="number"
                defaultValue={5000}
                className="w-full bg-[#070319] border border-[#A068FF]/30 rounded-xl text-white p-3 focus:outline-none focus:border-[#A068FF]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">API Key / Auth Bearer</label>
              <div className="relative">
                <input
                  type="password"
                  defaultValue="rp_live_mock_token_992140"
                  readOnly
                  className="w-full bg-[#070319] border border-[#A068FF]/30 rounded-xl text-slate-400 p-3 pr-10 focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
