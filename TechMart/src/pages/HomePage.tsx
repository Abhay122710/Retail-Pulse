import React from 'react';
import { useApp } from '../context/AppContext';
import type { TechMartProduct, DepartmentType } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { 
  Laptop, 
  Smartphone, 
  Headphones, 
  Gamepad2, 
  HardDrive, 
  Home, 
  Watch,
  ArrowRight,
  Sparkles,
  Flame,
  Cpu
} from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { connectorTracker } from '../services/connectorTracker';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectProduct: (product: TechMartProduct) => void;
}

const CATEGORIES: Array<{ name: DepartmentType; icon: any; desc: string; count: string; image: string }> = [
  {
    name: 'Laptops',
    icon: Laptop,
    desc: 'Gaming rigs, ultrabooks & creator laptops',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Smartphones',
    icon: Smartphone,
    desc: 'Flagship 5G & foldable mobile devices',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Audio',
    icon: Headphones,
    desc: 'ANC headphones, TWS earbuds & soundbars',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    desc: 'Consoles, mechanical keyboards & 240Hz screens',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Computer Accessories',
    icon: HardDrive,
    desc: 'External SSDs, 4K webcams & USB-C docks',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Smart Home',
    icon: Home,
    desc: 'Voice AI hubs, 2K cameras & RGB lighting',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wearables',
    icon: Watch,
    desc: 'GPS smartwatches, health bands & bio rings',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSelectProduct }) => {
  const { products, setSelectedDepartment } = useApp();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);
  const trendingProducts = products.filter((p) => p.is_trending).slice(0, 4);
  const gamingProducts = products.filter((p) => p.department === 'Gaming').slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO BANNER */}
      <section className="relative w-full rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
        
        {/* Glow Ambient Orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-6 z-10 text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Electronics Store</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            Power Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 glow-text-cyan">Digital World</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Discover the latest technology, gaming gear and smart devices. Engineered with precision specs and nationwide insured delivery.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                connectorTracker.sendEvent('CLICKBAIT_CLICK', {
                  banner: 'Power Your Digital World Hero Banner',
                  clickbait_tag: 'Explore Technology Spotlight',
                  target: 'catalog'
                });
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="glow-button px-7 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <span>Explore Technology</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className="glow-button-secondary px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Retail Pulse Operations</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs font-mono text-slate-400">
            <div>
              <p className="text-white font-black text-base">38+</p>
              <p className="text-[11px]">Tech Products</p>
            </div>
            <div>
              <p className="text-cyan-400 font-black text-base">3 Hubs</p>
              <p className="text-[11px]">Warehouses</p>
            </div>
            <div>
              <p className="text-emerald-400 font-black text-base">24/7</p>
              <p className="text-[11px]">REST API Source</p>
            </div>
          </div>

        </div>

        {/* Hero Visual Mockup */}
        <div className="relative w-full lg:w-96 h-80 rounded-2xl overflow-hidden glass-card p-2 border border-cyan-500/30 shadow-2xl shrink-0 group">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80"
            alt="Hero Laptop"
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-4 left-4 right-4 glass-panel p-3 rounded-xl border border-cyan-400/30 text-xs">
            <div className="flex justify-between items-center text-white font-bold">
              <span>Predator Helios RTX 4070</span>
              <span className="text-cyan-400">₹1,39,999</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Intel i9-13900HX • 32GB DDR5 • 240Hz QHD+</p>
          </div>
        </div>

      </section>

      {/* PRODUCT CATEGORIES GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Product Categories</h2>
            <p className="text-xs text-slate-400">Browse by electronics & tech department</p>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment('All');
              setActiveTab('catalog');
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedDepartment(cat.name);
                  setActiveTab('catalog');
                }}
                className="glass-card rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group hover:border-cyan-400 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all mb-3 shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white">Featured Technology</h2>
              <p className="text-xs text-slate-400">Handpicked flagship tech devices</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment('All');
              setActiveTab('catalog');
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.sku} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* TRENDING TECH SPOTLIGHT */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-white">Trending Devices</h2>
              <p className="text-xs text-slate-400">Most ordered electronics this week</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((p) => (
            <ProductCard key={p.sku} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* GAMING GEAR BANNER & SPOTLIGHT */}
      <section className="rounded-3xl glass-panel border border-cyan-500/20 p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              Gaming Arena
            </span>
            <h2 className="text-3xl font-black text-white">High-Performance Gaming Gear</h2>
            <p className="text-xs text-slate-400">Consoles, 240Hz OLED monitors & mechanical switches</p>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment('Gaming');
              setActiveTab('catalog');
            }}
            className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 self-start md:self-auto"
          >
            Explore Gaming Section
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gamingProducts.map((p) => (
            <ProductCard key={p.sku} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

    </div>
  );
};
