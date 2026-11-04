import { db } from '../models/database.js';
import { CanonicalEvent } from '../models/types.js';
import { TimeSeriesService } from '../predictive/timeSeriesService.js';

export interface StoreBenchmarkMetrics {
  source_id: 'ShopPulse' | 'TechMart';
  store_name: string;
  currency: string;
  gross_revenue: number;
  net_revenue: number;
  total_orders_created: number;
  active_orders_count: number;
  cancelled_or_refunded_count: number;
  cancellation_rate_pct: number;
  average_order_value: number;
  sessions_count: number;
  conversion_rate_pct: number;
  cart_abandonment_rate_pct: number;
  avg_dwell_seconds: number;
  top_categories: Array<{ category: string; revenue: number; units: number; share_pct: number }>;
  top_products: Array<{ product_id: string; product_name: string; revenue: number; units: number }>;
  inventory_risk_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  latest_event_timestamp: string | null;
  freshness_seconds: number | null;
  freshness_label: string;
}

export interface ComparativeTrendPoint {
  date: string;
  shoppulse_revenue: number;
  shoppulse_units: number;
  techmart_revenue: number;
  techmart_units: number;
  total_revenue: number;
}

export class BenchmarkService {
  public static getCrossStoreBenchmark() {
    const allEvents = db.getEvents();

    const spMetrics = this.computeStoreMetrics('ShopPulse', allEvents);
    const tmMetrics = this.computeStoreMetrics('TechMart', allEvents);

    // Continuous aligned timeline across both stores
    const spSeries = TimeSeriesService.getDailyTimeSeries('ShopPulse').points;
    const tmSeries = TimeSeriesService.getDailyTimeSeries('TechMart').points;

    const dateSet = new Set<string>();
    spSeries.forEach((p) => dateSet.add(p.date));
    tmSeries.forEach((p) => dateSet.add(p.date));

    const sortedDates = Array.from(dateSet).sort();
    const spMap = new Map(spSeries.map((p) => [p.date, p]));
    const tmMap = new Map(tmSeries.map((p) => [p.date, p]));

    const comparativeTimeline: ComparativeTrendPoint[] = sortedDates.map((d) => {
      const sp = spMap.get(d);
      const tm = tmMap.get(d);
      const spRev = sp ? sp.revenue_net : 0;
      const tmRev = tm ? tm.revenue_net : 0;
      return {
        date: d,
        shoppulse_revenue: spRev,
        shoppulse_units: sp ? sp.units_sold : 0,
        techmart_revenue: tmRev,
        techmart_units: tm ? tm.units_sold : 0,
        total_revenue: Math.round((spRev + tmRev) * 100) / 100
      };
    });

    // Compute Deltas (ShopPulse vs TechMart)
    const revenueDifference = Math.round((spMetrics.net_revenue - tmMetrics.net_revenue) * 100) / 100;
    const revenueLeadingStore = spMetrics.net_revenue >= tmMetrics.net_revenue ? 'ShopPulse' : 'TechMart';
    const higherAovStore = spMetrics.average_order_value >= tmMetrics.average_order_value ? 'ShopPulse' : 'TechMart';
    const higherConversionStore = spMetrics.conversion_rate_pct >= tmMetrics.conversion_rate_pct ? 'ShopPulse' : 'TechMart';

    return {
      success: true,
      timestamp: new Date().toISOString(),
      normalization_standards: {
        currency: 'INR (₹)',
        timezone: 'UTC (ISO-8601)',
        deduplication_policy: 'Strict Business-Key Idempotency',
        cancellation_policy: 'Full cancellation netting deducted from Net Revenue and Active Orders'
      },
      stores: {
        ShopPulse: spMetrics,
        TechMart: tmMetrics
      },
      comparison_summary: {
        total_combined_net_revenue: Math.round((spMetrics.net_revenue + tmMetrics.net_revenue) * 100) / 100,
        total_combined_active_orders: spMetrics.active_orders_count + tmMetrics.active_orders_count,
        revenue_leading_store: revenueLeadingStore,
        revenue_difference_amount: Math.abs(revenueDifference),
        higher_aov_store: higherAovStore,
        higher_conversion_store: higherConversionStore
      },
      comparative_timeline: comparativeTimeline,
      compatibility_notes: [
        'ShopPulse native IDs (ORD-*, P-*) and TechMart native IDs (TXN-*, SKU-*) have been normalized to canonical identifiers.',
        'TechMart gross/net value differences reflect transactional discounts, which are netted out in both stores.',
        'Days with zero transactional activity reflect genuine operational downtime rather than missing data ranges.'
      ]
    };
  }

