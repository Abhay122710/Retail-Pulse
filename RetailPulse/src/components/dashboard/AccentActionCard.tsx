import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap, DownloadCloud, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export interface AccentActionCardProps {
  themeStyle?: 'ember' | 'fluenta';
}

export const AccentActionCard: React.FC<AccentActionCardProps> = ({ themeStyle = 'ember' }) => {
  const { 
    sendTestEvent, 
    startExtraction, 
    lastExtractionResult, 
    liveEvents,
    setActiveTab 
  } = useDashboard();
  const [injecting, setInjecting] = useState(false);

  const handleSimulate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setInjecting(true);
    try {
      await sendTestEvent();
    } finally {
      setTimeout(() => setInjecting(false), 600);
    }
  };

  const isFluenta = themeStyle === 'fluenta';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => setActiveTab('extraction')}
      className={`p-6 sm:p-7 rounded-[32px] flex flex-col justify-between text-white shadow-xl cursor-pointer relative overflow-hidden group select-none ${
        isFluenta
          ? 'bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]'
          : 'bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C]'
      }`}
    >
      {/* Decorative background glow circles */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-black/10 blur-xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">
            {isFluenta ? 'Canonical Lake' : 'Manage Pipeline'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-heading mt-0.5">
            {isFluenta ? 'Telemetry Flow' : 'Manage Data'}
          </h3>
        </div>

        {/* Circular Arrow Button */}
        <div className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
          <ArrowUpRight size={18} className="text-white" />
        </div>
      </div>

      {/* Center Action Pill Buttons */}
      <div className="relative z-10 my-6 flex flex-wrap gap-2">
        <button
          onClick={handleSimulate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-900 font-bold text-xs shadow-md hover:bg-neutral-100 transition-all cursor-pointer"
        >
          <Zap size={14} className={`fill-current text-amber-500 ${injecting ? 'animate-spin' : ''}`} />
          <span>{injecting ? 'Injecting...' : 'Inject Event'}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            startExtraction();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
        >
          <DownloadCloud size={14} />
          <span>Extract Lake</span>
        </button>
      </div>

      {/* Bottom Large Metric Counter */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-heading tracking-tight">
            {lastExtractionResult?.recordsExtracted 
              ? lastExtractionResult.recordsExtracted.toLocaleString() 
              : (1240 + liveEvents.length).toLocaleString()}
          </span>
          <span className="text-sm font-medium text-white/80">
            records
          </span>
        </div>
        <p className="text-xs text-white/70 mt-1 flex items-center gap-1 font-medium">
          <Sparkles size={12} />
          <span>Synced across ShopPulse & TechMart</span>
        </p>
      </div>
    </motion.div>
  );
};

export default AccentActionCard;
