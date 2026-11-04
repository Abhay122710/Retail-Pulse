import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, ShoppingBag, Cpu, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const IntegrationGaugeCard: React.FC = () => {
  const { isConnectorConnected, liveEvents, sendTestEvent, setActiveTab } = useDashboard();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Integrations & Pipeline
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real-time multi-store telemetry sync
          </p>
        </div>
        <button
          onClick={() => sendTestEvent()}
          title="Inject real-time telemetry event"
          className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 flex items-center justify-center text-neutral-700 dark:text-white transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Middle Gauge & Stat Section */}
      <div className="my-5 flex flex-col items-center">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Avg Ingestion Latency:
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-heading">
            24
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">ms</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Zap size={11} className="fill-current" /> Fast
          </span>
        </div>

        {/* Semi-circular Speedometer SVG Gauge */}
        <div className="relative w-56 h-28 flex items-end justify-center overflow-hidden pt-2">
          <svg className="w-52 h-52 -mb-24" viewBox="0 0 200 200">
            {/* Background Arc */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeLinecap="round"
              className="text-neutral-200 dark:text-neutral-800"
            />
            {/* Active Arc (Orange / Coral gradient) */}
            <path
              d="M 25 100 A 75 75 0 0 1 145 42"
              fill="none"
              stroke="url(#gauge-gradient)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
          </svg>

          {/* Needle / Center Indicator Arrow */}
          <div className="absolute bottom-1 flex flex-col items-center">
            <div 
              className="w-1.5 h-14 bg-neutral-900 dark:bg-white rounded-full origin-bottom transition-transform duration-700"
              style={{ transform: 'rotate(24deg)' }}
            />
            <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white border-2 border-white dark:border-neutral-900 -mt-2.5 shadow-md" />
          </div>
        </div>
      </div>

      {/* Bottom Connected Storefront / Integration Pills */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => setActiveTab('extraction')}
          className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all cursor-pointer group"
          title="ShopPulse Storefront (Port 3000)"
        >
          <ShoppingBag size={18} className="text-orange-600 dark:text-orange-400" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
            {liveEvents.filter(e => e.source === 'ShopPulse').length || 10}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('extraction')}
          className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all cursor-pointer group"
          title="TechMart Storefront (Port 5174)"
        >
          <Cpu size={18} className="text-cyan-600 dark:text-cyan-400" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
            {liveEvents.filter(e => e.source === 'TechMart').length || 8}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('predictive')}
          className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all cursor-pointer group"
          title="Python ML Statistical Engine (Port 8000)"
        >
          <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
            4
          </span>
        </button>

        {/* Pipeline Telemetry Pill */}
        <button
          onClick={() => setActiveTab('pipeline')}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all cursor-pointer text-left"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="truncate">
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">
              Pipeline Sync
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
              {isConnectorConnected ? 'Streaming Live' : 'Offline'}
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default IntegrationGaugeCard;
