import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Activity, Send } from 'lucide-react';

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.max(1, Math.floor((now.getTime() - past.getTime()) / 1000));

  if (diffSec < 60) return `${diffSec} sec ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr ago`;
}

export const LiveActivityFeed: React.FC = () => {
  const { liveEvents, sendTestEvent, isConnectorConnected } = useDashboard();

  const getEventText = (evt: any) => {
    switch (evt.event_type) {
      case 'PRODUCT_VIEW':
        return `User viewed ${evt.product_name || evt.product_id || 'Product'}`;
      case 'ADD_TO_CART':
        return `${evt.product_name || evt.product_id || 'Product'} added to cart`;
      case 'REMOVE_FROM_CART':
        return `Item removed from cart`;
      case 'CART_VIEW':
        return `User opened shopping cart (₹${evt.cart_value || 0})`;
      case 'SEARCH':
        return `Search: "${evt.search_query || ''}" (${evt.results_count || 0} results)`;
      case 'CHECKOUT_STARTED':
        return `Checkout started (${evt.item_count || 1} items)`;
      case 'ORDER_CREATED':
        return `Order ${evt.order_id || 'NEW'} placed successfully (₹${evt.total_amount || 0})`;
      case 'WISHLIST_ADD':
        return `Item saved to wishlist`;
      case 'REVIEW_SUBMITTED':
        return `Review submitted (${evt.rating || 5}★)`;
      case 'LOGIN':
        return `User logged in`;
      case 'LOGOUT':
        return `User logged out`;
      default:
        return `${evt.event_type} recorded`;
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-[#A068FF]/30 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#A068FF]/20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#A068FF] animate-pulse" />
          <h3 className="text-lg font-bold text-white font-urbanist">LIVE ACTIVITY</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE
          </span>

          <button
            onClick={() => sendTestEvent()}
            className="px-3 py-1 rounded-xl bg-[#A068FF]/20 border border-[#A068FF]/40 text-[#A068FF] hover:bg-[#A068FF]/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Send test event from active source"
          >
            <Send className="w-3 h-3" /> Send Test Event
          </button>
        </div>
      </div>

      {/* Activity Items List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {liveEvents.length > 0 ? (
          liveEvents.map((evt) => (
            <div
              key={evt.event_id}
              className="p-3 rounded-2xl bg-[#070319] border border-[#A068FF]/20 flex items-center justify-between gap-3 text-xs hover:border-[#A068FF]/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    evt.source === 'ShopPulse' ? 'bg-[#A068FF]' : 'bg-[#00F0FF]'
                  }`}
                />
                <span className="text-slate-200 font-medium truncate">
                  {getEventText(evt)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    evt.source === 'ShopPulse'
                      ? 'bg-[#A068FF]/20 text-[#A068FF] border border-[#A068FF]/30'
                      : 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                  }`}
                >
                  {evt.source}
                </span>
                <span className="text-slate-400">{timeAgo(evt.timestamp)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs italic">
            {isConnectorConnected
              ? 'Waiting for incoming site activity... Perform actions on ShopPulse or TechMart to see live events.'
              : 'Connector offline. Start the connector server on port 5000 to stream live events.'}
          </div>
        )}
      </div>

    </div>
  );
};
