import { db } from '../models/database.js';
import { CanonicalEvent } from '../models/types.js';

export class InsightService {
  public static getInsights(source?: string) {
    const isAllSources = !source || source === 'ALL SOURCES' || source === 'All';
    const events = isAllSources ? db.getEvents() : db.getEvents({ source });
    const isShopPulse = source === 'ShopPulse';
    const isTechMart = source === 'TechMart';

    // Event filtering counts
    const productViews = events.filter((e) => e.event_type === 'PRODUCT_VIEW');
    const addToCarts = events.filter((e) => e.event_type === 'ADD_TO_CART');
    const removeFromCarts = events.filter((e) => e.event_type === 'REMOVE_FROM_CART');
    const cartViews = events.filter((e) => e.event_type === 'CART_VIEW');
    const wishlists = events.filter((e) => e.event_type === 'WISHLIST_ADD');
    const checkoutStarts = events.filter((e) => e.event_type === 'CHECKOUT_STARTED');
    const createdOrders = events.filter((e) => e.event_type === 'ORDER_CREATED');
    const cancelledEvents = events.filter((e) => e.event_type === 'ORDER_CANCELLED');
    const searches = events.filter((e) => e.event_type === 'SEARCH');

    // Track cancelled order identifiers to deduct them from net metrics
    const cancelledOrderIds = new Set(
      cancelledEvents.map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    // Active (non-cancelled) completed orders
    const activeOrders = createdOrders.filter(
      (e) => !e.order_id || !cancelledOrderIds.has(e.order_id)
    );

    // Distinct completed orders (deduplicated by order_id)
    const distinctActiveOrderMap = new Map<string, CanonicalEvent>();
    activeOrders.forEach((e) => {
      const key = e.order_id || e.event_id;
      if (!distinctActiveOrderMap.has(key)) {
        distinctActiveOrderMap.set(key, e);
      }
    });

    const activeOrderCount = distinctActiveOrderMap.size;
    const cancelledOrderCount = cancelledOrderIds.size;

    // Real mathematical revenue calculation
    const grossRevenue = createdOrders.reduce((sum, e) => sum + (e.total_amount || 0), 0);
    const netRevenue = Array.from(distinctActiveOrderMap.values()).reduce(
      (sum, e) => sum + (e.total_amount || 0), 
      0
    );

    // Dwell duration calculation
    const durationEvents = productViews.filter(
      (e) => typeof e.view_duration_seconds === 'number' && e.view_duration_seconds! > 0
    );
    const avgDwellSeconds = durationEvents.length > 0 
      ? Math.round(durationEvents.reduce((sum, e) => sum + e.view_duration_seconds!, 0) / durationEvents.length)
      : 0;

    // Cart Abandonment Rate
    const checkoutCount = checkoutStarts.length;
    let abandonmentRate = 0;
    if (checkoutCount > 0) {
      abandonmentRate = Math.max(
        0, 
        Math.min(100, Math.round(((checkoutCount - activeOrderCount) / checkoutCount) * 1000) / 10)
      );
    }

    // Conversion Rate
    const sessionCount = db.getSessionsCount(source);
    let conversionRate = 0;
    if (sessionCount > 0) {
      conversionRate = Math.max(
        0, 
        Math.min(100, Math.round((activeOrderCount / sessionCount) * 1000) / 10)
      );
    }

    // Average Order Value
    const aov = activeOrderCount > 0 ? Math.round(netRevenue / activeOrderCount) : 0;

    // Dynamic Product Engagement Aggregations
    const productStats: Record<string, { 
      views: number; 
      carts: number; 
      wishlists: number; 
      purchases: number; 
      revenue: number;
      totalDuration: number; 
      durationCount: number; 
      category: string 
    }> = {};

    events.forEach((e) => {
      const name = e.product_name || (e.product_id ? `Product ${e.product_id}` : null);
      if (!name) return;

      if (!productStats[name]) {
        productStats[name] = {
          views: 0,
          carts: 0,
          wishlists: 0,
          purchases: 0,
          revenue: 0,
          totalDuration: 0,
          durationCount: 0,
          category: e.category || 'General'
        };
      }

      if (e.event_type === 'PRODUCT_VIEW') {
        productStats[name].views += 1;
        if (typeof e.view_duration_seconds === 'number' && e.view_duration_seconds > 0) {
          productStats[name].totalDuration += e.view_duration_seconds;
          productStats[name].durationCount += 1;
        }
      } else if (e.event_type === 'ADD_TO_CART') {
        productStats[name].carts += 1;
      } else if (e.event_type === 'WISHLIST_ADD') {
        productStats[name].wishlists += 1;
      } else if (e.event_type === 'ORDER_CREATED' && (!e.order_id || !cancelledOrderIds.has(e.order_id))) {
        productStats[name].purchases += 1;
        productStats[name].revenue += (e.total_amount || 0);
      }
    });

    // Top products dynamically ordered
    const sortedByViews = Object.entries(productStats).sort((a, b) => b[1].views - a[1].views);
    const sortedByCarts = Object.entries(productStats).sort((a, b) => b[1].carts - a[1].carts);
    const sortedByWishlist = Object.entries(productStats).sort((a, b) => b[1].wishlists - a[1].wishlists);

    const mostViewedProduct = sortedByViews[0] 
      ? { name: sortedByViews[0][0], count: sortedByViews[0][1].views } 
      : { name: isTechMart ? 'Pro Gaming Laptop RTX 4080' : 'Wireless Noise-Canceling Headphones', count: 0 };

    const mostAddedToCart = sortedByCarts[0] && sortedByCarts[0][1].carts > 0
      ? { name: sortedByCarts[0][0], count: sortedByCarts[0][1].carts }
      : { name: isTechMart ? 'Wireless Ergonomic Gaming Mouse' : 'Ergonomic Wooden Study Desk', count: 0 };

    // Search queries aggregation
    const searchStats: Record<string, { count: number; noResultsCount: number }> = {};
    searches.forEach((e) => {
      if (!e.search_query) return;
      const q = e.search_query.toLowerCase().trim();
      if (!searchStats[q]) searchStats[q] = { count: 0, noResultsCount: 0 };
      searchStats[q].count += 1;
      if (e.results_count === 0) searchStats[q].noResultsCount += 1;
    });

    const topSearches = Object.entries(searchStats)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([query, data]) => ({ query, count: data.count, noResultsCount: data.noResultsCount }));

    if (topSearches.length === 0) {
      topSearches.push(
        { query: 'wireless headphones', count: 0, noResultsCount: 0 }
      );
    }

    // User Journey Funnel with genuine un-floored event metrics
    const funnel = [
      { step: 'Product Views', count: productViews.length, conversion: '100%' },
      { 
        step: 'Add to Cart', 
        count: addToCarts.length, 
        conversion: productViews.length > 0 ? `${Math.round((addToCarts.length / productViews.length) * 100)}%` : '0%' 
      },
      { 
        step: 'Checkout Started', 
        count: checkoutCount, 
        conversion: addToCarts.length > 0 ? `${Math.round((checkoutCount / addToCarts.length) * 100)}%` : '0%' 
      },
      { 
        step: 'Order Completed', 
        count: activeOrderCount, 
        conversion: checkoutCount > 0 ? `${Math.round((activeOrderCount / checkoutCount) * 100)}%` : '0%' 
      }
    ];

    // Dynamic Category Breakdown from DB events
    const categoryTotals: Record<string, { revenue: number; count: number }> = {};
    events.forEach((e) => {
      const cat = e.category || 'General';
      if (!categoryTotals[cat]) categoryTotals[cat] = { revenue: 0, count: 0 };
      categoryTotals[cat].count += 1;
      if (e.event_type === 'ORDER_CREATED' && (!e.order_id || !cancelledOrderIds.has(e.order_id))) {
        categoryTotals[cat].revenue += (e.total_amount || 0);
      }
    });

    const categoryColors = ['#A068FF', '#00F0FF', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];
    const totalCatRevenue = Object.values(categoryTotals).reduce((sum, c) => sum + c.revenue, 0);

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, data], idx) => ({
      name,
      revenue: data.revenue,
      count: data.count,
      percentage: totalCatRevenue > 0 ? Math.round((data.revenue / totalCatRevenue) * 100) : Math.round(100 / Math.max(1, Object.keys(categoryTotals).length)),
      color: categoryColors[idx % categoryColors.length]
    }));

    // Dynamic Top Products List
    const topProducts = Object.entries(productStats)
      .sort((a, b) => b[1].revenue - a[1].revenue || b[1].views - a[1].views)
      .slice(0, 5)
      .map(([name, stat], idx) => ({
        rank: idx + 1,
        name,
        categoryOrDept: stat.category,
        unitsSold: stat.purchases,
        revenue: stat.revenue
      }));

    // Dynamic Status Distribution
    const totalOrderAttempts = createdOrders.length;
    const statusDistribution = [
      {
        status: 'Completed / Delivered',
        count: activeOrderCount,
        percentage: totalOrderAttempts > 0 ? Math.round((activeOrderCount / totalOrderAttempts) * 100) : 100,
        color: '#10B981'
      },
      {
        status: 'Cancelled / Refunded',
        count: cancelledOrderCount,
        percentage: totalOrderAttempts > 0 ? Math.round((cancelledOrderCount / totalOrderAttempts) * 100) : 0,
        color: '#EF4444'
      }
    ];

    // Dynamic Daily Trend from events
    const daysMap: Record<string, { revenue: number; count: number }> = {
      Mon: { revenue: 0, count: 0 },
      Tue: { revenue: 0, count: 0 },
      Wed: { revenue: 0, count: 0 },
      Thu: { revenue: 0, count: 0 },
      Fri: { revenue: 0, count: 0 },
      Sat: { revenue: 0, count: 0 },
      Sun: { revenue: 0, count: 0 }
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    activeOrders.forEach((e) => {
      try {
        const d = new Date(e.timestamp);
        const dayName = dayNames[d.getUTCDay()];
        if (daysMap[dayName]) {
          daysMap[dayName].revenue += (e.total_amount || 0);
          daysMap[dayName].count += 1;
        }
      } catch {}
    });

    const revenueTrend = Object.entries(daysMap).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      count: data.count
    }));

    const displayRevenueStr = netRevenue >= 1000 
      ? `₹${(netRevenue / 1000).toFixed(1)}k` 
      : `₹${netRevenue}`;

    const kpis = [
      {
        title: 'TOTAL REVENUE',
        value: displayRevenueStr,
        subtext: `From ${activeOrderCount} completed transactions (net)`,
        iconName: 'IndianRupee'
      },
      {
        title: 'CART ABANDONMENT',
        value: `${abandonmentRate}%`,
        subtext: `${checkoutCount} checkouts initiated`,
        iconName: 'ShoppingCart'
      },
      {
        title: 'MOST VIEWED PRODUCT',
        value: mostViewedProduct.name.split(' ').slice(0, 3).join(' '),
        subtext: `${mostViewedProduct.count} views (${avgDwellSeconds}s avg dwell time)`,
        iconName: 'Award'
      },
      {
        title: 'MOST ADDED TO CART',
        value: mostAddedToCart.name.split(' ').slice(0, 3).join(' '),
        subtext: `${mostAddedToCart.count} cart additions recorded`,
        iconName: 'Layers'
      },
      {
        title: 'CONVERSION RATE',
        value: `${conversionRate}%`,
        subtext: `Visitor sessions to purchase completion`,
        iconName: 'TrendingUp'
      },
      {
        title: 'TOP SEARCH QUERY',
        value: `"${topSearches[0].query}"`,
        subtext: `${topSearches[0].count} total searches`,
        iconName: 'Activity'
      }
    ];

    return {
      source: source || 'ALL SOURCES',
      totalRevenue: displayRevenueStr,
      grossRevenue: `₹${(grossRevenue / 1000).toFixed(1)}k`,
      totalOrdersOrTx: `${activeOrderCount}`,
      cancelledOrders: cancelledOrderCount,
      topProduct: mostViewedProduct.name,
      topCategoryOrDept: categoryBreakdown[0]?.name || (isTechMart ? 'Gaming' : 'Electronics'),
      avgValue: `₹${aov}`,
      topLocationOrStock: 'Main Warehouse',
      abandonmentRate: `${abandonmentRate}%`,
      conversionRate: `${conversionRate}%`,
      avgDwellSeconds,
      kpis,
      funnel,
      cartBehavior: {
        cartAdditions: addToCarts.length,
        cartRemovals: removeFromCarts.length,
        cartViews: cartViews.length,
        checkoutStarts: checkoutCount,
        completedOrders: activeOrderCount,
        abandonmentRate: `${abandonmentRate}%`
      },
      productEngagement: Object.entries(productStats).map(([name, stat]) => ({
        name,
        views: stat.views,
        avgDurationSeconds: stat.durationCount > 0 ? Math.round(stat.totalDuration / stat.durationCount) : avgDwellSeconds,
        cartAdditions: stat.carts,
        purchases: stat.purchases
      })),
      searchInsights: topSearches,
      revenueTrend,
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
        { name: 'General', revenue: netRevenue, count: events.length, percentage: 100, color: '#A068FF' }
      ],
      topProducts,
      statusDistribution
    };
  }
}
