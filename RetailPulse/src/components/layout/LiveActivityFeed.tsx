import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Activity, Send } from 'lucide-react';

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.max(1, Math.floor((now.getTime() - past.getTime()) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export const LiveActivityFeed: React.FC = () => {
  const { liveEvents, sendTestEvent, isConnectorConnected } = useDashboard();

  const getEventText = (evt: any) => {
    switch (evt.event_type) {
      case 'CLICKBAIT_CLICK':
      case 'BANNER_CLICK':
        return `Promo / Clickbait clicked: "${evt.product_name || 'Campaign Spotlight'}"`;
      case 'PRODUCT_VIEW':
        return `Product view: ${evt.product_name || evt.product_id || 'Item'}`;
      case 'ADD_TO_CART':
        return `Added to cart: ${evt.product_name || evt.product_id || 'Item'}`;
      case 'REMOVE_FROM_CART':
        return `Item removed from cart`;
      case 'CART_VIEW':
        return `Cart opened (₹${evt.cart_value || 0})`;
      case 'SEARCH':
        return `Search query: "${evt.search_query || ''}" (${evt.results_count || 0} matches)`;
      case 'CHECKOUT_STARTED':
        return `Checkout initiated (${evt.item_count || 1} units)`;
      case 'ORDER_CREATED':
        return `Order #${evt.order_id || 'NEW'} completed (₹${evt.total_amount || 0})`;
      case 'WISHLIST_ADD':
        return `Saved to wishlist`;
      case 'REVIEW_SUBMITTED':
        return `Review rating submitted (${evt.rating || 5}★)`;
      case 'LOGIN':
        return `User session started`;
      case 'LOGOUT':
        return `User session ended`;
      default:
        return `${evt.event_type} event recorded`;
    }
  };

  return (
    <div className="p-6 rounded-[28px] bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white font-heading">
              Live Activity Stream
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Real-time multi-store clickstream & transaction telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE RADAR
          </span>

          <button
            onClick={() => sendTestEvent()}
            className="px-3.5 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Inject test telemetry event"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Simulate Event</span>
          </button>
        </div>
      </div>

      {/* Activity Items List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {liveEvents.length > 0 ? (
          liveEvents.map((evt) => (
            <div
              key={evt.event_id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    evt.source === 'ShopPulse' ? 'bg-indigo-500' : 'bg-cyan-500'
                  }`}
                />
                <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate">
                  {getEventText(evt)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-[11px]">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    evt.source === 'ShopPulse'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                  }`}
                >
                  {evt.source}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">
                  {timeAgo(evt.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-xs italic bg-white dark:bg-[#18181b] rounded-2xl border border-neutral-200/40 dark:border-neutral-800">
            {isConnectorConnected
              ? 'Listening for storefront clickstream events... Browse ShopPulse or TechMart to see live events stream here.'
              : 'Connector offline. Ensure connector server is running on port 5000.'}
          </div>
        )}
      </div>

    </div>
  );
};
