import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Truck, ShoppingBag } from 'lucide-react';
import { ProductCategory } from '../../types';

interface HeroBannerProps {
  onShopNow: () => void;
  onSelectCategory: (category: ProductCategory) => void;
}

const CATEGORY_CARDS: { title: ProductCategory; icon: string; count: string; image: string; desc: string }[] = [
  {
    title: 'Electronics',
    icon: '⚡',
    count: '7 Items',
    desc: 'Audio, Wearables & Gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fashion',
    icon: '👕',
    count: '6 Items',
    desc: 'Topwear, Sneakers & Denim',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Home & Kitchen',
    icon: '☕',
    count: '6 Items',
    desc: 'Coffee Makers & Air Fryers',
    image: 'https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Sports',
    icon: '⚽',
    count: '6 Items',
    desc: 'Cricket, Yoga & Dumbbells',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Accessories',
    icon: '🎒',
    count: '5 Items',
    desc: 'Backpacks & Leather Wallets',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onSelectCategory }) => {
  return (
    <div className="space-y-12">
      {/* Main Hero Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-indigo-700/50">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Next-Gen E-Commerce Pipeline Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Shop smarter with <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent">ShopPulse</span>
            </h1>

            <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl font-normal leading-relaxed">
              "Everything you need, one cart away." Discover 30+ premium curated products with fast shipping, authentic quality guarantees, and seamless checkout.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 text-xs font-medium text-indigo-200 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Instant Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GST Invoice</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Visual Showcase */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-950/40 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80"
                  alt="E-Commerce Shopping"
                  className="w-full h-80 object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Festival Special</p>
                    <p className="text-sm font-semibold">Up to 30% Discount on Tech & Apparel</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-indigo-900 font-extrabold text-xs flex items-center justify-center shadow-lg">
                    -30%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore Product Categories</h2>
            <p className="text-xs text-slate-500">Browse through 30+ real products across 5 primary categories</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORY_CARDS.map((cat) => (
            <div
              key={cat.title}
              onClick={() => onSelectCategory(cat.title)}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer p-4 flex flex-col justify-between h-44 hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {cat.count}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
