import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { LiveActivityFeed } from '../components/layout/LiveActivityFeed';
import { 
  ShoppingBag, 
  Cpu, 
  MousePointerClick, 
  Eye, 
  Search, 
  ShoppingCart, 
  Download
} from 'lucide-react';

export const LiveStreamPage: React.FC = () => {
  const { 
    liveEvents, 
    sendTestEvent, 
    setActiveTab
  } = useDashboard();

  const clickbaitCount = liveEvents.filter(e => e.event_type === 'CLICKBAIT_CLICK' || e.event_type === 'BANNER_CLICK').length;
  const productViewCount = liveEvents.filter(e => e.event_type === 'PRODUCT_VIEW').length;
  const searchCount = liveEvents.filter(e => e.event_type === 'SEARCH').length;
  const orderCount = liveEvents.filter(e => e.event_type === 'ORDER_CREATED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white font-heading">
            Live Telemetry & Click Stream
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time multi-store telemetry feed capturing user clicks, dwell times, and order actions from both active storefronts.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('extraction')}
          className="pill-btn-dark px-5 py-2.5 text-xs font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Extract Data & Download JSON</span>
        </button>
      </div>

      {/* Real-time KPI summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
            <MousePointerClick className="w-4 h-4" />
            <span>Clickbaits & Clicks</span>
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white font-heading">
            {clickbaitCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Banner interactions</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-indigo-500 font-bold mb-1">
            <Eye className="w-4 h-4" />
            <span>Product Views</span>
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white font-heading">
            {productViewCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Live dwell tracked</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-purple-500 font-bold mb-1">
            <Search className="w-4 h-4" />
            <span>Catalog Searches</span>
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white font-heading">
            {searchCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Real search queries</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Order Checkouts</span>
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white font-heading">
            {orderCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Completed orders</p>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-neutral-600 dark:text-neutral-300 font-medium text-center sm:text-left">
          Stream live events from running storefronts or simulate live user telemetry:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendTestEvent('ShopPulse')}
            className="pill-btn-subtle px-3.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Simulate ShopPulse Click</span>
          </button>
          <button
            onClick={() => sendTestEvent('TechMart')}
            className="pill-btn-subtle px-3.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            <span>Simulate TechMart Click</span>
          </button>
        </div>
      </div>

      {/* Live Stream Activity Radar Feed */}
      <LiveActivityFeed />

    </div>
  );
};
