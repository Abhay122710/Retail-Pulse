import { db } from '../models/database.js';
import { DailyTimeSeriesPoint, ProductDailyTimeSeries } from './types.js';

export class TimeSeriesService {
  /**
   * Builds a continuous daily time series for a source or aggregate.
   * Gaps between first and last observed dates are filled with genuine 0-demand days.
   */
  public static getDailyTimeSeries(source?: string): {
    points: DailyTimeSeriesPoint[];
    startDate: string | null;
    endDate: string | null;
    totalDays: number;
    activeDays: number;
  } {
    const isAllSources = !source || source === 'ALL SOURCES' || source === 'All';
    const events = isAllSources ? db.getEvents() : db.getEvents({ source });

    if (events.length === 0) {
      return {
        points: [],
        startDate: null,
        endDate: null,
        totalDays: 0,
        activeDays: 0
      };
    }

    // Identify cancelled order IDs to apply documented cancellation rule
    const cancelledOrderIds = new Set(
      events.filter((e) => e.event_type === 'ORDER_CANCELLED').map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    // Group events by date (YYYY-MM-DD in UTC)
    const dailyMap = new Map<string, {
      revenue_gross: number;
      revenue_net: number;
      order_count: number;
      units_sold: number;
      cancelled_orders: number;
      checkout_starts: number;
      product_views: number;
      cart_additions: number;
    }>();

    events.forEach((evt) => {
      if (!evt.timestamp) return;
      const dateStr = evt.timestamp.slice(0, 10);
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          revenue_gross: 0,
          revenue_net: 0,
          order_count: 0,
          units_sold: 0,
          cancelled_orders: 0,
          checkout_starts: 0,
          product_views: 0,
          cart_additions: 0
        });
      }

      const day = dailyMap.get(dateStr)!;

      if (evt.event_type === 'ORDER_CREATED') {
        const amount = evt.total_amount || 0;
        const qty = evt.quantity || 1;
        day.revenue_gross += amount;

        if (!evt.order_id || !cancelledOrderIds.has(evt.order_id)) {
          day.revenue_net += amount;
          day.order_count += 1;
          day.units_sold += qty;
        }
      } else if (evt.event_type === 'ORDER_CANCELLED') {
        day.cancelled_orders += 1;
      } else if (evt.event_type === 'CHECKOUT_STARTED') {
        day.checkout_starts += 1;
      } else if (evt.event_type === 'PRODUCT_VIEW') {
        day.product_views += 1;
      } else if (evt.event_type === 'ADD_TO_CART') {
        day.cart_additions += 1;
      }
    });

    const dates = Array.from(dailyMap.keys()).sort();
    if (dates.length === 0) {
      return { points: [], startDate: null, endDate: null, totalDays: 0, activeDays: 0 };
    }

    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    // Generate continuous date range
    const resultPoints: DailyTimeSeriesPoint[] = [];
    const current = new Date(minDate + 'T00:00:00.000Z');
    const end = new Date(maxDate + 'T00:00:00.000Z');

    let activeDaysCount = 0;

    while (current <= end) {
      const dateKey = current.toISOString().slice(0, 10);
      const dayData = dailyMap.get(dateKey);

      if (dayData) {
        activeDaysCount++;
        resultPoints.push({
          date: dateKey,
          revenue_gross: Math.round(dayData.revenue_gross),
          revenue_net: Math.round(dayData.revenue_net),
          order_count: dayData.order_count,
          units_sold: dayData.units_sold,
          cancelled_orders: dayData.cancelled_orders,
          checkout_starts: dayData.checkout_starts,
          product_views: dayData.product_views,
          cart_additions: dayData.cart_additions,
          is_interpolated_zero: false
        });
      } else {
        // Genuine zero-demand day in historical timeline
        resultPoints.push({
          date: dateKey,
          revenue_gross: 0,
          revenue_net: 0,
          order_count: 0,
          units_sold: 0,
          cancelled_orders: 0,
          checkout_starts: 0,
          product_views: 0,
          cart_additions: 0,
          is_interpolated_zero: true
        });
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return {
      points: resultPoints,
      startDate: minDate,
      endDate: maxDate,
      totalDays: resultPoints.length,
      activeDays: activeDaysCount
    };
  }

  /**
   * Builds product-level daily demand time series.
   */
  public static getProductDailyTimeSeries(productId: string, source?: string): ProductDailyTimeSeries {
    const isAllSources = !source || source === 'ALL SOURCES' || source === 'All';
    const events = isAllSources ? db.getEvents() : db.getEvents({ source });

    const cancelledOrderIds = new Set(
      events.filter((e) => e.event_type === 'ORDER_CANCELLED').map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    const productEvents = events.filter((e) => e.product_id === productId || e.canonical_product_id?.endsWith(productId));
    const productName = productEvents[0]?.product_name || `Product ${productId}`;
    const productSource = productEvents[0]?.source || source || 'ShopPulse';

    // Build timeline using full series boundary
    const fullSeries = this.getDailyTimeSeries(source);
    if (fullSeries.points.length === 0) {
      return {
        product_id: productId,
        product_name: productName,
        source: productSource,
        points: []
      };
    }

    const dayMap = new Map<string, { units: number; revenue: number; views: number }>();

    productEvents.forEach((e) => {
      const d = (e.timestamp || '').slice(0, 10);
      if (!dayMap.has(d)) dayMap.set(d, { units: 0, revenue: 0, views: 0 });
      const item = dayMap.get(d)!;

      if (e.event_type === 'PRODUCT_VIEW') {
        item.views += 1;
      } else if (e.event_type === 'ORDER_CREATED' && (!e.order_id || !cancelledOrderIds.has(e.order_id))) {
        item.units += (e.quantity || 1);
        item.revenue += (e.total_amount || 0);
      }
    });

    const points = fullSeries.points.map((p) => {
      const stats = dayMap.get(p.date) || { units: 0, revenue: 0, views: 0 };
      return {
        date: p.date,
        units: stats.units,
        revenue: Math.round(stats.revenue),
        views: stats.views
      };
    });

    return {
      product_id: productId,
      product_name: productName,
      source: productSource,
      points
    };
  }
}
