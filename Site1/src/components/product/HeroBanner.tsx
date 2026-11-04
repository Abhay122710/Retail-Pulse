import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { connectorTracker } from '../../services/connectorTracker';

interface HeroBannerProps {
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#9061F9] via-[#8057F7] to-[#C084FC] text-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-purple-200/50">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-pink-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mb-16 -mr-16 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Copy & CTA */}
        <div className="md:col-span-7 space-y-4 sm:space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[11px] font-semibold text-white tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>New Collection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
            Find Your Style,<br />
            Love Your Look ✨
          </h1>

          <p className="text-sm sm:text-base text-purple-100 max-w-md font-normal leading-relaxed">
            Discover the latest trends in fashion, beauty, and lifestyle curated with premium quality and swift delivery.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                connectorTracker.sendEvent('CLICKBAIT_CLICK', {
                  banner: 'Hero CTA - Find Your Style, Love Your Look',
                  clickbait_tag: 'Shop Now Main Button',
                  target: '#catalog-section'
                });
                onShopNow();
              }}
              className="px-6 py-3 rounded-full bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/10 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Model & Showcase Graphic */}
        <div className="md:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 transform group hover:scale-[1.02] transition-transform duration-500">
            {/* High quality fashion model matching the reference image */}
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
              alt="Fashion Model Collection"
              className="w-full h-full object-cover object-top"
            />
            {/* Soft inner glow gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Slider dots at bottom center matching screenshot */}
      <div className="flex items-center justify-center gap-2 pt-6">
        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
        <span className="w-2 h-2 rounded-full bg-white/40" />
        <span className="w-2 h-2 rounded-full bg-white/40" />
        <span className="w-2 h-2 rounded-full bg-white/40" />
      </div>
    </div>
  );
};
