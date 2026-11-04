import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';

export const ThemePresetSwitcher: React.FC = () => {
  const { stylePreset, setStylePreset } = useDashboard();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-1.5 rounded-full flex items-center gap-1 shadow-2xl border border-neutral-200/80 dark:border-white/15 bg-white/90 dark:bg-black/90 backdrop-blur-2xl"
      >
        {/* Fluenta Pill */}
        <button
          id="theme-fluenta-btn"
          onClick={() => setStylePreset('fluenta')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            stylePreset === 'fluenta'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rotate-45 bg-[#8B5CF6] shrink-0" />
          <span>Fluenta</span>
        </button>

        {/* Ember Pill */}
        <button
          id="theme-ember-btn"
          onClick={() => setStylePreset('ember')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            stylePreset === 'ember'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span>Ember</span>
        </button>
      </motion.div>
    </div>
  );
};

export default ThemePresetSwitcher;
