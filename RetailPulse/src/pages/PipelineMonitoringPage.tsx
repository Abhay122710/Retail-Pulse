import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  Clock,
  Layers,
  XCircle
} from 'lucide-react';

export const PipelineMonitoringPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  const [monitoringData, setMonitoringData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const src = selectedSource === 'ALL SOURCES' ? undefined : selectedSource;
      const res = await retailPulseApiService.getPipelineMonitoring(src);
      if (res && res.success) {
        setMonitoringData(res);
      } else {
        setError('Failed to fetch pipeline monitoring telemetry');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with monitoring service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 8000);
    return () => clearInterval(interval);
  }, [selectedSource]);

  if (loading && !monitoringData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-500">Loading Pipeline & Data Quality Telemetry...</span>
      </div>
    );
  }

  const quality = monitoringData?.data_quality;
  const sources = monitoringData?.sources || [];
  const system = monitoringData?.system_health;
  const recentActivity = monitoringData?.recent_activity || [];
  const validationSummary = quality?.validation_failure_summary || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Operational Telemetry
            </span>
            <span className="text-xs text-neutral-400">• Real-Time Health & Audit Lineage</span>
          </div>
          <h2 className="text-2xl font-black mt-2 text-neutral-900 dark:text-white font-heading">
            Data Quality & Pipeline Monitoring
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Tracking ingestion throughput, validation errors, field completeness, deduplication, and data freshness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-850'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. OVERALL QUALITY GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quality Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Quality Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white font-heading">
              {quality?.overall_quality_score ?? 100}%
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${quality?.overall_quality_score ?? 100}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Weighted composite (completeness + compliance)</span>
        </div>

        {/* Schema Compliance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Schema Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-heading">
              {quality?.schema_compliance_score ?? 100}%
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${quality?.schema_compliance_score ?? 100}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Zero validation defects on accepted events</span>
        </div>

        {/* Field Completeness */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Field Completeness</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-heading">
              {quality?.completeness_score ?? 100}%
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${quality?.completeness_score ?? 100}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Core identifiers & transactional payloads</span>
        </div>

        {/* Ingestion Throughput */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Stored Events</span>
            <Database className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white font-heading">
              {system?.events_stored_total ?? 0}
            </div>
            <span className="text-[11px] font-bold text-emerald-500 mt-1 inline-block">
              Uptime: {Math.floor((system?.uptime_seconds ?? 0) / 60)}m {((system?.uptime_seconds ?? 0) % 60)}s
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-2">Crash-resilient JSON DB with .bak snapshot</span>
        </div>
      </div>

      {/* 3. SOURCE HEALTH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src: any) => {
          const isSp = src.source_id === 'ShopPulse';
          return (
            <div
              key={src.source_id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                      isSp ? 'bg-blue-600' : 'bg-cyan-600'
                    }`}
                  >
                    {isSp ? 'SP' : 'TM'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white font-heading">
                      {src.source_id} Storefront
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Port {isSp ? '3000' : '5174'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {src.freshness_label}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    src.status === 'Healthy'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : src.status === 'Degraded'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                  }`}
                >
                  {src.status}
                </span>
              </div>

              {/* Source Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Accepted</span>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">{src.records_accepted}</div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Deduplicated</span>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {src.records_deduplicated} <span className="text-[10px] font-normal">({src.duplicate_rate_percentage}%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Rejected</span>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {src.records_rejected} <span className="text-[10px] font-normal">({src.error_rate_percentage}%)</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between pt-1">
                <span>Last Sync: {src.last_seen ? new Date(src.last_seen).toLocaleTimeString() : 'N/A'}</span>
                <span>Idempotency: Strict Order Key</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. FIELD COMPLETENESS & SCHEMA AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Completeness Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
              Canonical Field Population & Completeness
            </h3>
            <span className="text-xs text-neutral-400 font-medium">Validation Audit</span>
          </div>

          <div className="space-y-3 pt-2">
            {quality?.field_completeness &&
              Object.entries(quality.field_completeness).map(([key, item]: [string, any]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-700 dark:text-neutral-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-neutral-900 dark:text-white font-bold">
                      {item.percentage}% ({item.present}/{item.total})
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        item.percentage >= 90
                          ? 'bg-emerald-500'
                          : item.percentage >= 60
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Validation Errors & Failure Details */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E0E0E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">
              Validation Failures & Ingestion Rejections
            </h3>
            <span className="text-xs text-neutral-400 font-medium">
              {validationSummary.length} Error Pattern{validationSummary.length === 1 ? '' : 's'}
            </span>
          </div>

          {validationSummary.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Zero Schema Validation Failures
              </span>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                All submitted events conformed strictly to the canonical event specifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {validationSummary.map((err: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-2.5 text-xs"
                >
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">{err.category}</div>
                    <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 flex justify-between">
                      <span>Rejected: {err.count} time{err.count === 1 ? '' : 's'}</span>
                      <span>Last Seen: {new Date(err.last_seen).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. LIVE PIPELINE AUDIT LOG STREAM */}
      <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden bg-white dark:bg-[#0E0E0E] shadow-xs">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white font-heading">
              Recent Pipeline Ingestion & Audit Activity Stream
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            Latest {recentActivity.length} Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#141414] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">Stage</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Details / Correlation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-neutral-400">
                    No pipeline audit activity recorded in this session.
                  </td>
                </tr>
              ) : (
                recentActivity.map((log: any) => (
                  <tr key={log.audit_id} className="hover:bg-neutral-50/50 dark:hover:bg-[#151515]">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">{log.source}</td>
                    <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{log.stage}</td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                      {log.event_type || 'RAW_PAYLOAD'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : log.status === 'DEDUPLICATED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500 font-mono text-[10px]">
                      {log.error_details?.join('; ') || log.correlation_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
