import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const RegionalDemographicsCard: React.FC = () => {
  const { setActiveTab } = useDashboard();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => setActiveTab('benchmarking')}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Subtle Map SVG Background */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <circle cx="80" cy="80" r="40" fill="currentColor" />
          <circle cx="200" cy="110" r="55" fill="currentColor" />
          <circle cx="310" cy="70" r="35" fill="currentColor" />
        </svg>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Storefront Hubs
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Regional telemetry volume
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 group-hover:bg-neutral-200 dark:group-hover:bg-white/20 flex items-center justify-center text-neutral-700 dark:text-white transition-all">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* Center Flag / Pin Graphic */}
      <div className="relative z-10 my-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 p-1 shadow-lg flex items-center justify-center text-white">
          <Globe size={28} />
        </div>
      </div>

      {/* Bottom Floating Pill Card matching image 2 */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-md border border-neutral-200/60 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black text-neutral-900 dark:text-white font-heading">
            48
          </span>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Active Storefront Hubs
          </span>
        </div>

        <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
          <ArrowUpRight size={13} />
        </div>
      </div>
    </motion.div>
  );
};

export default RegionalDemographicsCard;
