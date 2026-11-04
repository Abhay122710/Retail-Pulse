import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const DAYS = [
  { day: 'Tue', date: '20' },
  { day: 'Wed', date: '21' },
  { day: 'Thu', date: '22' },
  { day: 'Fri', date: '23' },
  { day: 'Sat', date: '24' },
  { day: 'Sun', date: '25' },
  { day: 'Mon', date: '26' },
  { day: 'Tue', date: '27' },
];

export const DealsScheduleCard: React.FC = () => {
  const { setActiveTab, sendTestEvent } = useDashboard();
  const [selectedDay, setSelectedDay] = useState('22');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Live Schedule & Telemetry
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Automated sync windows & batch ETL
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/10 border border-neutral-200/60 dark:border-white/10">
          <span>October 2026</span>
          <Plus size={14} className="cursor-pointer" />
        </div>
      </div>

      {/* Horizontal Day Selector Pills matching image 2 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.date;
          return (
            <button
              key={d.date}
              onClick={() => setSelectedDay(d.date)}
              className={`px-3 py-2 rounded-2xl flex flex-col items-center min-w-[50px] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-md scale-105'
                  : 'bg-neutral-100/80 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">{d.day}</span>
              <span className="text-sm font-extrabold font-heading mt-0.5">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Dark Glass Schedule Card matching Image 2 */}
      <div className="mt-4 p-4 rounded-2xl bg-neutral-950 text-white dark:bg-black/80 dark:border dark:border-white/20 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Live Pipeline Stream
            </span>
            <h4 className="text-sm font-bold mt-1.5 text-white font-heading">
              ShopPulse & TechMart Continuous Sync
            </h4>
          </div>
          <button
            onClick={() => sendTestEvent()}
            title="Inject test telemetry"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <Zap size={13} className="text-amber-400" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-300">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-neutral-400" />
            10:00 - 11:00 AM
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={12} />
            Active WebSocket
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('live-stream')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Live Telemetry Radar <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DealsScheduleCard;
