import { Request, Response } from 'express';
import { db } from '../models/database.js';
import { PredictiveController } from './predictive.controller.js';

export class PipelineController {
  public static async getPipelineMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const sourceFilter = req.query.source as string | undefined;
      const allEvents = db.getEvents();
      const sourcesList = ['ShopPulse', 'TechMart'];

      // Source health and activity stats
      const sourcesData = sourcesList.map((srcName) => {
        const srcEvents = allEvents.filter((e) => e.source === srcName);
        const counters = db.getPipelineCounters(srcName);
        
        let lastSeen: string | null = null;
        let freshnessSeconds: number | null = null;
        let freshnessLabel = 'No Data Ingested';

        if (srcEvents.length > 0) {
          // Sort by timestamp descending
          const sorted = [...srcEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          lastSeen = sorted[0].timestamp;
          freshnessSeconds = Math.max(0, Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000));
          
          if (freshnessSeconds < 120) {
            freshnessLabel = 'Active (< 2 min ago)';
          } else if (freshnessSeconds < 3600) {
            freshnessLabel = `Active (${Math.floor(freshnessSeconds / 60)}m ago)`;
          } else if (freshnessSeconds < 86400) {
            freshnessLabel = `Recent (${Math.floor(freshnessSeconds / 3600)}h ago)`;
          } else {
            freshnessLabel = `Historical (${Math.floor(freshnessSeconds / 86400)}d ago)`;
          }
        }

        const totalHandled = (counters.records_accepted + counters.records_rejected + counters.records_deduplicated) || srcEvents.length;
        const duplicateRate = totalHandled > 0 ? Math.round((counters.records_deduplicated / totalHandled) * 1000) / 10 : 0;
        const errorRate = totalHandled > 0 ? Math.round((counters.records_rejected / totalHandled) * 1000) / 10 : 0;

        let status: 'Healthy' | 'Degraded' | 'Offline' = 'Healthy';
        if (srcEvents.length === 0 && counters.total_processed === 0) {
          status = 'Offline';
        } else if (errorRate > 15) {
          status = 'Degraded';
        }

        return {
          source_id: srcName,
          status,
          total_events: srcEvents.length,
          records_accepted: counters.records_accepted || srcEvents.length,
          records_rejected: counters.records_rejected,
          records_deduplicated: counters.records_deduplicated,
          duplicate_rate_percentage: duplicateRate,
          error_rate_percentage: errorRate,
          last_seen: lastSeen,
          freshness_seconds: freshnessSeconds,
          freshness_label: freshnessLabel,
          last_successful_ingestion: counters.last_successful_ingestion || lastSeen,
          last_failed_ingestion: counters.last_failed_ingestion
        };
      });

      // Filter sources if requested
      const filteredSources = (sourceFilter && sourceFilter !== 'ALL SOURCES' && sourceFilter !== 'All')
        ? sourcesData.filter((s) => s.source_id === sourceFilter)
        : sourcesData;

      // Calculate Field Completeness across events
      const targetEvents = (sourceFilter && sourceFilter !== 'ALL SOURCES' && sourceFilter !== 'All')
        ? allEvents.filter((e) => e.source === sourceFilter)
        : allEvents;

      const totalEvt = targetEvents.length;
      const orderEvts = targetEvents.filter((e) => e.event_type === 'ORDER_CREATED');

