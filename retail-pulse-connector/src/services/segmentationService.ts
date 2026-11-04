import { db } from '../models/database.js';
import { CanonicalEvent } from '../models/types.js';

export interface CustomerCohort {
  cohort_month: string;
  initial_customers: number;
  retention_by_month: {
    month_offset: number; // 0, 1, 2, ...
    active_customers: number;
    retention_rate_pct: number;
  }[];
}

export interface PurchaseFrequencyBucket {
  bucket: string;
  customer_count: number;
  share_pct: number;
}

export interface CustomerSegmentationResult {
  status: 'IDENTIFIED_DATA_AVAILABLE' | 'INSUFFICIENT_CUSTOMER_KEYS';
  identified_customers_count: number;
  repeat_customers_count: number;
  one_time_customers_count: number;
  repeat_purchase_rate_pct: number;
  avg_purchase_interval_days: number | null;
  frequency_distribution: PurchaseFrequencyBucket[];
  cohorts: CustomerCohort[];
  data_integrity_notes: string;
}

export interface AbcProductItem {
  product_id: string;
  product_name: string;
  category: string;
  gross_revenue: number;
  units_sold: number;
  cumulative_revenue: number;
  cumulative_share_pct: number;
  abc_class: 'A' | 'B' | 'C';
}

export interface AbcSummary {
  class_a: { product_count: number; revenue: number; revenue_share_pct: number };
  class_b: { product_count: number; revenue: number; revenue_share_pct: number };
  class_c: { product_count: number; revenue: number; revenue_share_pct: number };
}

export interface PriceBandItem {
  band_name: string;
  price_range: string;
  product_count: number;
  units_sold: number;
  gross_revenue: number;
  revenue_share_pct: number;
}

export interface VelocityTierItem {
  tier: 'Fast-Moving (Top 20%)' | 'Moderate-Moving (Mid 50%)' | 'Slow-Moving (Bottom 30%)';
  product_count: number;
  units_sold: number;
  revenue: number;
}

export interface SegmentationAnalysisReport {
  generated_at: string;
  filters: {
    source: string;
    date_from: string | null;
    date_to: string | null;
  };
  total_order_events_analyzed: number;
  customer_segmentation: CustomerSegmentationResult;
  product_abc_pareto: {
    summary: AbcSummary;
    items: AbcProductItem[];
  };
  price_band_segmentation: PriceBandItem[];
  demand_velocity: VelocityTierItem[];
}

