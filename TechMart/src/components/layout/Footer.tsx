import React from 'react';
import { Zap, ShieldCheck, Truck, RefreshCw, Cpu, Database } from 'lucide-react';

export const Footer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 mt-20">
      {/* Feature Highlights Bar */}
      <div className="border-b border-slate-900/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Express Delivery</h4>
              <p className="text-xs text-slate-400">Insured priority shipping across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Official Tech Warranty</h4>
              <p className="text-xs text-slate-400">100% genuine brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">7-Day Replacement</h4>
              <p className="text-xs text-slate-400">Instant technical verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Retail Pulse Pipeline</h4>
              <p className="text-xs text-slate-400">Live multi-source data provider</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">
              Tech<span className="text-cyan-400">Mart</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            TechMart is an independent electronics & technology retailer engineered as Data Source #2 for the <strong className="text-cyan-300 font-semibold">Retail Pulse Multi-Source Pipeline</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>Data Architecture Note</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Uses distinct schema fields (<code className="text-cyan-300">sku</code>, <code className="text-cyan-300">unit_price</code>, <code className="text-cyan-300">user_code</code>, <code className="text-cyan-300">payment_channel</code>) to demonstrate heterogeneous multi-source ETL & normalization.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Departments</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Laptops & Creators</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Smartphones & 5G</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Premium Audio & ANC</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Gaming Gear & Consoles</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Smart Home Devices</button></li>
            <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400 transition-colors">Wearable Health Trackers</button></li>
          </ul>
        </div>

        {/* Operations & Exports */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Operations & Data</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-cyan-400 transition-colors">Operations Dashboard</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-cyan-400 transition-colors">Generate Demo Transactions</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-cyan-400 transition-colors">Data Quality Simulator</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-cyan-400 transition-colors">Export CSV Datasets</button></li>
            <li><button onClick={() => setActiveTab('admin')} className="hover:text-cyan-400 transition-colors">Simulated REST Endpoints</button></li>
          </ul>
        </div>

        {/* Warehouse Network */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Warehouses</h4>
          <ul className="space-y-2 text-xs font-mono">
            <li className="text-cyan-400">WH-NCR (Delhi NCR Hub)</li>
            <li className="text-cyan-400">WH-NORTH (Chandigarh Hub)</li>
            <li className="text-cyan-400">WH-WEST (Mumbai Hub)</li>
          </ul>
          <p className="text-[11px] text-slate-500 mt-4">
            Multi-warehouse inventory tracking enabled for Retail Pulse pipeline extraction.
          </p>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 TechMart Electronics Store. Built for Retail Pulse E-Commerce Business Intelligence Project.</p>
          <div className="flex gap-6">
            <span>Tagline: "Power Your Digital World."</span>
            <span>Heterogeneous Source #2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
