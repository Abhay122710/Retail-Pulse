import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, ChevronDown } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

const WEEKLY_DATA = [
  { day: 'Sun', theory: 42000, practice: 28000, lexicon: 35000 },
  { day: 'Mon', theory: 58000, practice: 41000, lexicon: 48000 },
  { day: 'Tue', theory: 52000, practice: 38000, lexicon: 45000 },
  { day: 'Wed', theory: 76000, practice: 62000, lexicon: 69000 },
  { day: 'Thu', theory: 69000, practice: 54000, lexicon: 61000 },
  { day: 'Fri', theory: 94000, practice: 79000, lexicon: 86000 },
  { day: 'Sat', theory: 88000, practice: 71000, lexicon: 80000 },
];

export const PerformanceChartCard: React.FC = () => {
  const { setActiveTab } = useDashboard();
  const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly'>('Weekly');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Performance Chart
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track storefront telemetry and watch your metrics rise
          </p>
        </div>

        {/* Dropdown & Expand Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setTimeRange(timeRange === 'Weekly' ? 'Monthly' : 'Weekly')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
            >
              <span>{timeRange}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('predictive')}
            title="Expand to Full Predictive Analytics"
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Custom Legend (Dots matching image reference: Theory, Practice, Lexicon) */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>Net Revenue (Actual)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>Gross Orders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
          <span>Projected Demand (ML)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="theoryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="practiceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lexiconGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="day" 
              stroke="#94A3B8" 
              fontSize={11} 
              tickLine={false}
              axisLine={false} 
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value: any, name: any) => {
                const label = name === 'theory' 
                  ? 'Net Revenue' 
                  : name === 'practice' 
                    ? 'Gross Orders' 
                    : 'Projected Demand';
                return [`₹${Number(value).toLocaleString()}`, label];
              }}
            />

            <Area 
              type="monotone" 
              dataKey="theory" 
              stroke="#3B82F6" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#theoryGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="practice" 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#practiceGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="lexicon" 
              stroke="#F43F5E" 
              strokeWidth={1.8} 
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#lexiconGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceChartCard;