      const fieldCompleteness: Record<string, { present: number; total: number; percentage: number }> = {
        session_id: {
          present: targetEvents.filter((e) => Boolean(e.session_id)).length,
          total: totalEvt,
          percentage: totalEvt > 0 ? Math.round((targetEvents.filter((e) => Boolean(e.session_id)).length / totalEvt) * 100) : 100
        },
        user_id: {
          present: targetEvents.filter((e) => Boolean(e.user_id || e.canonical_user_id)).length,
          total: totalEvt,
          percentage: totalEvt > 0 ? Math.round((targetEvents.filter((e) => Boolean(e.user_id || e.canonical_user_id)).length / totalEvt) * 100) : 100
        },
        product_id: {
          present: targetEvents.filter((e) => Boolean(e.product_id || e.canonical_product_id)).length,
          total: totalEvt,
          percentage: totalEvt > 0 ? Math.round((targetEvents.filter((e) => Boolean(e.product_id || e.canonical_product_id)).length / totalEvt) * 100) : 100
        },
        order_id_on_orders: {
          present: orderEvts.filter((e) => Boolean(e.order_id || e.canonical_transaction_id)).length,
          total: orderEvts.length,
          percentage: orderEvts.length > 0 ? Math.round((orderEvts.filter((e) => Boolean(e.order_id || e.canonical_transaction_id)).length / orderEvts.length) * 100) : 100
        },
        amount_on_orders: {
          present: orderEvts.filter((e) => typeof e.total_amount === 'number' && e.total_amount > 0).length,
          total: orderEvts.length,
          percentage: orderEvts.length > 0 ? Math.round((orderEvts.filter((e) => typeof e.total_amount === 'number' && e.total_amount > 0).length / orderEvts.length) * 100) : 100
        },
        payment_method_on_orders: {
          present: orderEvts.filter((e) => Boolean(e.payment_method)).length,
          total: orderEvts.length,
          percentage: orderEvts.length > 0 ? Math.round((orderEvts.filter((e) => Boolean(e.payment_method)).length / orderEvts.length) * 100) : 100
        }
      };

      // Quality Scores
      const avgCompleteness = Object.values(fieldCompleteness).reduce((sum, f) => sum + f.percentage, 0) / Object.keys(fieldCompleteness).length;
      const globalCounters = db.getPipelineCounters('ALL');
      const totalProcessedAll = globalCounters.total_processed || totalEvt;
      const complianceScore = totalProcessedAll > 0
        ? Math.max(0, Math.round((1 - (globalCounters.validation_errors / totalProcessedAll)) * 1000) / 10)
        : 100;
      const overallQualityScore = Math.round((avgCompleteness * 0.4 + complianceScore * 0.6) * 10) / 10;

      // Validation Errors Summary
      const auditLog = db.getPipelineAudit(100, sourceFilter);
      const errorMap: Record<string, { category: string; count: number; last_seen: string }> = {};

      auditLog.filter((a) => a.status === 'REJECTED').forEach((entry) => {
        const details = entry.error_details?.join('; ') || 'Schema validation rejected';
        if (!errorMap[details]) {
          errorMap[details] = { category: details, count: 0, last_seen: entry.timestamp };
        }
        errorMap[details].count += 1;
        if (new Date(entry.timestamp) > new Date(errorMap[details].last_seen)) {
          errorMap[details].last_seen = entry.timestamp;
        }
      });

      // Check Python ML service health dynamically
      let pythonServiceStatus: 'HEALTHY' | 'UNAVAILABLE' = 'UNAVAILABLE';
      try {
        const pyHealth = await (PredictiveController as any).queryPythonService('/health');
        if (pyHealth && pyHealth.status === 'healthy') {
          pythonServiceStatus = 'HEALTHY';
        }
      } catch {}

      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        sources: filteredSources,
        data_quality: {
          overall_quality_score: overallQualityScore,
          completeness_score: Math.round(avgCompleteness * 10) / 10,
          schema_compliance_score: complianceScore,
          field_completeness: fieldCompleteness,
          validation_failure_summary: Object.values(errorMap)
        },
        pipeline_counters: globalCounters,
        recent_activity: auditLog.slice(0, 50),
        system_health: {
          connector_status: 'HEALTHY',
          uptime_seconds: Math.floor(process.uptime()),
          python_ml_status: pythonServiceStatus,
          events_stored_total: allEvents.length
        }
      });
    } catch (err: any) {
      console.error('[PipelineController] Error generating pipeline monitoring data:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pipeline monitoring metrics',
        error: err.message
      });
    }
  }
}
