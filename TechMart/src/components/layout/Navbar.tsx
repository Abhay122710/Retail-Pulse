import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Search, 
  ShoppingCart, 
  Heart, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronDown,
  AlertTriangle
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

  const totalCartCount = cart.reduce((sum, item) => sum + item.units, 0);
  const hasActiveAnomalies = Object.values(anomalies).some(Boolean);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl">
      {/* Top Banner Alert for Data Quality Simulator if active */}
      {hasActiveAnomalies && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Retail Pulse Data Quality Simulator Active: Controlled schema anomalies injected for pipeline testing</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LOGO */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Tech<span className="text-cyan-400 glow-text-cyan">Mart</span>
              </span>
              <p className="text-[10px] text-cyan-400/80 font-medium tracking-wider uppercase">
                Power Your Digital World
              </p>
            </div>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg items-center relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search laptops, smartphones, gaming gear..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-cyan-500/40 text-xs font-medium transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  {activeUser.full_name[0]}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-semibold leading-none">{activeUser.full_name}</p>
                  <p className="text-[10px] text-cyan-400 leading-none mt-1">{activeUser.user_code}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl p-2 z-50 border border-slate-700">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">Switch Customer Code</p>
                    <p className="text-[10px] text-slate-400">Multi-source profile selection</p>
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.user_code}
                        onClick={() => {
                          setActiveUserCode(c.user_code);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          c.user_code === activeUser.user_code
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{c.full_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.user_code}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setActiveTab('account');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-cyan-400 font-semibold hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                      View Account & Orders
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 flex items-center gap-2 font-medium text-xs transition-all shadow-md shadow-cyan-500/10"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Operations / Admin */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Operations Panel</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* NAVIGATION LINKS BAR */}
        <nav className="hidden lg:flex items-center gap-1 py-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDepartment(dept);
                setActiveTab('catalog');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedDepartment === dept && activeTab === 'catalog'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              {dept}
            </button>
          ))}
        </nav>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTab('catalog');
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800"
            >
              All Catalog
            </button>
            <button
              onClick={() => {
                setActiveTab('account');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800"
            >
              Account / Orders
            </button>
            <button
              onClick={() => {
                setActiveTab('wishlist');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800"
            >
              Wishlist ({wishlist.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-cyan-500/20 text-xs font-semibold text-cyan-300 border border-cyan-500/40"
            >
              Operations Panel
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.filter((d) => d !== 'All').map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setSelectedDepartment(dept as DepartmentType);
                    setActiveTab('catalog');
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-900 text-slate-300 border border-slate-800"
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
