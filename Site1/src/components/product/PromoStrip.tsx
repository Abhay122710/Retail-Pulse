import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { connectorTracker } from '../../services/connectorTracker';

interface PromoStripProps {
  onShopDeals: () => void;
  onShopNewArrivals: () => void;
}

export const PromoStrip: React.FC<PromoStripProps> = ({
  onShopDeals,
  onShopNewArrivals,
}) => {
  // Live countdown timer for the Flash Sale card
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 18 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Flash Sale (Pink Tint) */}
      <div
        onClick={() => {
          connectorTracker.sendEvent('CLICKBAIT_CLICK', {
            banner: 'Flash Sale - Up to 70% Off',
            clickbait_tag: 'Flash Sale Card',
            target: 'Deals'
          });
          onShopDeals();
        }}
        className="relative bg-[#FFF0F3] rounded-3xl p-5 border border-rose-100 flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
      >
        <div className="space-y-2 relative z-10">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Flash Sale</h4>
            <p className="text-[11px] text-slate-500 font-medium">Limited time deals</p>
          </div>
          <p className="text-xs font-extrabold text-rose-500 tracking-tight">
            Up to 70% Off
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-rose-200/60 shadow-xs">
            <Clock className="w-3 h-3 text-rose-500" />
            <span className="text-[11px] font-mono font-bold text-rose-600">
              {format2(timeLeft.hours)} : {format2(timeLeft.minutes)} : {format2(timeLeft.seconds)}
            </span>
          </div>
        </div>

        <div className="w-24 h-24 flex-shrink-0 relative">
          <img
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80"
            alt="Handbag Sale"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </div>
      </div>

      {/* Card 2: Free Shipping (Mint/Sage Tint) */}
      <div
        onClick={() => {
          connectorTracker.sendEvent('CLICKBAIT_CLICK', {
            banner: 'Free Shipping - Orders Over Rs. 999',
            clickbait_tag: 'Free Shipping Card',
            target: 'Shipping Policy'
          });
          onShopDeals();
        }}
        className="relative bg-[#F0FDF4] rounded-3xl p-5 border border-emerald-100 flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
      >
        <div className="space-y-2 relative z-10">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Free Shipping</h4>
            <p className="text-[11px] text-slate-500 font-medium">On orders over ₹999</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:underline">
            <span>Shop now</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div className="w-24 h-24 flex-shrink-0 relative">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80"
            alt="Shipping Box Parcel"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </div>
      </div>

      {/* Card 3: New Arrivals (Warm Beige/Peach Tint) */}
      <div
        onClick={() => {
          connectorTracker.sendEvent('CLICKBAIT_CLICK', {
            banner: 'New Arrivals - Latest Trends',
            clickbait_tag: 'New Arrivals Card',
            target: 'New Arrivals'
          });
          onShopNewArrivals();
        }}
        className="relative bg-[#FFFBEB] rounded-3xl p-5 border border-amber-100 flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
      >
        <div className="space-y-2 relative z-10">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">New Arrivals</h4>
            <p className="text-[11px] text-slate-500 font-medium">Check out the latest trends</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:underline">
            <span>Shop now</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div className="w-24 h-24 flex-shrink-0 relative">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=80"
            alt="Sunglasses Trend"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

