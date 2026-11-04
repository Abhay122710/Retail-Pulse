import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const IntelligenceNotesCard: React.FC = () => {
  const { setActiveTab } = useDashboard();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Executive Notes
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            PulseAI automated takeaways
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pulse-ai')}
          className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Floating Note Card matching Image 2 */}
      <div
        onClick={() => setActiveTab('reports')}
        className="p-4 rounded-2xl bg-neutral-50/90 dark:bg-white/5 border border-neutral-200/70 dark:border-white/10 cursor-pointer hover:border-neutral-400 transition-all group"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 dark:text-white/40 mb-1.5">
          <Clock size={12} />
          <span>2h ago</span>
        </div>

        <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          Demand Surge in Consumer Tech SKUs
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
          TechMart wireless earbuds volume surged 38% after weekend flash promo. Recommended safety stock: 120 units.
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
            TechMart vs ShopPulse Sync
          </span>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="mt-4 pt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>Grounded in canonical facts</span>
        <button
          onClick={() => setActiveTab('pulse-ai')}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1"
        >
          Ask PulseAI <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default IntelligenceNotesCard;
