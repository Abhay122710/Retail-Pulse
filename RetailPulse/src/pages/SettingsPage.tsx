import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { Database, Sliders, KeyRound, Sun, Moon, Palette } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { selectedSource, selectSource, theme, setTheme } = useDashboard();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
          Platform Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
          Configure extraction parameters, appearance theme, and API connections.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance & Theme Selector */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white font-heading">Theme & Visual Experience</h2>
              <p className="text-xs text-neutral-500">Toggle between the new Mindora design and Cyber mode</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-neutral-500 font-semibold block">Active Interface Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-950'
                    : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  {theme === 'light' && <span className="text-[10px] font-bold text-neutral-900">ACTIVE</span>}
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white font-heading">Mindora Light</p>
                <p className="text-[11px] text-neutral-500">Luxury minimalist light cards</p>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-white text-white shadow-md ring-1 ring-white'
                    : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  {theme === 'dark' && <span className="text-[10px] font-bold text-white">ACTIVE</span>}
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white font-heading">Cyber Dark</p>
                <p className="text-[11px] text-neutral-500">Original deep neon night mode</p>
              </button>
            </div>
          </div>
        </div>

        {/* Source Configuration */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white font-heading">Data Source Connection</h2>
              <p className="text-xs text-neutral-500">Configured extraction targets</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-500 block mb-1 font-semibold">Active E-Commerce Target</label>
              <select
                value={selectedSource}
                onChange={(e) => selectSource(e.target.value as any)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
              >
                <option value="ShopPulse">ShopPulse (General E-Commerce)</option>
                <option value="TechMart">TechMart (Electronics E-Commerce)</option>
                <option value="ALL SOURCES">ALL SOURCES (Unified Warehouse)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-semibold">Execution Mode</label>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Live Event & Ingestion Engine</p>
                  <p className="text-[11px] text-neutral-500">Port 3001 Connector API</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API & Extraction Limits */}
        <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white font-heading">Extraction Parameters & Security</h2>
              <p className="text-xs text-neutral-500">Batch size limits and internal tokens</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-500 block mb-1 font-semibold">Max Records per Extraction Batch</label>
              <input
                type="number"
                defaultValue={5000}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-semibold">Connector Bearer Token</label>
              <div className="relative">
                <input
                  type="password"
                  defaultValue="rp_canonical_token_992140"
                  readOnly
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-400 p-3 pr-10 focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