  private static computeStoreMetrics(source: 'ShopPulse' | 'TechMart', allEvents: CanonicalEvent[]): StoreBenchmarkMetrics {
    const events = allEvents.filter((e) => e.source === source);
    const isSp = source === 'ShopPulse';

    const orderCreated = events.filter((e) => e.event_type === 'ORDER_CREATED');
    const orderCancelled = events.filter((e) => e.event_type === 'ORDER_CANCELLED');
    const productViews = events.filter((e) => e.event_type === 'PRODUCT_VIEW');
    const checkoutStarts = events.filter((e) => e.event_type === 'CHECKOUT_STARTED');

    const cancelledOrderIds = new Set(
      orderCancelled.map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    const activeOrders = orderCreated.filter((e) => !e.order_id || !cancelledOrderIds.has(e.order_id));

    // Deduplicate distinct active orders
    const distinctOrders = new Map<string, CanonicalEvent>();
    activeOrders.forEach((e) => {
      const key = e.order_id || e.event_id;
      if (!distinctOrders.has(key)) {
        distinctOrders.set(key, e);
      }
    });

    const activeOrderCount = distinctOrders.size;
    const cancelledCount = cancelledOrderIds.size;
    const totalOrderCreatedCount = orderCreated.length;

    const grossRevenue = orderCreated.reduce((sum, e) => sum + (e.total_amount || 0), 0);
    const netRevenue = Array.from(distinctOrders.values()).reduce((sum, e) => sum + (e.total_amount || 0), 0);

    const cancellationRate = totalOrderCreatedCount > 0
      ? Math.round((cancelledCount / totalOrderCreatedCount) * 1000) / 10
      : 0;

    const aov = activeOrderCount > 0 ? Math.round(netRevenue / activeOrderCount) : 0;

    const sessionCount = db.getSessionsCount(source);
    const conversionRate = sessionCount > 0
      ? Math.round((activeOrderCount / sessionCount) * 1000) / 10
      : 0;

    const checkoutCount = checkoutStarts.length;
    let abandonmentRate = 0;
    if (checkoutCount > 0) {
      abandonmentRate = Math.max(0, Math.min(100, Math.round(((checkoutCount - activeOrderCount) / checkoutCount) * 1000) / 10));
    }

    const durationEvents = productViews.filter(
      (e) => typeof e.view_duration_seconds === 'number' && e.view_duration_seconds! > 0
    );
    const avgDwellSeconds = durationEvents.length > 0
      ? Math.round(durationEvents.reduce((sum, e) => sum + e.view_duration_seconds!, 0) / durationEvents.length)
      : 0;

    // Categories
    const categoryStats: Record<string, { revenue: number; units: number }> = {};
    Array.from(distinctOrders.values()).forEach((e) => {
      const cat = e.category || 'Uncategorized';
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, units: 0 };
      categoryStats[cat].revenue += (e.total_amount || 0);
      categoryStats[cat].units += (e.quantity || 1);
    });

    const topCategories = Object.entries(categoryStats).map(([cat, stats]) => ({
      category: cat,
      revenue: Math.round(stats.revenue * 100) / 100,
      units: stats.units,
      share_pct: netRevenue > 0 ? Math.round((stats.revenue / netRevenue) * 1000) / 10 : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Products
    const prodStats: Record<string, { name: string; revenue: number; units: number }> = {};
    Array.from(distinctOrders.values()).forEach((e) => {
      const id = e.product_id || e.canonical_product_id || 'UNKNOWN';
      const name = e.product_name || `Product ${id}`;
      if (!prodStats[id]) prodStats[id] = { name, revenue: 0, units: 0 };
      prodStats[id].revenue += (e.total_amount || 0);
      prodStats[id].units += (e.quantity || 1);
    });

    const topProducts = Object.entries(prodStats).map(([id, stats]) => ({
      product_id: id,
      product_name: stats.name,
      revenue: Math.round(stats.revenue * 100) / 100,
      units: stats.units
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Inventory Risks
    const inventoryRecs = db.getInventoryRecommendations(source);
    const inventoryRiskCounts = {
      critical: inventoryRecs.filter((r) => r.stockout_risk_level === 'CRITICAL').length,
      high: inventoryRecs.filter((r) => r.stockout_risk_level === 'HIGH').length,
      medium: inventoryRecs.filter((r) => r.stockout_risk_level === 'MEDIUM').length,
      low: inventoryRecs.filter((r) => r.stockout_risk_level === 'LOW').length
    };

    // Freshness
    let latestTs: string | null = null;
    let freshnessSeconds: number | null = null;
    let freshnessLabel = 'No Ingestion';

    if (events.length > 0) {
      const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      latestTs = sorted[0].timestamp;
      freshnessSeconds = Math.max(0, Math.floor((Date.now() - new Date(latestTs).getTime()) / 1000));
      if (freshnessSeconds < 120) freshnessLabel = 'Live (< 2m ago)';
      else if (freshnessSeconds < 3600) freshnessLabel = `${Math.floor(freshnessSeconds / 60)}m ago`;
      else if (freshnessSeconds < 86400) freshnessLabel = `${Math.floor(freshnessSeconds / 3600)}h ago`;
      else freshnessLabel = `${Math.floor(freshnessSeconds / 86400)}d ago`;
    }

    return {
      source_id: source,
      store_name: isSp ? 'ShopPulse General Store' : 'TechMart Electronics Store',
      currency: 'INR (₹)',
      gross_revenue: Math.round(grossRevenue * 100) / 100,
      net_revenue: Math.round(netRevenue * 100) / 100,
      total_orders_created: totalOrderCreatedCount,
      active_orders_count: activeOrderCount,
      cancelled_or_refunded_count: cancelledCount,
      cancellation_rate_pct: cancellationRate,
      average_order_value: aov,
      sessions_count: sessionCount,
      conversion_rate_pct: conversionRate,
      cart_abandonment_rate_pct: abandonmentRate,
      avg_dwell_seconds: avgDwellSeconds,
      top_categories: topCategories,
      top_products: topProducts,
      inventory_risk_counts: inventoryRiskCounts,
      latest_event_timestamp: latestTs,
      freshness_seconds: freshnessSeconds,
      freshness_label: freshnessLabel
    };
  }
}
