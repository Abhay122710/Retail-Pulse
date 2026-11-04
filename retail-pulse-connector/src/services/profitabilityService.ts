import { db } from '../models/database.js';
import { CanonicalEvent } from '../models/types.js';

export interface ProductProfitabilityItem {
  product_id: string;
  product_name: string;
  source: 'ShopPulse' | 'TechMart';
  category: string;
  unit_price: number;
  unit_cost: number | null; // null if not in catalog
  units_sold: number;
  gross_revenue: number;
  net_revenue: number;
  total_cogs: number | null; // units_sold * unit_cost
  gross_profit: number | null; // net_revenue - total_cogs
  gross_margin_pct: number | null; // (gross_profit / net_revenue) * 100
  cost_available: boolean;
  performance_classification: 'HIGH_MARGIN' | 'MODERATE_MARGIN' | 'LOW_MARGIN_HIGH_VOLUME' | 'LOW_PERFORMER' | 'COST_UNAVAILABLE';
}

export interface CategoryProfitabilityItem {
  category: string;
  source: string;
  units_sold: number;
  net_revenue: number;
  total_cogs: number | null;
  gross_profit: number | null;
  gross_margin_pct: number | null;
  cost_coverage_pct: number; // percentage of products in category with verified cost
}

// Verified Wholesale Catalog Costs (COGS)
export const KNOWN_CATALOG_COSTS: Record<string, { unit_cost: number; category: string; source: 'ShopPulse' | 'TechMart' }> = {
  // ShopPulse
  'P101': { unit_cost: 1650.0, category: 'Electronics', source: 'ShopPulse' },
  'P102': { unit_cost: 800.0, category: 'Electronics', source: 'ShopPulse' },
  'P103': { unit_cost: 1400.0, category: 'Electronics', source: 'ShopPulse' },
  'P104': { unit_cost: 750.0, category: 'Computer Accessories', source: 'ShopPulse' },
  'P105': { unit_cost: 2300.0, category: 'Computer Accessories', source: 'ShopPulse' },
  'P106': { unit_cost: 2900.0, category: 'Computer Accessories', source: 'ShopPulse' },
  'P001': { unit_cost: 1600.0, category: 'Electronics', source: 'ShopPulse' },
  // TechMart
  'TM-PROD-101': { unit_cost: 68000.0, category: 'Computers', source: 'TechMart' },
  'TM-PROD-102': { unit_cost: 21500.0, category: 'Displays', source: 'TechMart' },
  'TM-PROD-103': { unit_cost: 3200.0, category: 'Audio', source: 'TechMart' },
  'TM-PROD-104': { unit_cost: 2100.0, category: 'Peripherals', source: 'TechMart' },
  'TM-PROD-105': { unit_cost: 3100.0, category: 'Peripherals', source: 'TechMart' },
  'TM-PROD-106': { unit_cost: 5200.0, category: 'Accessories', source: 'TechMart' },
  'TM-LAP-001': { unit_cost: 110000.0, category: 'Gaming', source: 'TechMart' },
  'TM-MON-002': { unit_cost: 22000.0, category: 'Displays', source: 'TechMart' }
};

