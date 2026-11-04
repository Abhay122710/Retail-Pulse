import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ActionMenuItem {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  onClick?: () => void;
  href?: string;
  download?: boolean | string;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
  active?: boolean;
}

export interface ActionMenuProps {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: ActionMenuItem[];
  variant?: 'primary' | 'secondary' | 'subtle' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  showChevron?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  label,
  icon: Icon,
  items,
  variant = 'subtle',
  size = 'sm',
  align = 'right',
  className = '',
  menuClassName = '',
  showChevron = true,
  disabled = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] rounded-full gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-full gap-2',
    md: 'px-4 py-2 text-sm rounded-full gap-2'
  }[size];

  const variantClasses = {
    primary: 'bg-neutral-950 text-white dark:bg-white dark:text-black font-bold shadow-sm hover:opacity-90 active:scale-95',
    secondary: 'bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#202024] font-semibold shadow-2xs',
    subtle: 'bg-neutral-100/80 dark:bg-[#18181b] border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-[#222226] font-semibold',
    ghost: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-[#1c1c1c] font-semibold'
  }[variant];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {children ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className={`inline-flex items-center justify-center transition-all cursor-pointer select-none ${sizeClasses} ${variantClasses} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
        >
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
          {label && <span>{label}</span>}
          {showChevron && (
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 opacity-60 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
      )}

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 mt-1.5 min-w-[200px] p-1.5 rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-[#141414]/95 border border-neutral-200/80 dark:border-neutral-800 shadow-xl animate-fadeIn ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`div-${index}`}
                  className="my-1 border-t border-neutral-200/60 dark:border-neutral-800"
                />
              );
            }

            const ItemIcon = item.icon;
            const content = (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  {ItemIcon && (
                    <ItemIcon
                      className={`w-4 h-4 shrink-0 ${
                        item.destructive
                          ? 'text-rose-500'
                          : item.active
                          ? 'text-neutral-950 dark:text-white'
                          : 'text-neutral-400'
                      }`}
                    />
                  )}
                  <div className="truncate text-left">
                    <span className="block truncate font-medium">{item.label}</span>
                    {item.description && (
                      <span className="block text-[10px] text-neutral-400 dark:text-neutral-500 font-normal truncate">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {item.badge}
                  </span>
                )}
              </>
            );

            const itemClasses = `w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer select-none ${
              item.disabled
                ? 'opacity-40 cursor-not-allowed'
                : item.destructive
                ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : item.active
                ? 'bg-neutral-100 dark:bg-[#202020] text-neutral-950 dark:text-white font-bold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-[#1c1c1c] hover:text-neutral-950 dark:hover:text-white'
            }`;

            if (item.href) {
              return (
                <a
                  key={item.id || item.label}
                  href={item.href}
                  download={item.download}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={itemClasses}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id || item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={itemClasses}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
