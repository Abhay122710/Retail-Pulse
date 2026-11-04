import { getStorefrontUrls } from '../../utils/storefrontUrls';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Cpu, Maximize2, ExternalLink } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const StorefrontCourseCards: React.FC = () => {
  const { shoppulseUrl, techmartUrl } = getStorefrontUrls();
  const { selectedSource, selectSource, setActiveTab } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (source: 'ShopPulse' | 'TechMart') => {
    selectSource(source);
    setActiveTab('extraction');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-7 rounded-[32px] flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-heading">
            Select a storefront
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Start data extraction & ETL today
          </p>
        </div>

        <button
          onClick={() => setActiveTab('extraction')}
          title="Open Data Extraction"
          className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer border border-neutral-200/60 dark:border-white/10"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Search Input Bar with pill icon button */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search storefront schemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-11 py-2.5 rounded-full text-xs bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
        <button className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Search size={13} />
        </button>
      </div>

      {/* Storefront Cards */}
      <div className="space-y-3">
        
        {/* 1. Purple / Lavender Card - ShopPulse */}
        <div
          onClick={() => handleSelect('ShopPulse')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedSource === 'ShopPulse'
              ? 'bg-[#E0D8FF] dark:bg-[#34275E] border-[#A78BFA] shadow-md'
              : 'bg-[#EDE7FE] dark:bg-[#231A43] border-transparent hover:border-[#C4B5FD]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-[#2E1065] dark:text-[#E9D5FF] font-heading">
                ShopPulse Storefront
              </h4>
              <p className="text-[11px] text-[#581C87] dark:text-[#DDD6FE] mt-0.5">
                Lifestyle & Apparel • Orders, Carts, Reviews
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/60 dark:bg-black/40 flex items-center justify-center text-[#4C1D95] dark:text-white">
              <ShoppingBag size={13} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/70 dark:bg-black/30 text-[#4C1D95] dark:text-[#E9D5FF]">
              Port 3000 • Live
            </span>
            <div className="flex items-center gap-2">
              <a
                href={shoppulseUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4C1D95] hover:bg-[#3B1578] dark:bg-purple-600 dark:hover:bg-purple-500 text-white transition-all shadow-xs cursor-pointer hover:scale-105"
                title="Launch ShopPulse Storefront in new tab"
              >
                <span>Launch</span>
                <ExternalLink size={9} />
              </a>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-rose-400 text-[9px] font-bold text-white flex items-center justify-center">AM</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">JT</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Light Blue / Cyan Card - TechMart */}
        <div
          onClick={() => handleSelect('TechMart')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedSource === 'TechMart'
              ? 'bg-[#BAE6FD] dark:bg-[#0C4A6E] border-[#38BDF8] shadow-md'
              : 'bg-[#E0F2FE] dark:bg-[#082F49] border-transparent hover:border-[#7DD3FC]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-[#0369A1] dark:text-[#BAE6FD] font-heading">
                TechMart Electronics
              </h4>
              <p className="text-[11px] text-[#075985] dark:text-[#7DD3FC] mt-0.5">
                Consumer Gadgets • Inventory, Units, SKUs
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/60 dark:bg-black/40 flex items-center justify-center text-[#0369A1] dark:text-white">
              <Cpu size={13} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/70 dark:bg-black/30 text-[#0369A1] dark:text-[#BAE6FD]">
              Port 5174 • Live
            </span>
            <div className="flex items-center gap-2">
              <a
                href={techmartUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0369A1] hover:bg-[#0284C7] dark:bg-sky-600 dark:hover:bg-sky-500 text-white transition-all shadow-xs cursor-pointer hover:scale-105"
                title="Launch TechMart Storefront in new tab"
              >
                <span>Launch</span>
                <ExternalLink size={9} />
              </a>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-cyan-500 text-[9px] font-bold text-white flex items-center justify-center">SB</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">EC</div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </motion.div>
  );
};

export default StorefrontCourseCards;
