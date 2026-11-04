import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { TechMartProduct, DepartmentType } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { connectorTracker } from '../services/connectorTracker';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectProduct: (product: TechMartProduct) => void;
}

const CATEGORIES_DATA: Array<{ name: DepartmentType; label: string; count: string; image: string }> = [
  {
    name: 'Laptops',
    label: 'Laptops & PCs',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Smartphones',
    label: 'Smartphones',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Audio',
    label: 'Audio & ANC',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gaming',
    label: 'Gaming Gear',
    count: '6 Products',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Computer Accessories',
    label: 'Accessories',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Smart Home',
    label: 'Smart Home',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wearables',
    label: 'Wearables',
    count: '5 Products',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSelectProduct }) => {
  const { products, setSelectedDepartment, addToCart, wishlist, toggleWishlist } = useApp();

  // Carousel Pagination State for New Arrivals
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Live Flash Sale Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filtered Product Lists
  const newArrivals = products.filter((p) => p.is_trending).slice(0, 6);
  const bestSellers = products.filter((p) => p.is_featured).slice(0, 3);

  // Select 4 specific items for the floating hero cards
  const heroFloating1 = products.find((p) => p.sku === 'TM-LAP-101') || products[0];
  const heroFloating2 = products.find((p) => p.sku === 'TM-WEA-101') || products[1];
  const heroFloating3 = products.find((p) => p.sku === 'TM-AUD-101') || products[2];
  const heroFloating4 = products.find((p) => p.sku === 'TM-ACC-101') || products[3];

  return (
    <div className="space-y-14 pb-16">
      
      {/* 1. HERO BANNER SECTION (Matches NovaTrend reference image) */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF9F7] via-[#F4F4F6] to-[#EBECEE] border border-slate-200/80 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-xs">
        
        {/* Left Headline Content */}
        <div className="max-w-xl space-y-6 z-10 text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/70 text-[#FF5530] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5530]" />
            <span>Trending Now</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Discover Products <br />
            <span className="text-[#FF5530]">You'll Love</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg">
            Shop the latest trending electronics, gaming gear, and creator laptops curated for modern lifestyles.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                connectorTracker.sendEvent('CLICKBAIT_CLICK', {
                  banner: 'Discover Products Hero Banner',
                  clickbait_tag: 'Shop Now Main CTA',
                  target: 'catalog'
                });
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="px-8 py-4 rounded-full bg-[#FF5530] hover:bg-[#E04420] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-2xs hover:border-slate-300 transition-all"
            >
              Explore Collection
            </button>
          </div>

          {/* Customer Social Proof Avatars */}
          <div className="pt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              <div className="flex items-center text-amber-500 font-bold">
                {'★★★★★'}
              </div>
              <p className="text-[11px] text-slate-500">Loved by 50,000+ customers worldwide</p>
            </div>
          </div>

        </div>

        {/* Right Hero Lifestyle Visual with Floating Product Badges */}
        <div className="relative w-full lg:w-[480px] h-[420px] sm:h-[480px] flex items-center justify-center shrink-0">
          
          {/* Warm Coral Organic Background Shape */}
          <div className="absolute inset-4 rounded-[40px] bg-gradient-to-tr from-[#FF5530] via-rose-500 to-amber-500 opacity-90 shadow-2xl transform rotate-2" />
          
          {/* Main Hero Model/Product Image */}
          <div className="relative z-10 w-full h-full rounded-[36px] overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
              alt="Nova Lifestyle Model"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Floating Product Badge 1: Top Left */}
          {heroFloating1 && (
            <div 
              onClick={() => onSelectProduct(heroFloating1)}
              className="absolute -top-3 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform animate-float-1"
            >
              <img src={heroFloating1.image_url} alt="" className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1" />
              <div className="text-left pr-2">
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[110px]">{heroFloating1.item_title}</p>
                <p className="text-xs font-black text-[#FF5530]">₹{heroFloating1.unit_price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Floating Product Badge 2: Top Right */}
          {heroFloating2 && (
            <div 
              onClick={() => onSelectProduct(heroFloating2)}
              className="absolute top-8 -right-4 sm:-right-8 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform animate-float-2"
            >
              <img src={heroFloating2.image_url} alt="" className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1" />
              <div className="text-left pr-2">
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[110px]">{heroFloating2.item_title}</p>
                <p className="text-xs font-black text-[#FF5530]">₹{heroFloating2.unit_price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Floating Product Badge 3: Bottom Left */}
          {heroFloating3 && (
            <div 
              onClick={() => onSelectProduct(heroFloating3)}
              className="absolute bottom-12 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform animate-float-3"
            >
              <img src={heroFloating3.image_url} alt="" className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1" />
              <div className="text-left pr-2">
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[110px]">{heroFloating3.item_title}</p>
                <p className="text-xs font-black text-[#FF5530]">₹{heroFloating3.unit_price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Floating Product Badge 4: Bottom Right */}
          {heroFloating4 && (
            <div 
              onClick={() => onSelectProduct(heroFloating4)}
              className="absolute -bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform animate-float-4"
            >
              <img src={heroFloating4.image_url} alt="" className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1" />
              <div className="text-left pr-2">
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[110px]">{heroFloating4.item_title}</p>
                <p className="text-xs font-black text-[#FF5530]">₹{heroFloating4.unit_price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Carousel Pagination Indicator Dots */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 z-20">
            <div className="w-6 h-2 rounded-full bg-[#FF5530]" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>

        </div>

      </section>

      {/* 2. TRUST & FEATURE BADGES BAR (Matches reference 4-column strip) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5530] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Free Shipping</h4>
              <p className="text-xs text-slate-500">On orders over ₹2,500</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5530] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Secure Payments</h4>
              <p className="text-xs text-slate-500">100% secure checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5530] flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Easy Returns</h4>
              <p className="text-xs text-slate-500">30-day return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5530] flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">24/7 Support</h4>
              <p className="text-xs text-slate-500">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORIES SECTION (Matches reference image) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Shop by Categories</h2>
            <p className="text-xs text-slate-500">Browse curated technology departments</p>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment('All');
              setActiveTab('catalog');
            }}
            className="text-xs font-bold text-slate-700 hover:text-[#FF5530] flex items-center gap-1 group transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedDepartment(cat.name);
                setActiveTab('catalog');
              }}
              className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-full h-32 rounded-xl bg-slate-50 overflow-hidden mb-3 relative">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
              </div>
              <div className="text-left px-1">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#FF5530] transition-colors line-clamp-1">
                  {cat.label}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 group-hover:text-slate-600">
                  <span>Shop Now</span>
                  <span className="text-[#FF5530] font-bold">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS (Matches reference image with top tags & circular cart buttons) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">New Arrivals</h2>
            <p className="text-xs text-slate-500">Fresh flagship arrivals & limited discounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="text-xs font-bold text-slate-700 hover:text-[#FF5530] flex items-center gap-1 group transition-colors"
            >
              <span>View All New Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <button 
                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCarouselIndex(Math.min(2, carouselIndex + 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {newArrivals.map((p) => (
            <ProductCard key={p.sku} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS SECTION (Matches reference image with "Bestseller" tags and Quick Add) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Best Sellers</h2>
            <p className="text-xs text-slate-500">Top-rated items loved by thousands</p>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment('All');
              setActiveTab('catalog');
            }}
            className="text-xs font-bold text-slate-700 hover:text-[#FF5530] flex items-center gap-1 group transition-colors"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bestSellers.map((product) => {
            const isWishlisted = wishlist.includes(product.sku);
            return (
              <div 
                key={product.sku}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      Bestseller
                    </span>
                    <button
                      onClick={() => toggleWishlist(product.sku)}
                      className={`p-2 rounded-full border ${
                        isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="w-full h-52 rounded-2xl bg-[#f8f9fa] flex items-center justify-center p-4 cursor-pointer overflow-hidden mb-4"
                  >
                    <ImageWithFallback
                      src={product.image_url}
                      alt={product.item_title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 
                    onClick={() => onSelectProduct(product)}
                    className="text-base font-bold text-slate-900 group-hover:text-[#FF5530] transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.item_title}
                  </h3>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black text-slate-900">
                      ₹{product.unit_price.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs font-semibold">
                      {'★'.repeat(Math.floor(product.rating_score))}
                      <span className="text-slate-400 font-normal ml-1">({product.total_reviews})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    Premium certified build engineered for peak daily productivity and multimedia performance.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="flex-1 py-3 px-4 rounded-full bg-slate-950 hover:bg-[#FF5530] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Quick Add</span>
                  </button>

                  <button
                    onClick={() => onSelectProduct(product)}
                    className="p-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    title="View Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 6. DUAL PROMOTIONAL FLASH BANNERS (Matches reference image) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Banner 1: Vibrant Coral Flash Sale Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FF5530] via-rose-500 to-orange-500 text-white p-8 sm:p-10 flex flex-col justify-between shadow-lg min-h-[300px]">
          <div className="space-y-4 max-w-sm z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              Flash Sale
            </span>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight">
              Up To 70% Off
            </h3>

            {/* Countdown Timer (Matches 02 : 15 : 45 : 30 in reference image) */}
            <div className="flex items-center gap-2 pt-1 font-mono">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center">
                <span className="text-base sm:text-lg font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Days</p>
              </div>
              <span className="font-bold">:</span>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center">
                <span className="text-base sm:text-lg font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Hours</p>
              </div>
              <span className="font-bold">:</span>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center">
                <span className="text-base sm:text-lg font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Mins</p>
              </div>
              <span className="font-bold">:</span>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center">
                <span className="text-base sm:text-lg font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Secs</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedDepartment('All');
                  setActiveTab('catalog');
                }}
                className="px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md"
              >
                Shop Sale Now
              </button>
            </div>
          </div>

          {/* Product Cutout Image Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" 
              alt="Flash Sale Shoe/Tech"
              className="max-h-60 sm:max-h-72 object-contain transform -rotate-12 translate-x-4 drop-shadow-2xl" 
            />
          </div>
        </div>

        {/* Banner 2: Modern Dark Luxury Collection Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 text-white p-8 sm:p-10 flex flex-col justify-between shadow-lg min-h-[300px]">
          <div className="space-y-4 max-w-sm z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider border border-white/10">
              New Collection
            </span>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Summer 2025
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Discover the latest trends, activewear audio, and fresh connected tech styles.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedDepartment('Audio');
                  setActiveTab('catalog');
                }}
                className="px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md"
              >
                Shop Collection
              </button>
            </div>
          </div>

          {/* Dynamic Model Image Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80" 
              alt="Summer Collection"
              className="w-full h-full object-cover object-center opacity-85" 
            />
          </div>
        </div>

      </section>

      {/* 7. BOTTOM TRUST GUARANTEES BAR (Matches reference 4 items) */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🛡️</span>
            <h5 className="text-xs font-bold text-slate-900">Premium Quality</h5>
            <p className="text-[11px] text-slate-500">Made with certified specs</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🚚</span>
            <h5 className="text-xs font-bold text-slate-900">Fast Delivery</h5>
            <p className="text-[11px] text-slate-500">Quick and reliable shipping</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🔒</span>
            <h5 className="text-xs font-bold text-slate-900">Secure Checkout</h5>
            <p className="text-[11px] text-slate-500">Your data is protected</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">😊</span>
            <h5 className="text-xs font-bold text-slate-900">Customer Satisfaction</h5>
            <p className="text-[11px] text-slate-500">100% satisfaction guarantee</p>
          </div>
        </div>
      </section>

    </div>
  );
};
