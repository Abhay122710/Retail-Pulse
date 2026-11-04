import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface CustomerScore {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  ordersCount: number;
  lastActive: string;
  lifetimeValue: string;
}

const TOP_CUSTOMERS: CustomerScore[] = [
  {
    id: 'c1',
    name: 'Anna Morgan',
    avatarText: 'AM',
    avatarBg: 'bg-rose-500',
    ordersCount: 25,
    lastActive: '2m ago',
    lifetimeValue: '₹9,596'
  },
  {
    id: 'c2',
    name: 'Jake Thompson',
    avatarText: 'JT',
    avatarBg: 'bg-amber-500',
    ordersCount: 23,
    lastActive: '14m ago',
    lifetimeValue: '₹8,770'
  },
  {
    id: 'c3',
    name: 'Sofia Bennett',
    avatarText: 'SB',
    avatarBg: 'bg-emerald-500',
    ordersCount: 20,
    lastActive: '1h ago',
    lifetimeValue: '₹7,786'
  },
  {
    id: 'c4',
    name: 'Emily Carter',
    avatarText: 'EC',
    avatarBg: 'bg-violet-500',
    ordersCount: 17,
    lastActive: '3h ago',
    lifetimeValue: '₹6,472'
  }
];

export const LiveCustomerScoreCard: React.FC = () => {
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
            Customer Leaderboard
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Top storefront accounts by value & loyalty
          </p>
        </div>

        <button
          onClick={() => setActiveTab('segmentation')}
          className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
        >
          All
        </button>
      </div>

      {/* Customer List */}
      <div className="space-y-3.5">
        {TOP_CUSTOMERS.map((cust) => (
          <div
            key={cust.id}
            onClick={() => setActiveTab('segmentation')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Avatar Pill */}
              <div className={`w-9 h-9 rounded-full ${cust.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                {cust.avatarText}
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                  {cust.name}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-white/40 flex items-center gap-2">
                  <span>{cust.ordersCount} orders</span>
                  <span>•</span>
                  <span>{cust.lastActive}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold text-neutral-950 dark:text-white font-heading">
                {cust.lifetimeValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Link */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>RFM & Pareto Segments</span>
        <button
          onClick={() => setActiveTab('segmentation')}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1"
        >
          Cohort Analysis <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default LiveCustomerScoreCard;
