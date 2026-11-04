import React from 'react';
import { Shirt, Sparkles, Headphones, Armchair, Trophy, LayoutGrid } from 'lucide-react';
import { ProductCategory } from '../../types';

interface CategoryRowProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryItem {
  id: string;
  label: string;
  categoryValue: ProductCategory | 'All';
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'fashion',
    label: 'Fashion',
    categoryValue: 'Fashion',
    icon: Shirt,
    bgClass: 'bg-rose-50 hover:bg-rose-100/80 border-rose-100',
    textClass: 'text-rose-600',
  },
  {
    id: 'beauty',
    label: 'Beauty',
    categoryValue: 'Accessories',
    icon: Sparkles,
    bgClass: 'bg-purple-50 hover:bg-purple-100/80 border-purple-100',
    textClass: 'text-purple-600',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    categoryValue: 'Electronics',
    icon: Headphones,
    bgClass: 'bg-blue-50 hover:bg-blue-100/80 border-blue-100',
    textClass: 'text-blue-600',
  },
  {
    id: 'home',
    label: 'Home & Living',
    categoryValue: 'Home & Kitchen',
    icon: Armchair,
    bgClass: 'bg-amber-50 hover:bg-amber-100/80 border-amber-100',
    textClass: 'text-amber-600',
  },
  {
    id: 'sports',
    label: 'Sports',
    categoryValue: 'Sports',
    icon: Trophy,
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100',
    textClass: 'text-emerald-600',
  },
  {
    id: 'more',
    label: 'More',
    categoryValue: 'All',
    icon: LayoutGrid,
    bgClass: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
    textClass: 'text-slate-600',
  },
];

export const CategoryRow: React.FC<CategoryRowProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="py-2">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected =
            selectedCategory === cat.categoryValue ||
            (cat.categoryValue === 'All' && selectedCategory === 'All');

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.categoryValue)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 group cursor-pointer ${
                isSelected
                  ? 'bg-purple-50/80 border-purple-300 shadow-xs ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-100/80 hover:border-slate-200 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 ${cat.bgClass}`}
              >
                <Icon className={`w-5 h-5 ${cat.textClass}`} />
              </div>
              <span
                className={`text-xs font-semibold tracking-tight transition ${
                  isSelected ? 'text-purple-700 font-bold' : 'text-slate-700 group-hover:text-purple-600'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