export class SegmentationService {
  public static getSegmentationAnalytics(params: {
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): SegmentationAnalysisReport {
    const rawEvents: CanonicalEvent[] = db.getEvents();

    // Filter by source
    let events = rawEvents;
    if (params.source && params.source !== 'ALL SOURCES' && params.source !== 'All') {
      events = events.filter((e) => e.source === params.source);
    }

    // Filter by date range if provided
    if (params.dateFrom) {
      const fromTime = new Date(params.dateFrom).getTime();
      events = events.filter((e) => new Date(e.timestamp).getTime() >= fromTime);
    }
    if (params.dateTo) {
      const toTime = new Date(params.dateTo).getTime();
      events = events.filter((e) => new Date(e.timestamp).getTime() <= toTime);
    }

    // Identify purchase/order events
    const purchaseEvents = events.filter(
      (e) => e.event_type === 'ORDER_CREATED' || e.event_type === 'CHECKOUT_COMPLETED'
    );

    // 1. Customer Cohort & Repeat Purchase Analysis
    const customerAnalysis = this.computeCustomerAnalysis(purchaseEvents);

    // 2. Product ABC Pareto (80/20) Segmentation
    const abcAnalysis = this.computeAbcPareto(purchaseEvents);

    // 3. Price Band Segmentation
    const priceBandAnalysis = this.computePriceBands(purchaseEvents);

    // 4. Demand Velocity Tiers
    const velocityAnalysis = this.computeDemandVelocity(abcAnalysis.items);

    return {
      generated_at: new Date().toISOString(),
      filters: {
        source: params.source || 'ALL SOURCES',
        date_from: params.dateFrom || null,
        date_to: params.dateTo || null
      },
      total_order_events_analyzed: purchaseEvents.length,
      customer_segmentation: customerAnalysis,
      product_abc_pareto: abcAnalysis,
      price_band_segmentation: priceBandAnalysis,
      demand_velocity: velocityAnalysis
    };
  }

  private static computeCustomerAnalysis(events: CanonicalEvent[]): CustomerSegmentationResult {
    // Collect distinct identified users with their orders
    const userOrdersMap = new Map<string, { timestamps: number[]; totalSpend: number; count: number }>();

    for (const evt of events) {
      const customerId = evt.canonical_user_id || evt.user_id;
      if (!customerId) continue; // Do not fabricate customer ID from order IDs (mandatory data integrity rule)

      const ts = new Date(evt.timestamp).getTime();
      const amount = Number(evt.total_amount) || 0;

      if (!userOrdersMap.has(customerId)) {
        userOrdersMap.set(customerId, {
          timestamps: [ts],
          totalSpend: amount,
          count: 1
        });
      } else {
        const record = userOrdersMap.get(customerId)!;
        record.timestamps.push(ts);
        record.totalSpend += amount;
        record.count += 1;
      }
    }

    const totalIdentified = userOrdersMap.size;

    if (totalIdentified === 0) {
      return {
        status: 'INSUFFICIENT_CUSTOMER_KEYS',
        identified_customers_count: 0,
        repeat_customers_count: 0,
        one_time_customers_count: 0,
        repeat_purchase_rate_pct: 0,
        avg_purchase_interval_days: null,
        frequency_distribution: [],
        cohorts: [],
        data_integrity_notes:
          'No authenticated canonical_user_id or user_id fields found in the analyzed events. RetailPulse strictly refuses to fabricate customer identities from guest order IDs or browser cookies.'
      };
    }

    let repeatCount = 0;
    let oneTimeCount = 0;
    const intervalDeltasDays: number[] = [];

    // Frequency buckets: 1 order, 2 orders, 3-5 orders, 6+ orders
    const freqBuckets = {
      '1 Order (One-Time)': 0,
      '2 Orders (Repeat)': 0,
      '3-5 Orders (Loyal)': 0,
      '6+ Orders (VIP)': 0
    };

    // Cohorts mapping: initial purchase month (YYYY-MM) -> customerId -> array of active months
    const cohortMap = new Map<string, { initialUsers: Set<string>; activityMonths: Map<string, Set<string>> }>();

    for (const [userId, record] of userOrdersMap.entries()) {
      record.timestamps.sort((a, b) => a - b);

      if (record.count >= 2) {
        repeatCount++;
        // Calculate intervals between successive orders
        for (let i = 1; i < record.timestamps.length; i++) {
          const diffDays = (record.timestamps[i] - record.timestamps[i - 1]) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0) intervalDeltasDays.push(diffDays);
        }
      } else {
        oneTimeCount++;
      }

      // Frequency distribution
      if (record.count === 1) freqBuckets['1 Order (One-Time)']++;
      else if (record.count === 2) freqBuckets['2 Orders (Repeat)']++;
      else if (record.count >= 3 && record.count <= 5) freqBuckets['3-5 Orders (Loyal)']++;
      else freqBuckets['6+ Orders (VIP)']++;

      // Cohort calculations
      const firstDate = new Date(record.timestamps[0]);
      const cohortMonth = `${firstDate.getUTCFullYear()}-${String(firstDate.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!cohortMap.has(cohortMonth)) {
        cohortMap.set(cohortMonth, {
          initialUsers: new Set([userId]),
          activityMonths: new Map()
        });
      } else {
        cohortMap.get(cohortMonth)!.initialUsers.add(userId);
      }

      // Track active months
      for (const t of record.timestamps) {
        const d = new Date(t);
        const mKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        const cEntry = cohortMap.get(cohortMonth)!;
        if (!cEntry.activityMonths.has(mKey)) {
          cEntry.activityMonths.set(mKey, new Set([userId]));
        } else {
          cEntry.activityMonths.get(mKey)!.add(userId);
        }
      }
    }

    const repeatRate = totalIdentified > 0 ? (repeatCount / totalIdentified) * 100 : 0;
    const avgInterval =
      intervalDeltasDays.length > 0
        ? Math.round((intervalDeltasDays.reduce((a, b) => a + b, 0) / intervalDeltasDays.length) * 10) / 10
        : null;

    const frequencyDistribution: PurchaseFrequencyBucket[] = Object.entries(freqBuckets).map(
      ([bucket, count]) => ({
        bucket,
        customer_count: count,
        share_pct: totalIdentified > 0 ? Math.round((count / totalIdentified) * 1000) / 10 : 0
      })
    );

    // Build cohorts table
    const cohorts: CustomerCohort[] = [];
    const sortedCohortMonths = Array.from(cohortMap.keys()).sort();

    for (const cMonth of sortedCohortMonths) {
      const entry = cohortMap.get(cMonth)!;
      const initialCount = entry.initialUsers.size;
      const [cYear, cMonthNum] = cMonth.split('-').map(Number);

      const retentionByMonth = [];
      // Look forward up to 3 months
      for (let offset = 0; offset <= 3; offset++) {
        const targetYear = cYear + Math.floor((cMonthNum - 1 + offset) / 12);
        const targetMonthNum = ((cMonthNum - 1 + offset) % 12) + 1;
        const targetMonthKey = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}`;

        const activeSet = entry.activityMonths.get(targetMonthKey);
        const activeCount = activeSet ? activeSet.size : offset === 0 ? initialCount : 0;
        const rate = initialCount > 0 ? Math.round((activeCount / initialCount) * 1000) / 10 : 0;

        retentionByMonth.push({
          month_offset: offset,
          active_customers: activeCount,
          retention_rate_pct: rate
        });
      }

      cohorts.push({
        cohort_month: cMonth,
        initial_customers: initialCount,
        retention_by_month: retentionByMonth
      });
    }

