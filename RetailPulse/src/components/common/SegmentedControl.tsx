import React from 'react';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number | string;
  badge?: string;
  title?: string;
}

export interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
  disabled = false
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    xs: 'p-0.5 text-[10px]',
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-xs sm:text-sm'
  }[size];

  const itemSizeClasses = {
    xs: 'px-2 py-0.5 rounded-full gap-1',
    sm: 'px-3 py-1 rounded-full gap-1.5',
    md: 'px-4 py-1.5 rounded-full gap-2'
  }[size];

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center rounded-full bg-neutral-100/90 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 ${sizeClasses} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center font-semibold transition-all duration-200 cursor-pointer select-none ${itemSizeClasses} ${
              isSelected
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {option.count}
              </span>
            )}
            {option.badge && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
