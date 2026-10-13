import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Database
} from 'lucide-react';
import type { ShopPulseRecord, TechMartRecord } from '../types';

export const ExtractedDataPage: React.FC = () => {
  const { 
    selectedSource, 
    extractedRecords, 
    lastExtractionResult,
    searchQuery,
    setSearchQuery,
    selectedStatusFilter,
    setSelectedStatusFilter,
    setActiveTab
  } = useDashboard();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Filter records by search query and status dropdown
  const filteredRecords = useMemo(() => {
    return extractedRecords.filter((rec) => {
      const isShopPulse = selectedSource === 'ShopPulse';
      const spRec = rec as ShopPulseRecord;
      const tmRec = rec as TechMartRecord;

      const matchesSearch = isShopPulse
        ? spRec.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spRec.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spRec.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spRec.category.toLowerCase().includes(searchQuery.toLowerCase())
        : tmRec.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tmRec.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tmRec.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tmRec.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const statusVal = isShopPulse ? spRec.status : tmRec.status;
      const matchesStatus = selectedStatusFilter === 'All' || statusVal === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [extractedRecords, selectedSource, searchQuery, selectedStatusFilter]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-urbanist tracking-tight">
            Extracted Data
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Preview and search extracted raw records from {selectedSource}.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('sources')}
          className="px-4 py-2 rounded-2xl bg-[#070319] border border-[#A068FF]/30 text-xs font-semibold text-[#A068FF] hover:border-[#A068FF] transition-all flex items-center gap-2"
        >
          <Database className="w-4 h-4" /> Change Source
        </button>
      </div>

      {/* Summary Header Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[#A068FF]/20">
          <p className="text-xs text-slate-400">Source Platform</p>
          <p className="text-lg font-bold text-white font-urbanist">{selectedSource}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#A068FF]/20">
          <p className="text-xs text-slate-400">Extracted Timestamp</p>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            {lastExtractionResult ? lastExtractionResult.timestamp : 'Just Now'}
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#A068FF]/20">
          <p className="text-xs text-slate-400">Total Records</p>
          <p className="text-lg font-bold text-[#A068FF] font-urbanist">
            {lastExtractionResult ? lastExtractionResult.recordsExtracted.toLocaleString() : '4,820'}
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#A068FF]/20">
          <p className="text-xs text-slate-400">Primary Data Type</p>
          <p className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
            {selectedSource === 'ShopPulse' ? 'Orders (Stream)' : 'Transactions (Stream)'}
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-[#A068FF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={`Search ${selectedSource === 'ShopPulse' ? 'Order ID, Customer, Product...' : 'Transaction, User, SKU...'}`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#070319] border border-[#A068FF]/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#A068FF]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#A068FF]" /> Filter Status:
          </span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#070319] border border-[#A068FF]/30 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#A068FF]"
          >
            <option value="All">All Statuses</option>
            {selectedSource === 'ShopPulse' ? (
              <>
                <option value="Delivered">Delivered</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
              </>
            )}
          </select>
        </div>

      </div>

      {/* EXTRACTED DATA TABLE */}
      <div className="glass-card rounded-3xl border border-[#A068FF]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070319] border-b border-[#A068FF]/20 text-slate-400 uppercase font-mono tracking-wider">
              {selectedSource === 'ShopPulse' ? (
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product</th>
                  <th className="p-4 text-center">Units</th>
                  <th className="p-4 text-right">Gross (₹)</th>
                  <th className="p-4 text-right">Net (₹)</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[#A068FF]/10 text-slate-200">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => {
                  if (selectedSource === 'ShopPulse') {
                    const sp = rec as ShopPulseRecord;
                    return (
                      <tr key={sp.id} className="hover:bg-[#A068FF]/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#A068FF]">{sp.orderId}</td>
                        <td className="p-4 font-semibold text-white">{sp.customer}</td>
                        <td className="p-4">{sp.product}</td>
                        <td className="p-4 text-slate-400">{sp.category}</td>
                        <td className="p-4 text-center font-mono">{sp.quantity}</td>
                        <td className="p-4 text-right font-mono font-bold text-white">
                          ₹{sp.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">{sp.orderDate}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            sp.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : sp.status === 'Processing'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : sp.status === 'Shipped'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}>
                            {sp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  } else {
                    const tm = rec as TechMartRecord;
                    return (
                      <tr key={tm.id} className="hover:bg-[#00F0FF]/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#00F0FF]">{tm.transactionId}</td>
                        <td className="p-4 font-semibold text-white">{tm.user}</td>
                        <td className="p-4 font-mono text-slate-400 text-[11px]">{tm.sku}</td>
                        <td className="p-4">{tm.product}</td>
                        <td className="p-4 text-center font-mono">{tm.units}</td>
                        <td className="p-4 text-right font-mono text-slate-400">
                          ₹{tm.grossValue.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">
                          ₹{tm.netValue.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            tm.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : tm.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : tm.status === 'Refunded'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}>
                            {tm.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No matching records found for "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#070319] border-t border-[#A068FF]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#060218] border border-[#A068FF]/30 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#A068FF]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-[#060218] border border-[#A068FF]/30 font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#060218] border border-[#A068FF]/30 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#A068FF]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
