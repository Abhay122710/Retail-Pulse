import React from 'react';
import { ShoppingBag, ShieldCheck, Database, Truck, RefreshCw, Lock, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectCategory }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free & Fast Delivery</h4>
              <p className="text-xs text-slate-400">On all orders above ₹999</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Authentic</h4>
              <p className="text-xs text-slate-400">Verified products & warranty</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Easy Returns</h4>
              <p className="text-xs text-slate-400">7-day hassle-free replacement</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Checkout</h4>
              <p className="text-xs text-slate-400">UPI, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* Links & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">ShopPulse</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Everything you need, one cart away." ShopPulse is a modern demo e-commerce store engineered as the data generation pipeline for the Major Project <strong className="text-slate-200">Retail Pulse – Business Intelligence</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <Database className="w-3.5 h-3.5" />
                Admin Data Portal
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-indigo-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Contact Us</li>
              <li>Shipping & Delivery Policy</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Retail Pulse Pipeline</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All transactions, customer registrations, and reviews created on this platform are stored in database tables ready to be exported to CSV or queried via REST API endpoints for ETL processing.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ShopPulse. Developed for Major Project "Retail Pulse BI".</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>React, TypeScript & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