    return {
      status: 'IDENTIFIED_DATA_AVAILABLE',
      identified_customers_count: totalIdentified,
      repeat_customers_count: repeatCount,
      one_time_customers_count: oneTimeCount,
      repeat_purchase_rate_pct: Math.round(repeatRate * 10) / 10,
      avg_purchase_interval_days: avgInterval,
      frequency_distribution: frequencyDistribution,
      cohorts,
      data_integrity_notes:
        'Customer metrics derived strictly from verifiable canonical_user_id and user_id fields. Unregistered guest checkouts are excluded from individual retention tracking to maintain audit integrity.'
    };
  }

  private static computeAbcPareto(events: CanonicalEvent[]): {
    summary: AbcSummary;
    items: AbcProductItem[];
  } {
    const productMap = new Map<string, { name: string; category: string; revenue: number; units: number }>();

    for (const evt of events) {
      const pid = evt.canonical_product_id || evt.product_id || 'UNKNOWN_ITEM';
      const name = evt.product_name || pid;
      const cat = evt.category || 'Uncategorized';
      const rev = Number(evt.total_amount) || (Number(evt.unit_price) || 0) * (Number(evt.quantity) || 1);
      const units = Number(evt.quantity) || 1;

      if (!productMap.has(pid)) {
        productMap.set(pid, { name, category: cat, revenue: rev, units });
      } else {
        const rec = productMap.get(pid)!;
        rec.revenue += rev;
        rec.units += units;
      }
    }

    const itemsList = Array.from(productMap.entries()).map(([pid, val]) => ({
      product_id: pid,
      product_name: val.name,
      category: val.category,
      gross_revenue: Math.round(val.revenue * 100) / 100,
      units_sold: val.units
    }));

    // Sort descending by revenue
    itemsList.sort((a, b) => b.gross_revenue - a.gross_revenue);

    const totalRevenue = itemsList.reduce((acc, item) => acc + item.gross_revenue, 0);

    let cumulativeRev = 0;
    const classifiedItems: AbcProductItem[] = [];

    const summary: AbcSummary = {
      class_a: { product_count: 0, revenue: 0, revenue_share_pct: 0 },
      class_b: { product_count: 0, revenue: 0, revenue_share_pct: 0 },
      class_c: { product_count: 0, revenue: 0, revenue_share_pct: 0 }
    };

    for (const item of itemsList) {
      cumulativeRev += item.gross_revenue;
      const sharePct = totalRevenue > 0 ? (cumulativeRev / totalRevenue) * 100 : 0;

      let abcClass: 'A' | 'B' | 'C' = 'C';
      if (sharePct <= 80 || classifiedItems.length === 0) {
        abcClass = 'A';
        summary.class_a.product_count++;
        summary.class_a.revenue += item.gross_revenue;
      } else if (sharePct <= 95) {
        abcClass = 'B';
        summary.class_b.product_count++;
        summary.class_b.revenue += item.gross_revenue;
      } else {
        abcClass = 'C';
        summary.class_c.product_count++;
        summary.class_c.revenue += item.gross_revenue;
      }

      classifiedItems.push({
        ...item,
        cumulative_revenue: Math.round(cumulativeRev * 100) / 100,
        cumulative_share_pct: Math.round(sharePct * 10) / 10,
        abc_class: abcClass
      });
    }

    if (totalRevenue > 0) {
      summary.class_a.revenue_share_pct = Math.round((summary.class_a.revenue / totalRevenue) * 1000) / 10;
      summary.class_b.revenue_share_pct = Math.round((summary.class_b.revenue / totalRevenue) * 1000) / 10;
      summary.class_c.revenue_share_pct = Math.round((summary.class_c.revenue / totalRevenue) * 1000) / 10;
      summary.class_a.revenue = Math.round(summary.class_a.revenue * 100) / 100;
      summary.class_b.revenue = Math.round(summary.class_b.revenue * 100) / 100;
      summary.class_c.revenue = Math.round(summary.class_c.revenue * 100) / 100;
    }

    return { summary, items: classifiedItems };
  }

  private static computePriceBands(events: CanonicalEvent[]): PriceBandItem[] {
    const bands: {
      name: string;
      range: string;
      min: number;
      max: number;
      products: Set<string>;
      units: number;
      revenue: number;
    }[] = [
      { name: 'Budget Tier', range: '< $50', min: 0, max: 50, products: new Set(), units: 0, revenue: 0 },
      { name: 'Mid-Market Tier', range: '$50 - $150', min: 50, max: 150, products: new Set(), units: 0, revenue: 0 },
      { name: 'Premium Tier', range: '$150 - $500', min: 150, max: 500, products: new Set(), units: 0, revenue: 0 },
      { name: 'Ultra / High-Ticket', range: '$500+', min: 500, max: Infinity, products: new Set(), units: 0, revenue: 0 }
    ];

    let totalRev = 0;

    for (const evt of events) {
      const price = Number(evt.unit_price) || 0;
      const units = Number(evt.quantity) || 1;
      const rev = Number(evt.total_amount) || price * units;
      const pid = evt.canonical_product_id || evt.product_id || 'UNKNOWN';

      totalRev += rev;

      const matchedBand = bands.find((b) => price >= b.min && price < b.max);
      if (matchedBand) {
        matchedBand.products.add(pid);
        matchedBand.units += units;
        matchedBand.revenue += rev;
      }
    }

    return bands.map((b) => ({
      band_name: b.name,
      price_range: b.range,
      product_count: b.products.size,
      units_sold: b.units,
      gross_revenue: Math.round(b.revenue * 100) / 100,
      revenue_share_pct: totalRev > 0 ? Math.round((b.revenue / totalRev) * 1000) / 10 : 0
    }));
  }

  private static computeDemandVelocity(items: AbcProductItem[]): VelocityTierItem[] {
    if (items.length === 0) {
      return [
        { tier: 'Fast-Moving (Top 20%)', product_count: 0, units_sold: 0, revenue: 0 },
        { tier: 'Moderate-Moving (Mid 50%)', product_count: 0, units_sold: 0, revenue: 0 },
        { tier: 'Slow-Moving (Bottom 30%)', product_count: 0, units_sold: 0, revenue: 0 }
      ];
    }

    // Sort by units sold descending
    const sorted = [...items].sort((a, b) => b.units_sold - a.units_sold);
    const n = sorted.length;

    const top20Idx = Math.max(1, Math.round(n * 0.2));
    const mid70Idx = Math.max(top20Idx + 1, Math.round(n * 0.7));

    const fastGroup = sorted.slice(0, top20Idx);
    const modGroup = sorted.slice(top20Idx, mid70Idx);
    const slowGroup = sorted.slice(mid70Idx);

    const calcGroup = (
      tierName: 'Fast-Moving (Top 20%)' | 'Moderate-Moving (Mid 50%)' | 'Slow-Moving (Bottom 30%)',
      grp: AbcProductItem[]
    ): VelocityTierItem => ({
      tier: tierName,
      product_count: grp.length,
      units_sold: grp.reduce((acc, g) => acc + g.units_sold, 0),
      revenue: Math.round(grp.reduce((acc, g) => acc + g.gross_revenue, 0) * 100) / 100
    });

    return [
      calcGroup('Fast-Moving (Top 20%)', fastGroup),
      calcGroup('Moderate-Moving (Mid 50%)', modGroup),
      calcGroup('Slow-Moving (Bottom 30%)', slowGroup)
    ];
  }
}
