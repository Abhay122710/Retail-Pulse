import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Cpu, Database } from 'lucide-react';

export const Footer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#0f172a] text-slate-400 mt-20 border-t border-slate-800">
      {/* Top Feature Highlights Bar */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-[#FF5530] border border-orange-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400">Insured priority shipping across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-[#FF5530] border border-orange-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Official Brand Warranty</h4>
              <p className="text-xs text-slate-400">100% genuine brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-[#FF5530] border border-orange-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free return & replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-[#FF5530] border border-orange-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Retail Pulse Source #2</h4>
              <p className="text-xs text-slate-400">Live multi-source ETL provider</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#FF5530] flex items-center justify-center text-white font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white">
              Tech<span className="text-[#FF5530]">Mart</span>
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
            TechMart is an independent electronics & technology retailer engineered as Data Source #2 for the <strong className="text-white font-semibold">Retail Pulse Multi-Source Pipeline</strong>.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>Data Architecture Note</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Uses distinct schema fields (<code className="text-orange-300">sku</code>, <code className="text-orange-300">unit_price</code>, <code className="text-orange-300">user_code</code>, <code className="text-orange-300">payment_channel</code>) to demonstrate heterogeneous multi-source ETL & normalization.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Departments</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Laptops & Creators</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Smartphones & 5G</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Premium Audio & ANC</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Gaming Gear & Consoles</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Smart Home Devices</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-[#FF5530] transition-colors">Wearable Health Trackers</button></li>
          </ul>
        </div>

        {/* Operations & Exports */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Operations & Data</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FF5530] transition-colors">Operations Dashboard</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FF5530] transition-colors">Generate Demo Transactions</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FF5530] transition-colors">Data Quality Simulator</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FF5530] transition-colors">Export CSV Datasets</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FF5530] transition-colors">Simulated REST Endpoints</button></li>
          </ul>
        </div>

        {/* Warehouse Network */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Hub Network</h4>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="text-orange-400">WH-NCR (Delhi NCR Hub)</li>
            <li className="text-orange-400">WH-NORTH (Chandigarh Hub)</li>
            <li className="text-orange-400">WH-WEST (Mumbai Hub)</li>
          </ul>
          <p className="text-[11px] text-slate-400 mt-4 leading-normal">
            Multi-warehouse inventory tracking enabled for Retail Pulse pipeline extraction.
          </p>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 TechMart Electronics Store. Built for Retail Pulse E-Commerce Business Intelligence Project.</p>
          <div className="flex gap-6 text-slate-400">
            <span>Tagline: "Power Your Digital World."</span>
            <span>Heterogeneous Source #2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
