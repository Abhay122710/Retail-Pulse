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
  ChevronUp,
  Package
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
    <div className="space-y-8 pb-16">
      
      {/* Header & Switcher */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 text-[#ff5530] flex items-center justify-center font-black text-2xl shadow-sm">
            {activeUser.full_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeUser.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                {activeUser.user_code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">TechMart Verified Customer Account</p>
          </div>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-500 font-semibold pl-2">Switch User:</span>
          <select
            value={activeUser.user_code}
            onChange={(e) => setActiveUserCode(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5530] cursor-pointer shadow-sm"
          >
            {customers.map((c) => (
              <option key={c.user_code} value={c.user_code} className="text-slate-900">
                {c.full_name} ({c.user_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Schema Fields Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff5530] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Account Profile & Delivery Metadata</h2>
            <p className="text-xs text-slate-400">Canonical Customer Entity Record</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase">User Identifier</span>
            <p className="font-mono font-bold text-slate-900 text-sm">{activeUser.user_code}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Email Address</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-[#ff5530] shrink-0" />
              <span className="truncate">{activeUser.email_address}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Contact Phone</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#ff5530] shrink-0" />
              <span>{activeUser.mobile_number}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Default Shipping Address</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#ff5530] shrink-0" />
              <span className="truncate">{activeUser.city}, {activeUser.state} ({activeUser.postal_code})</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Customer Member Since</span>
            <p className="font-medium text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeUser.account_created}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff5530] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Order & Transaction History</h2>
              <p className="text-xs text-slate-500">Live indexed purchases and fulfillment status</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            {userTransactions.length} Total Orders
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
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Transaction Summary Header */}
                  <div
                    onClick={() => toggleExpand(txn.transaction_id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900 text-sm">{txn.transaction_id}</span>
                        <StatusBadge status={txn.transaction_status} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(txn.transaction_timestamp).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payment</span>
                        <span className="font-bold text-slate-800">{txn.payment_channel}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Value</span>
                        <span className="font-black text-[#ff5530] text-sm">
                          ₹{txn.net_value.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Transaction Line Items & Data Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4 text-xs">
                      
                      {/* Financial Fields Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3.5 rounded-2xl bg-white border border-slate-200/80 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] uppercase">Gross Value</span>
                          <p className="text-slate-900 font-bold">₹{txn.gross_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] uppercase">Discount</span>
                          <p className="text-emerald-600 font-bold">-₹{txn.discount_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] uppercase">GST Tax (18%)</span>
                          <p className="text-slate-900 font-bold">+₹{txn.tax_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] uppercase">Shipping</span>
                          <p className="text-slate-900 font-bold">₹{txn.shipping_value}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] uppercase">Net Total</span>
                          <p className="text-[#ff5530] font-black">₹{txn.net_value.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          <span>Purchased Items ({items.length})</span>
                        </h4>
                        <div className="divide-y divide-slate-100 rounded-2xl bg-white border border-slate-100 overflow-hidden">
                          {items.map((item) => (
                            <div key={item.line_id} className="p-3.5 flex items-center justify-between gap-4">
                              <div>
                                <p className="font-bold text-slate-900">{item.item_title}</p>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {item.sku} • {item.units} unit{item.units > 1 ? 's' : ''} @ ₹{item.unit_price.toLocaleString('en-IN')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900">₹{item.line_total.toLocaleString('en-IN')}</p>
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
          <div className="p-12 rounded-3xl bg-white text-center border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Orders Placed Yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">When {activeUser.full_name} makes a purchase, the complete order details and invoice breakdown will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
};
