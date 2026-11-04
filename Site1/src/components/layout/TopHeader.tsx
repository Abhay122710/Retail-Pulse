import React, { useState } from 'react';
import {
  Search,
  Heart,
  Bell,
  ChevronDown,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Customer } from '../../types';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: Customer | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onOpenWishlist: () => void;
  wishlistCount: number;
  cartCount: number;
  onToggleCart: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenOrders,
  onOpenAdmin,
  onOpenWishlist,
  wishlistCount,
  cartCount,
  onToggleCart,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 px-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-base text-slate-900 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> ShopPulse
          </span>
        </div>

        {/* Center / Left Search Bar (Matches screenshot pill search bar) */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/70 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-slate-800 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-medium px-2 py-0.5 rounded-full hover:bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons (Wishlist, Notifications, User Pill, Cart) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist Link */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition flex items-center gap-1.5"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Notifications Bell with red badge */}
          <button
            onClick={() => {}}
            className="relative p-2.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {/* User Profile Pill (Matches reference "Alina Putri v") */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {currentUser.city}, {currentUser.state}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 font-medium flex items-center gap-2 transition"
                  >
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    My Orders
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 font-medium flex items-center gap-2 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Admin Data Pipeline
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 transition border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Toggle Icon Button (Visible on mobile / tablets or when sidebar is hidden) */}
          <button
            onClick={onToggleCart}
            className="relative p-2.5 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition xl:hidden"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