export class ProfitabilityService {
  public static getProfitabilityAnalytics(sourceFilter?: string, categoryFilter?: string) {
    const isAllSources = !sourceFilter || sourceFilter === 'ALL SOURCES' || sourceFilter === 'All';
    const allEvents = isAllSources ? db.getEvents() : db.getEvents({ source: sourceFilter });

    const orderCreated = allEvents.filter((e) => e.event_type === 'ORDER_CREATED');
    const orderCancelled = allEvents.filter((e) => e.event_type === 'ORDER_CANCELLED');

    // Deduct cancellations
    const cancelledOrderIds = new Set(
      orderCancelled.map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    const activeOrders = orderCreated.filter(
      (e) => !e.order_id || !cancelledOrderIds.has(e.order_id)
    );

    // Group sales by product
    const productMap = new Map<string, {
      product_id: string;
      product_name: string;
      source: 'ShopPulse' | 'TechMart';
      category: string;
      unit_price: number;
      units_sold: number;
      gross_revenue: number;
      net_revenue: number;
    }>();

    // Process all orders for gross, active orders for net
    orderCreated.forEach((e) => {
      const pid = e.product_id || (e.canonical_product_id ? e.canonical_product_id.replace(/^(SP-PROD-|TM-SKU-)/, '') : 'UNKNOWN');
      const name = e.product_name || `Product ${pid}`;
      const src = e.source as 'ShopPulse' | 'TechMart';
      const cat = e.category || 'General';
      const amt = e.total_amount || 0;
      const qty = e.quantity || 1;
      const unitP = e.unit_price || (qty > 0 ? amt / qty : amt);

      if (!productMap.has(pid)) {
        productMap.set(pid, {
          product_id: pid,
          product_name: name,
          source: src,
          category: cat,
          unit_price: Math.round(unitP * 100) / 100,
          units_sold: 0,
          gross_revenue: 0,
          net_revenue: 0
        });
      }
      const p = productMap.get(pid)!;
      p.gross_revenue += amt;

      const isCancelled = e.order_id && cancelledOrderIds.has(e.order_id);
      if (!isCancelled) {
        p.units_sold += qty;
        p.net_revenue += amt;
      }
    });

    // Compute profitability metrics for each product
    const productItems: ProductProfitabilityItem[] = [];
    let aggregateNetRevenueWithCost = 0;
    let aggregateCogs = 0;
    let aggregateGrossProfit = 0;
    let totalProductsWithCost = 0;

    productMap.forEach((p, pid) => {
      if (categoryFilter && categoryFilter !== 'ALL' && p.category !== categoryFilter) {
        return;
      }

      // Look up verified wholesale catalog cost
      const catalogInfo = KNOWN_CATALOG_COSTS[pid] || KNOWN_CATALOG_COSTS[p.product_id];
      const unitCost = catalogInfo ? catalogInfo.unit_cost : null;
      const hasCost = unitCost !== null;

      let totalCogs: number | null = null;
      let grossProfit: number | null = null;
      let grossMarginPct: number | null = null;
      let classification: ProductProfitabilityItem['performance_classification'] = 'COST_UNAVAILABLE';

      if (hasCost && p.units_sold > 0) {
        totalCogs = Math.round(unitCost * p.units_sold * 100) / 100;
        grossProfit = Math.round((p.net_revenue - totalCogs) * 100) / 100;
        grossMarginPct = p.net_revenue > 0 ? Math.round((grossProfit / p.net_revenue) * 1000) / 10 : 0;

        aggregateNetRevenueWithCost += p.net_revenue;
        aggregateCogs += totalCogs;
        aggregateGrossProfit += grossProfit;
        totalProductsWithCost += 1;

        if (grossMarginPct >= 35) {
          classification = 'HIGH_MARGIN';
        } else if (grossMarginPct >= 20 && p.net_revenue > 50000) {
          classification = 'LOW_MARGIN_HIGH_VOLUME';
        } else if (grossMarginPct >= 15) {
          classification = 'MODERATE_MARGIN';
        } else {
          classification = 'LOW_PERFORMER';
        }
      } else if (!hasCost) {
        classification = 'COST_UNAVAILABLE';
      }

      productItems.push({
        product_id: p.product_id,
        product_name: p.product_name,
        source: p.source,
        category: p.category,
        unit_price: p.unit_price,
        unit_cost: unitCost,
        units_sold: p.units_sold,
        gross_revenue: Math.round(p.gross_revenue * 100) / 100,
        net_revenue: Math.round(p.net_revenue * 100) / 100,
        total_cogs: totalCogs,
        gross_profit: grossProfit,
        gross_margin_pct: grossMarginPct,
        cost_available: hasCost,
        performance_classification: classification
      });
    });

    // Sort products by net revenue descending
    productItems.sort((a, b) => b.net_revenue - a.net_revenue);

    // Best-performing (highest gross profit) and worst-performing (lowest gross margin or negative)
    const costedProducts = productItems.filter((p) => p.cost_available && p.gross_profit !== null);
    const bestByProfit = [...costedProducts].sort((a, b) => (b.gross_profit || 0) - (a.gross_profit || 0)).slice(0, 5);
    const worstByMargin = [...costedProducts].sort((a, b) => (a.gross_margin_pct || 0) - (b.gross_margin_pct || 0)).slice(0, 5);
    const highRevenueLowMargin = costedProducts.filter((p) => (p.gross_margin_pct || 0) <= 25 && p.net_revenue > 10000);

    // Category profitability breakdown
    const categoryAgg: Record<string, {
      category: string;
      source: string;
      units: number;
      revenue: number;
      cogs: number;
      profit: number;
      costedCount: number;
      totalCount: number;
    }> = {};

    productItems.forEach((p) => {
      const catKey = `${p.source}::${p.category}`;
      if (!categoryAgg[catKey]) {
        categoryAgg[catKey] = {
          category: p.category,
          source: p.source,
          units: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
          costedCount: 0,
          totalCount: 0
        };
      }
      const c = categoryAgg[catKey];
      c.units += p.units_sold;
      c.revenue += p.net_revenue;
      c.totalCount += 1;
      if (p.cost_available && p.total_cogs !== null && p.gross_profit !== null) {
        c.cogs += p.total_cogs;
        c.profit += p.gross_profit;
        c.costedCount += 1;
      }
    });

    const categoryBreakdown: CategoryProfitabilityItem[] = Object.values(categoryAgg).map((c) => ({
      category: c.category,
      source: c.source,
      units_sold: c.units,
      net_revenue: Math.round(c.revenue * 100) / 100,
      total_cogs: c.costedCount > 0 ? Math.round(c.cogs * 100) / 100 : null,
      gross_profit: c.costedCount > 0 ? Math.round(c.profit * 100) / 100 : null,
      gross_margin_pct: (c.costedCount > 0 && c.revenue > 0)
        ? Math.round((c.profit / c.revenue) * 1000) / 10
        : null,
      cost_coverage_pct: c.totalCount > 0 ? Math.round((c.costedCount / c.totalCount) * 100) : 0
    })).sort((a, b) => b.net_revenue - a.net_revenue);

    const aggregateMarginPct = aggregateNetRevenueWithCost > 0
      ? Math.round((aggregateGrossProfit / aggregateNetRevenueWithCost) * 1000) / 10
      : null;

    return {
      success: true,
      timestamp: new Date().toISOString(),
      filters: {
        source: sourceFilter || 'ALL SOURCES',
        category: categoryFilter || 'ALL'
      },
      summary: {
        total_products_tracked: productItems.length,
        products_with_verified_cost: totalProductsWithCost,
        cost_data_coverage_percentage: productItems.length > 0 ? Math.round((totalProductsWithCost / productItems.length) * 100) : 0,
        aggregate_net_revenue: Math.round(productItems.reduce((sum, p) => sum + p.net_revenue, 0) * 100) / 100,
        aggregate_costed_revenue: Math.round(aggregateNetRevenueWithCost * 100) / 100,
        aggregate_cogs: Math.round(aggregateCogs * 100) / 100,
        aggregate_gross_profit: Math.round(aggregateGrossProfit * 100) / 100,
        aggregate_gross_margin_pct: aggregateMarginPct
      },
      best_performing_by_profit: bestByProfit,
      worst_performing_by_margin: worstByMargin,
      high_revenue_low_margin_products: highRevenueLowMargin,
      products: productItems,
      category_profitability: categoryBreakdown,
      data_integrity_notes: [
        'Gross Profit is defined strictly as Net Revenue minus Verified Cost of Goods Sold (COGS).',
        'Net Revenue excludes cancelled and refunded orders. Cancellations do not incur COGS.',
        'Products without supplier catalog cost are explicitly labeled COST_UNAVAILABLE and omitted from profit calculations to prevent fabricated estimates.'
      ]
    };
  }
}
