import React from 'react';
import {
  ShoppingBag,
  Home,
  LayoutGrid,
  Tag,
  Sparkles,
  Flame,
  Gem,
  Layers,
  Package,
  Heart,
  Ticket,
  MapPin,
  Settings,
  HelpCircle,
  Sun,
  ShieldCheck,
  ChevronRight,
  Gift,
  Cpu,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { Customer } from '../../types';

interface LeftSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: Customer | null;
  wishlistCount: number;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenWishlist: () => void;
  onShopNow: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  wishlistCount,
  onOpenOrders,
  onOpenAuth,
  onOpenAdmin,
  onOpenWishlist,
  onShopNow,
}) => {
  const primaryNav = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Categories', label: 'Categories', icon: LayoutGrid },
    { id: 'Deals', label: 'Deals', icon: Tag, badge: 'Hot' },
    { id: 'New Arrivals', label: 'New Arrivals', icon: Sparkles },
    { id: 'Best Sellers', label: 'Best Sellers', icon: Flame },
    { id: 'Brands', label: 'Brands', icon: Gem },
    { id: 'Collections', label: 'Collections', icon: Layers },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto no-scrollbar select-none z-30">
      <div className="space-y-6">
        {/* Brand Logo matching NovaShop style */}
        <div
          onClick={() => onSelectTab('Home')}
          className="flex items-center gap-3 cursor-pointer group px-2 py-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                ShopPulse
              </span>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Retail BI Store</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-purple-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Secondary Navigation (Account & Settings) */}
        <div className="space-y-1">
          <button
            onClick={onOpenOrders}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 transition"
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-slate-400" />
              <span>My Orders</span>
            </div>
            {currentUser && (
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          <button
            onClick={onOpenWishlist}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 transition"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-slate-400" />
              <span>Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('Coupons')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 transition"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 text-slate-400" />
              <span>Coupons</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              PULSE10
            </span>
          </button>

          <button
            onClick={() => onSelectTab('Addresses')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 transition"
          >
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Addresses</span>
          </button>

          <button
            onClick={currentUser ? onOpenOrders : onOpenAuth}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50/70 transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Special Offer Promotional Card in Sidebar */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white p-4 shadow-lg shadow-purple-200">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              Special Offer
            </span>
            <div>
              <h4 className="text-base font-extrabold leading-tight">Summer Sale</h4>
              <p className="text-xs text-purple-100 font-medium">Up to 50% Off</p>
            </div>
            <button
              onClick={onShopNow}
              className="mt-1 px-4 py-2 bg-white text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-50 transition shadow-xs flex items-center gap-1 group"
            >
              <span>Shop Now</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Decorative 3D shopping bag illustration */}
          <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-90 pointer-events-none flex items-center justify-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transform rotate-12 flex items-center justify-center">
                <Gift className="w-8 h-8 text-yellow-300 drop-shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Need Help & Mode Toggle & Launch Other Sites */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Launch Other Sites</p>
        <div className="grid grid-cols-2 gap-1.5">
          <a
            href={(import.meta as any).env?.VITE_TECHMART_URL || (import.meta.env.PROD ? '/techmart/' : 'http://localhost:5174')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100/80 transition border border-sky-200/60"
            title="Launch TechMart on Port 5174"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Cpu className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">TechMart</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sky-400 shrink-0 ml-1" />
          </a>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition border border-indigo-200/60"
            title="Launch RetailPulse BI Dashboard on Port 5173"
          >
            <div className="flex items-center gap-1.5 truncate">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">BI Dashboard</span>
            </div>
            <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
          </a>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1 text-slate-500 pt-1">
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-[11px] font-bold text-slate-800">Need Help?</p>
            <p className="text-[10px] text-slate-400">24/7 Support Center</p>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 transition border border-purple-200/60"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Data Portal</span>
          </div>
          <ChevronRight className="w-3 h-3 text-purple-400" />
        </button>

        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light Mode</span>
          </div>
          <span className="text-[10px] text-slate-400">Default</span>
        </div>
      </div>
    </aside>
  );
};

