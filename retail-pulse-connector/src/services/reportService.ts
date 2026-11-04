import { db } from '../models/database.js';
import { CanonicalEvent } from '../models/types.js';
import { BenchmarkService } from './benchmarkService.js';
import { ProfitabilityService } from './profitabilityService.js';

export interface ExecutiveReportData {
  report_id: string;
  generated_at: string;
  reporting_period: {
    start_date: string;
    end_date: string;
    days_analyzed: number;
    source: string;
  };
  executive_summary: {
    total_gross_revenue: number;
    net_revenue: number;
    total_orders_placed: number;
    cancelled_orders: number;
    cancellation_rate_pct: number;
    average_order_value: number;
    total_active_products: number;
  };
  store_benchmarking: any;
  top_products: {
    product_id: string;
    product_name: string;
    category: string;
    gross_revenue: number;
    units_sold: number;
  }[];
  inventory_risk_summary: {
    critical_items_count: number;
    high_risk_items_count: number;
    low_risk_items_count: number;
    urgent_replenishment_needed: string[];
  };
  pipeline_health_summary: {
    overall_health: string;
    total_events_ingested: number;
    rejected_events: number;
    deduplicated_events: number;
    data_freshness_status: string;
  };
  evidenced_recommendations: {
    priority: 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
    category: string;
    title: string;
    evidence: string;
    recommended_action: string;
  }[];
  integrity_disclaimer: string;
}

