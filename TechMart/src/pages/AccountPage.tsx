import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { activeUser, customers, setActiveUserCode, transactions, transactionItems } = useApp();
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);

  // Filter transactions for active user
  const userTransactions = transactions.filter((t) => t.user_code === activeUser.user_code);

  const toggleExpand = (txnId: string) => {
    setExpandedTxn(expandedTxn === txnId ? null : txnId);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyan-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-2xl shadow-lg">
            {activeUser.full_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{activeUser.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                {activeUser.user_code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">TechMart Registered Customer Profile</p>
          </div>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Switch Account:</span>
          <select
            value={activeUser.user_code}
            onChange={(e) => setActiveUserCode(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            {customers.map((c) => (
              <option key={c.user_code} value={c.user_code} className="bg-slate-900 text-slate-100">
                {c.full_name} ({c.user_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Schema Fields Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">TechMart Customer Schema Metadata</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px]">user_code</span>
            <p className="font-mono font-bold text-cyan-400">{activeUser.user_code}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px]">email_address</span>
            <p className="font-semibold text-slate-200 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUser.email_address}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px]">mobile_number</span>
            <p className="font-semibold text-slate-200 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUser.mobile_number}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px]">city / state / postal_code</span>
            <p className="font-semibold text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUser.city}, {activeUser.state} ({activeUser.postal_code})</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-slate-500 font-mono text-[10px]">account_created</span>
            <p className="font-mono text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUser.account_created}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Order & Transaction History</h2>
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
            {userTransactions.length} Orders
          </span>
        </div>

        {userTransactions.length > 0 ? (
          <div className="space-y-4">
            {userTransactions.map((txn) => {
              const isExpanded = expandedTxn === txn.transaction_id;
              const items = transactionItems.filter((i) => i.transaction_id === txn.transaction_id);

              return (
                <div
                  key={txn.transaction_id}
                  className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
                >
                  {/* Transaction Summary Header */}
                  <div
                    onClick={() => toggleExpand(txn.transaction_id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-cyan-400 text-sm">{txn.transaction_id}</span>
                        <StatusBadge status={txn.transaction_status} />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Timestamp: {new Date(txn.transaction_timestamp).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Payment Channel</span>
                        <span className="font-semibold text-slate-200">{txn.payment_channel}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Net Value</span>
                        <span className="font-black text-white text-sm font-mono">
                          ₹{txn.net_value.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Transaction Line Items & Data Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 space-y-4 text-xs">
                      
                      {/* Financial Fields Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500">gross_value</span>
                          <p className="text-slate-200 font-bold">₹{txn.gross_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">discount_value</span>
                          <p className="text-emerald-400 font-bold">-₹{txn.discount_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">tax_value</span>
                          <p className="text-slate-200 font-bold">+₹{txn.tax_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">shipping_value</span>
                          <p className="text-slate-200 font-bold">+₹{txn.shipping_value}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">net_value</span>
                          <p className="text-cyan-400 font-bold">₹{txn.net_value.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-300 text-xs">Purchased Line Items ({items.length})</h4>
                        <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-900/60 border border-slate-800">
                          {items.map((item) => (
                            <div key={item.line_id} className="p-3 flex items-center justify-between gap-4 font-mono">
                              <div>
                                <p className="font-bold text-slate-200 font-sans">{item.item_title}</p>
                                <p className="text-[10px] text-cyan-400">{item.sku} • {item.units} units @ ₹{item.unit_price.toLocaleString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-white">₹{item.line_total.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-card text-center border border-slate-800">
            <p className="text-xs text-slate-500 italic">No order history found for {activeUser.full_name}.</p>
          </div>
        )}
      </div>

    </div>
  );
};
