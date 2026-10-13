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
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
            Extracted Warehouse Records
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Canonical normalized records ingested from {selectedSource}.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('sources')}
          className="pill-btn-subtle px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Switch Source</span>
        </button>
      </div>

      {/* Summary Header Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Source Platform</p>
          <p className="text-base font-bold text-neutral-950 dark:text-white font-heading mt-0.5">{selectedSource}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Extraction Time</p>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
            {lastExtractionResult ? lastExtractionResult.timestamp : 'Just Now'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Cached Record Pool</p>
          <p className="text-base font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
            {lastExtractionResult ? lastExtractionResult.recordsExtracted.toLocaleString() : '4,820'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Schema Type</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {selectedSource === 'ShopPulse' ? 'Order Stream' : 'Transaction Stream'}
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={`Search ${selectedSource === 'ShopPulse' ? 'Order ID, Customer, Product...' : 'Transaction, User, SKU...'}`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 rounded-full text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white px-3 py-1.5 rounded-full focus:outline-none cursor-pointer"
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
      <div className="rounded-[24px] bg-white dark:bg-[#0f0f10] border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#151517] border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase font-medium tracking-wider text-[11px]">
              {selectedSource === 'ShopPulse' ? (
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Amount</th>
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
                  <th className="p-4 text-right">Gross</th>
                  <th className="p-4 text-right">Net</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => {
                  if (selectedSource === 'ShopPulse') {
                    const sp = rec as ShopPulseRecord;
                    return (
                      <tr key={sp.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#18181b] transition-colors">
                        <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">{sp.orderId}</td>
                        <td className="p-4 font-medium">{sp.customer}</td>
                        <td className="p-4">{sp.product}</td>
                        <td className="p-4 text-neutral-500">{sp.category}</td>
                        <td className="p-4 text-center font-mono">{sp.quantity}</td>
                        <td className="p-4 text-right font-mono font-bold text-neutral-950 dark:text-white">
                          ₹{sp.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-neutral-500 font-mono text-[11px]">{sp.orderDate}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            sp.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : sp.status === 'Processing'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : sp.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}>
                            {sp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  } else {
                    const tm = rec as TechMartRecord;
                    return (
                      <tr key={tm.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#18181b] transition-colors">
                        <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">{tm.transactionId}</td>
                        <td className="p-4 font-medium">{tm.user}</td>
                        <td className="p-4 font-mono text-neutral-500 text-[11px]">{tm.sku}</td>
                        <td className="p-4">{tm.product}</td>
                        <td className="p-4 text-center font-mono">{tm.units}</td>
                        <td className="p-4 text-right font-mono text-neutral-500">
                          ₹{tm.grossValue.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{tm.netValue.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            tm.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : tm.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : tm.status === 'Refunded'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
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
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No matching records found for "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-[#121212] border-t border-neutral-200/60 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-neutral-500 dark:text-neutral-400">
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#202024] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-full bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#202024] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
