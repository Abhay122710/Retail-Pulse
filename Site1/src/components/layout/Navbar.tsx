import React, { useState } from 'react';
import { ShoppingBag, Search, User, ShieldCheck, Menu, X, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { ProductCategory, Customer } from '../../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  currentUser: Customer | null;
  onLogout: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Products', value: 'All' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Home & Kitchen', value: 'Home & Kitchen' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Accessories', value: 'Accessories' },
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
  onLogout,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onNavigateHome,
  onNavigateOrders,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>
          <strong className="font-semibold text-yellow-200">ShopPulse Data Pipeline Node:</strong> Live data source for Retail Pulse E-Commerce BI Project.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 bg-clip-text text-transparent">
                  ShopPulse
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Everything you need, one cart away.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, category, or brand..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
              title="Open Admin Dashboard & Data Export"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateOrders();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 border-t border-slate-100"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="hidden md:flex items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 text-xs font-medium">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onSelectCategory(cat.value);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  selectedCategory === cat.value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {currentUser && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onNavigateOrders();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-xs font-medium text-slate-700 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                My Orders
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
