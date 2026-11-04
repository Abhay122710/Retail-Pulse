import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  ChevronDown,
  AlertTriangle,
  User,
  Activity,
  Flame,
  Sparkles,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import type { DepartmentType } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
}

const DEPARTMENTS: Array<DepartmentType | 'All'> = [
  'All',
  'Laptops',
  'Smartphones',
  'Audio',
  'Gaming',
  'Computer Accessories',
  'Smart Home',
  'Wearables'
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenCart }) => {
  const { 
    cart, 
    wishlist, 
    activeUser, 
    customers, 
    setActiveUserCode, 
    searchQuery, 
    setSearchQuery, 
    selectedDepartment, 
    setSelectedDepartment,
    anomalies
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.units, 0);
  const hasActiveAnomalies = Object.values(anomalies).some(Boolean);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT TICKER (Matches reference image) */}
      <div className="bg-[#0f172a] text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="hidden sm:flex items-center gap-6 mx-auto text-[11px] tracking-wide">
            <span className="flex items-center gap-1.5">
              <span>🚚</span> Free Worldwide Shipping Over ₹2,500
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Summer Sale Up To 70% Off
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5">
              <span>⚡</span> Limited Time Flash Deals
            </span>
          </div>

          <div className="sm:hidden text-center w-full text-[11px] text-orange-400 font-semibold">
            ⚡ Summer Sale: Up To 70% Off Today
          </div>
        </div>
      </div>

      {/* Controlled Schema Anomalies Warning if triggered */}
      {hasActiveAnomalies && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Retail Pulse Data Quality Simulator Active: Controlled schema anomalies injected for pipeline verification</span>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* BRAND LOGO */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5530] to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                Tech<span className="text-[#FF5530]">Mart</span>
              </span>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                Curated Electronics
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION MENU (Matches reference image: Home, Shop, New Arrivals, Best Sellers, Categories) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-[#FF5530] transition-colors relative py-1 ${
                activeTab === 'home' ? 'text-[#FF5530] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF5530] after:rounded-full' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className={`hover:text-[#FF5530] transition-colors relative py-1 ${
                activeTab === 'catalog' && selectedDepartment === 'All' ? 'text-[#FF5530] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF5530] after:rounded-full' : ''
              }`}
            >
              Shop
            </button>

            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="hover:text-[#FF5530] transition-colors py-1 flex items-center gap-1"
            >
              <span>New Arrivals</span>
              <span className="px-1.5 py-0.2 bg-orange-100 text-[#FF5530] text-[9px] font-bold rounded-full">New</span>
            </button>

            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
              }}
              className="hover:text-[#FF5530] transition-colors py-1"
            >
              Best Sellers
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#FF5530] transition-colors py-1"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoriesDropdownOpen && (
                <div 
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl p-2 border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Departments
                  </div>
                  {DEPARTMENTS.filter(d => d !== 'All').map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartment(dept as DepartmentType);
                        setActiveTab('catalog');
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#FF5530] hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between"
                    >
                      <span>{dept}</span>
                      <span className="text-[10px] text-slate-400">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('admin')}
              className={`hover:text-[#FF5530] transition-colors py-1 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3 h-3 text-[#FF5530]" />
              <span>Operations Panel</span>
            </button>
          </nav>

          {/* RIGHT ACTION ICONS: Search, Wishlist, User, Cart */}
          <div className="flex items-center gap-3">
            
            {/* Search Box / Toggle */}
            <div className="relative hidden md:flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-48 lg:w-60 pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF5530] focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className="relative p-2.5 rounded-full text-slate-700 hover:text-rose-500 hover:bg-slate-50 transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors"
                title="Account"
                aria-label="Account"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-700" />
                </div>
              </button>

              {profileDropdownOpen && (
                <div 
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl p-3 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{activeUser.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Code: {activeUser.user_code}</p>
                  </div>

                  <div className="py-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Switch Customer</p>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {customers.map((c) => (
                        <button
                          key={c.user_code}
                          onClick={() => {
                            setActiveUserCode(c.user_code);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            c.user_code === activeUser.user_code
                              ? 'bg-orange-50 text-[#FF5530] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{c.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{c.user_code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-center py-2 text-xs text-white bg-slate-900 hover:bg-slate-800 font-semibold rounded-xl transition-colors shadow-xs"
                    >
                      View Orders & Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Launch Other Sites Quick Buttons */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <a
                href={(import.meta as any).env?.VITE_SHOPPULSE_URL || (import.meta.env.PROD ? '/shoppulse' : 'http://localhost:3000')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Launch ShopPulse on Port 3000"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                <span>ShopPulse</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Launch RetailPulse BI Dashboard on Port 5173"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>BI Dashboard</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* Shopping Cart Button with orange badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-slate-700 hover:text-[#FF5530] hover:bg-slate-50 transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5530] text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-slate-50"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {searchOpen && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:border-[#FF5530]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-3 font-semibold text-slate-800 text-sm">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1 hover:text-[#FF5530]"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setActiveTab('catalog');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1 hover:text-[#FF5530]"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                setActiveTab('wishlist');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1 hover:text-[#FF5530] flex items-center justify-between"
            >
              <span>Wishlist</span>
              <span className="text-xs bg-rose-50 text-rose-500 font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('account');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1 hover:text-[#FF5530]"
            >
              Account & Orders
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1 text-[#FF5530]"
            >
              Operations Panel
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Shop by Category</p>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.filter(d => d !== 'All').map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setSelectedDepartment(dept as DepartmentType);
                    setActiveTab('catalog');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-50 text-slate-700 border border-slate-200 hover:bg-orange-50 hover:text-[#FF5530]"
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
