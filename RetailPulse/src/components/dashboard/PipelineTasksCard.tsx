import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, RefreshCw, Cpu, Layers, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface PipelineTask {
  id: string;
  title: string;
  progress: number;
  icon: any;
  statusText: string;
}

const INITIAL_TASKS: PipelineTask[] = [
  {
    id: 't1',
    title: 'Normalize 10 ShopPulse live orders',
    progress: 55,
    icon: Layers,
    statusText: '5 / 10 normalized'
  },
  {
    id: 't2',
    title: 'Sync TechMart catalog & unit pricing',
    progress: 39,
    icon: Cpu,
    statusText: '39% deduplicated'
  },
  {
    id: 't3',
    title: 'Fit Holt-Winters demand forecast',
    progress: 27,
    icon: Sparkles,
    statusText: 'Python 3.11 engine'
  },
  {
    id: 't4',
    title: 'Extract canonical lake & export JSON',
    progress: 68,
    icon: RefreshCw,
    statusText: '68% complete'
  }
];

export const PipelineTasksCard: React.FC = () => {
  const { setActiveTab } = useDashboard();
  const [filter, setFilter] = useState<'Day' | 'Week'>('Day');

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
            Pipeline Tasks
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Check and complete canonical sync tasks
          </p>
        </div>

        <button
          onClick={() => setFilter(filter === 'Day' ? 'Week' : 'Day')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
        >
          <span>{filter}</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {INITIAL_TASKS.map((task) => {
          const Icon = task.icon;
          return (
            <div 
              key={task.id}
              onClick={() => setActiveTab('pipeline')}
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0 group-hover:scale-105 transition-transform">
                <Icon size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                  {task.title}
                </p>
                <div className="mt-1.5 w-full bg-neutral-200/70 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <span className="text-sm font-extrabold text-neutral-900 dark:text-white font-heading ml-2 shrink-0">
                {task.progress}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Link */}
      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>4 pipeline tasks running</span>
        <button
          onClick={() => setActiveTab('pipeline')}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer"
        >
          View Pipeline Details →
        </button>
      </div>
    </motion.div>
  );
};

export default PipelineTasksCard;
