import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  icon?: LucideIcon;
  gradient?: string;
  isPositive?: boolean;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  isPositive = true,
  subtitle,
  badge,
  onClick,
  className = ''
}) => {
  const isUp = typeof change === 'string' 
    ? !change.trim().startsWith('-') 
    : (change !== undefined ? Number(change) >= 0 : isPositive);

  const displayChange = typeof change === 'number' 
    ? Math.abs(change) 
    : (typeof change === 'string' ? change.replace(/^[+-]/, '') : null);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className={`glass-card p-6 rounded-[28px] relative overflow-hidden group select-none transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      } ${
        gradient ? gradient : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-white/60">
            {title}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-heading">
            {value}
          </h2>
          
          {displayChange !== null && (
            <p className={`flex items-center gap-1 text-xs sm:text-sm font-semibold mt-1 ${
              isUp 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isUp ? (
                <ArrowUpRight size={16} className="shrink-0" />
              ) : (
                <ArrowDownRight size={16} className="shrink-0" />
              )}
              <span>{isUp ? '+' : '-'}{displayChange}%</span>
              {subtitle && (
                <span className="text-[11px] font-normal text-neutral-400 dark:text-white/40 ml-1">
                  {subtitle}
                </span>
              )}
            </p>
          )}

          {!displayChange && subtitle && (
            <p className="text-xs text-neutral-400 dark:text-white/50 pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side Icon or Badge */}
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-white shrink-0 shadow-xs transition-transform group-hover:scale-105">
            <Icon size={22} />
          </div>
        )}

        {badge && (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white/80 border border-neutral-200/60 dark:border-white/10">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