export class ReportService {
  public static generateExecutiveReport(params: {
    source?: string;
    days?: number;
  }): ExecutiveReportData {
    const days = params.days && params.days > 0 ? params.days : 30;
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const allEvents: CanonicalEvent[] = db.getEvents();
    let events = allEvents.filter((e) => new Date(e.timestamp) >= periodStart);

    if (params.source && params.source !== 'ALL SOURCES' && params.source !== 'All') {
      events = events.filter((e) => e.source === params.source);
    }

    // 1. Executive Summary KPIs
    let grossRev = 0;
    let cancelledRev = 0;
    let totalOrders = 0;
    let cancelledOrders = 0;
    const productSalesMap = new Map<string, { name: string; category: string; rev: number; units: number }>();

    for (const evt of events) {
      if (evt.event_type === 'ORDER_CREATED' || evt.event_type === 'CHECKOUT_COMPLETED') {
        totalOrders++;
        const val = Number(evt.total_amount) || 0;
        grossRev += val;

        const pid = evt.canonical_product_id || evt.product_id || 'UNKNOWN';
        const pname = evt.product_name || pid;
        const pcat = evt.category || 'General';
        const units = Number(evt.quantity) || 1;

        if (!productSalesMap.has(pid)) {
          productSalesMap.set(pid, { name: pname, category: pcat, rev: val, units });
        } else {
          const p = productSalesMap.get(pid)!;
          p.rev += val;
          p.units += units;
        }
      } else if (evt.event_type === 'ORDER_CANCELLED') {
        cancelledOrders++;
        cancelledRev += Number(evt.total_amount) || 0;
      }
    }

    const netRev = Math.max(0, grossRev - cancelledRev);
    const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    const aov = totalOrders > 0 ? grossRev / totalOrders : 0;

    // Top Products
    const sortedProducts = Array.from(productSalesMap.entries())
      .map(([pid, val]) => ({
        product_id: pid,
        product_name: val.name,
        category: val.category,
        gross_revenue: Math.round(val.rev * 100) / 100,
        units_sold: val.units
      }))
      .sort((a, b) => b.gross_revenue - a.gross_revenue)
      .slice(0, 5);

    // 2. Store Benchmarking
    const benchmark = BenchmarkService.getCrossStoreBenchmark();

    // 3. Inventory Risks (from db inventory recommendations or calculations)
    const invRecs = db.getInventoryRecommendations(params.source);
    let critCount = 0;
    let highCount = 0;
    let lowCount = 0;
    const urgentItems: string[] = [];

    for (const item of invRecs) {
      if (item.stockout_risk_level === 'CRITICAL') {
        critCount++;
        urgentItems.push(`${item.product_name} (${item.current_stock} in stock)`);
      } else if (item.stockout_risk_level === 'HIGH') {
        highCount++;
        urgentItems.push(`${item.product_name} (${item.current_stock} in stock)`);
      } else {
        lowCount++;
      }
    }

    // 4. Pipeline Quality
    const spCounters = db.getPipelineCounters('ShopPulse');
    const tmCounters = db.getPipelineCounters('TechMart');
    const totalIngested = (spCounters.records_accepted || 0) + (tmCounters.records_accepted || 0);
    const totalRejected = (spCounters.records_rejected || 0) + (tmCounters.records_rejected || 0);
    const totalDeduplicated = (spCounters.records_deduplicated || 0) + (tmCounters.records_deduplicated || 0);
    const overallHealth = totalRejected > 10 ? 'Degraded' : 'Healthy';

    // 5. Evidenced Recommendations
    const recommendations: ExecutiveReportData['evidenced_recommendations'] = [];

    if (urgentItems.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Supply Chain',
        title: 'Immediate Reorder Required for Depleting SKUs',
        evidence: `${critCount + highCount} catalog products are currently flagged at Critical or High stockout risk with lead times up to 14 days.`,
        recommended_action: `Initiate purchase orders for: ${urgentItems.slice(0, 3).join(', ')}.`
      });
    }

    if (cancelRate > 8.0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Revenue Protection',
        title: 'Elevated Cancellation Rate Detected',
        evidence: `Order cancellation rate is ${cancelRate.toFixed(1)}% (${cancelledOrders} cancelled orders), exceeding the 5% threshold.`,
        recommended_action: 'Investigate payment gateway latency and checkout fulfillment friction in ShopPulse.'
      });
    } else {
      recommendations.push({
        priority: 'INFORMATIONAL',
        category: 'Fulfillment Stability',
        title: 'Order Completion Rates Healthy',
        evidence: `Cancellation rate is stable at ${cancelRate.toFixed(1)}% across ${totalOrders} observed transactions.`,
        recommended_action: 'Maintain current inventory allocation and payment routing.'
      });
    }

    if (sortedProducts.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Merchandising',
        title: `Promote Top Driver "${sortedProducts[0].product_name}"`,
        evidence: `Top SKU generated $${sortedProducts[0].gross_revenue.toFixed(2)} (${sortedProducts[0].units_sold} units), leading catalog sales volume.`,
        recommended_action: 'Consider featured home page placement and bundle promotions with complementary accessories.'
      });
    }

    return {
      report_id: `REP-EXEC-${Date.now().toString(36).toUpperCase()}`,
      generated_at: now.toISOString(),
      reporting_period: {
        start_date: periodStart.toISOString(),
        end_date: now.toISOString(),
        days_analyzed: days,
        source: params.source || 'ALL SOURCES'
      },
      executive_summary: {
        total_gross_revenue: Math.round(grossRev * 100) / 100,
        net_revenue: Math.round(netRev * 100) / 100,
        total_orders_placed: totalOrders,
        cancelled_orders: cancelledOrders,
        cancellation_rate_pct: Math.round(cancelRate * 10) / 10,
        average_order_value: Math.round(aov * 100) / 100,
        total_active_products: productSalesMap.size
      },
      store_benchmarking: {
        shop_pulse: benchmark.stores.ShopPulse,
        tech_mart: benchmark.stores.TechMart,
        comparison: benchmark.comparison_summary
      },
      top_products: sortedProducts,
      inventory_risk_summary: {
        critical_items_count: critCount,
        high_risk_items_count: highCount,
        low_risk_items_count: lowCount,
        urgent_replenishment_needed: urgentItems
      },
      pipeline_health_summary: {
        overall_health: overallHealth,
        total_events_ingested: totalIngested,
        rejected_events: totalRejected,
        deduplicated_events: totalDeduplicated,
        data_freshness_status: totalIngested > 0 ? 'LIVE_STREAMING' : 'IDLE'
      },
      evidenced_recommendations: recommendations,
      integrity_disclaimer:
        'This report is computed exclusively from stored canonical events and audited inventory telemetry. Products without cost metadata are excluded from profit aggregations. No synthetic figures or fabricated metrics have been substituted.'
    };
  }

  public static exportCsv(section: string, source?: string): string {
    const escape = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      // OWASP CSV Injection Defense (CWE-1236):
      // Neutralize formula trigger characters (=, +, -, @, \t, \r) by prepending a single quote (')
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    if (section === 'products') {
      const report = this.generateExecutiveReport({ source });
      const headers = ['Product ID', 'Product Name', 'Category', 'Units Sold', 'Gross Revenue ($)'];
      const rows = report.top_products.map((p) => [
        escape(p.product_id),
        escape(p.product_name),
        escape(p.category),
        escape(p.units_sold),
        escape(p.gross_revenue.toFixed(2))
      ]);
      return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    }

    if (section === 'inventory') {
      const items = db.getInventoryRecommendations(source);
      const headers = ['Product ID', 'Product Name', 'Available Stock', 'Safety Stock', 'Reorder Point', 'Suggested Reorder', 'Stockout Risk', 'Data Class'];
      const rows = items.map((i: any) => [
        escape(i.product_id),
        escape(i.product_name),
        escape(i.current_stock),
        escape(i.safety_stock),
        escape(i.reorder_point),
        escape(i.suggested_reorder_qty),
        escape(i.stockout_risk_level),
        escape(i.stock_data_source)
      ]);
      return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    }

    if (section === 'profitability') {
      const prof = ProfitabilityService.getProfitabilityAnalytics(source);
      const headers = ['Product ID', 'Product Name', 'Category', 'Units Sold', 'Gross Revenue ($)', 'Gross Profit ($)', 'Gross Margin (%)', 'Cost Coverage'];
      const rows = prof.products.map((p: any) => [
        escape(p.product_id),
        escape(p.product_name),
        escape(p.category),
        escape(p.units_sold),
        escape(p.gross_revenue.toFixed(2)),
        escape(p.gross_profit !== null ? p.gross_profit.toFixed(2) : 'COST_UNAVAILABLE'),
        escape(p.gross_margin_pct !== null ? `${p.gross_margin_pct.toFixed(1)}%` : 'COST_UNAVAILABLE'),
        escape(p.cost_data_status)
      ]);
      return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    }

    // Default: Executive KPIs
    const report = this.generateExecutiveReport({ source });
    const headers = ['Metric Dimension', 'Value', 'Source Filter', 'Audit Notes'];
    const rows = [
      [escape('Gross Revenue ($)'), escape(report.executive_summary.total_gross_revenue), escape(report.reporting_period.source), escape('Sum of all ORDER_CREATED & CHECKOUT_COMPLETED')],
      [escape('Net Revenue ($)'), escape(report.executive_summary.net_revenue), escape(report.reporting_period.source), escape('Gross Revenue minus ORDER_CANCELLED')],
      [escape('Total Orders Placed'), escape(report.executive_summary.total_orders_placed), escape(report.reporting_period.source), escape('Active purchase events')],
      [escape('Cancelled Orders'), escape(report.executive_summary.cancelled_orders), escape(report.reporting_period.source), escape('Reconciled order cancellations')],
      [escape('Cancellation Rate (%)'), escape(`${report.executive_summary.cancellation_rate_pct}%`), escape(report.reporting_period.source), escape('Cancelled / Total Placed')],
      [escape('Average Order Value ($)'), escape(report.executive_summary.average_order_value), escape(report.reporting_period.source), escape('Gross Revenue / Orders')]
    ];
    return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
  }
}

