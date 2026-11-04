import { db } from '../models/database.js';
import { ForecastingEngine } from './forecastingEngine.js';
import { TimeSeriesService } from './timeSeriesService.js';
import { InventoryItemInfo, InventoryRecommendation } from './types.js';

interface SeedCatalogItem {
  product_id: string;
  product_name: string;
  source: string;
  category: string;
  unit_price: number;
  initial_stock: number;
  supplier_lead_time_days: number;
  min_order_quantity: number;
  target_service_level: number;
}

const DEFAULT_CATALOG: SeedCatalogItem[] = [
  // ShopPulse Products
  {
    product_id: 'P101',
    product_name: 'SoundPulse Pro Wireless Headphones',
    source: 'ShopPulse',
    category: 'Electronics',
    unit_price: 2549,
    initial_stock: 14,
    supplier_lead_time_days: 5,
    min_order_quantity: 20,
    target_service_level: 0.95
  },
  {
    product_id: 'P102',
    product_name: 'BoomBox X Portable Bluetooth Speaker',
    source: 'ShopPulse',
    category: 'Electronics',
    unit_price: 1199,
    initial_stock: 45,
    supplier_lead_time_days: 4,
    min_order_quantity: 15,
    target_service_level: 0.95
  },
  {
    product_id: 'P103',
    product_name: 'FitPulse Smart Watch v2',
    source: 'ShopPulse',
    category: 'Electronics',
    unit_price: 2449,
    initial_stock: 8,
    supplier_lead_time_days: 6,
    min_order_quantity: 25,
    target_service_level: 0.95
  },
  {
    product_id: 'P104',
    product_name: 'Precision Ergonomic Gaming Mouse',
    source: 'ShopPulse',
    category: 'Computer Accessories',
    unit_price: 1169,
    initial_stock: 50,
    supplier_lead_time_days: 3,
    min_order_quantity: 10,
    target_service_level: 0.95
  },
  {
    product_id: 'P105',
    product_name: 'Ultra-Slim Mechanical Gaming Keyboard',
    source: 'ShopPulse',
    category: 'Computer Accessories',
    unit_price: 3399,
    initial_stock: 4, // Intentionally low to test reorder triggering
    supplier_lead_time_days: 5,
    min_order_quantity: 15,
    target_service_level: 0.95
  },
  {
    product_id: 'P106',
    product_name: 'CrystalVision 4K USB-C Webcam',
    source: 'ShopPulse',
    category: 'Computer Accessories',
    unit_price: 3999,
    initial_stock: 0, // Out of stock to test critical alert
    supplier_lead_time_days: 7,
    min_order_quantity: 20,
    target_service_level: 0.95
  },

  // TechMart Products
  {
    product_id: 'TM-PROD-101',
    product_name: 'NovaBook Pro 16 Laptop',
    source: 'TechMart',
    category: 'Computers',
    unit_price: 84999,
    initial_stock: 6,
    supplier_lead_time_days: 8,
    min_order_quantity: 10,
    target_service_level: 0.95
  },
  {
    product_id: 'TM-PROD-102',
    product_name: 'HyperView 27" 4K Gaming Monitor',
    source: 'TechMart',
    category: 'Displays',
    unit_price: 26999,
    initial_stock: 18,
    supplier_lead_time_days: 6,
    min_order_quantity: 10,
    target_service_level: 0.95
  },
  {
    product_id: 'TM-PROD-103',
    product_name: 'PulseBeat ANC Wireless Headphones',
    source: 'TechMart',
    category: 'Audio',
    unit_price: 5499,
    initial_stock: 35,
    supplier_lead_time_days: 4,
    min_order_quantity: 20,
    target_service_level: 0.95
  },
  {
    product_id: 'TM-PROD-104',
    product_name: 'Aerox Ultra Wireless Gaming Mouse',
    source: 'TechMart',
    category: 'Peripherals',
    unit_price: 3499,
    initial_stock: 5,
    supplier_lead_time_days: 3,
    min_order_quantity: 15,
    target_service_level: 0.95
  },
  {
    product_id: 'TM-PROD-105',
    product_name: 'Apex Mechanical RGB Keyboard',
    source: 'TechMart',
    category: 'Peripherals',
    unit_price: 4999,
    initial_stock: 22,
    supplier_lead_time_days: 5,
    min_order_quantity: 15,
    target_service_level: 0.95
  },
  {
    product_id: 'TM-PROD-106',
    product_name: 'StreamCam 4K Pro Broadcast Webcam',
    source: 'TechMart',
    category: 'Accessories',
    unit_price: 7999,
    initial_stock: 2,
    supplier_lead_time_days: 5,
    min_order_quantity: 10,
    target_service_level: 0.95
  }
];

export class InventoryEngine {
  /**
   * Retrieves registered inventory items.
   * Dynamically nets out historical sales recorded in canonical events from initial stock.
   */
  public static getInventoryItems(source?: string): InventoryItemInfo[] {
    const isAll = !source || source === 'ALL SOURCES' || source === 'All';
    const items = isAll
      ? DEFAULT_CATALOG
      : DEFAULT_CATALOG.filter((i) => i.source.toLowerCase() === source.toLowerCase());

    const events = db.getEvents();
    const cancelledOrderIds = new Set(
      events.filter((e) => e.event_type === 'ORDER_CANCELLED').map((e) => e.order_id).filter((id): id is string => Boolean(id))
    );

    // Sum total sold units per product
    const soldMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.event_type === 'ORDER_CREATED' && (!e.order_id || !cancelledOrderIds.has(e.order_id))) {
        const pId = e.product_id;
        if (pId) {
          const qty = e.quantity || 1;
          soldMap.set(pId, (soldMap.get(pId) || 0) + qty);
        }
      }
    });

    return items.map((item) => {
      const sold = soldMap.get(item.product_id) || 0;
      const currentStock = Math.max(0, item.initial_stock - sold);

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        source: item.source,
        category: item.category,
        unit_price: item.unit_price,
        current_stock: currentStock,
        stock_data_source: 'DEMO_ESTIMATED',
        supplier_lead_time_days: item.supplier_lead_time_days,
        min_order_quantity: item.min_order_quantity,
        target_service_level: item.target_service_level
      };
    });
  }

  /**
   * Generates deterministic reorder recommendations and stockout risk estimates.
   * ROP = Expected Demand during Lead Time (LTD) + Safety Stock (SS)
   * SS = Z * sqrt(LeadTime) * stdDev(DailyDemand)
   */
  public static generateRecommendations(source?: string): InventoryRecommendation[] {
    const items = this.getInventoryItems(source);
    const recommendations: InventoryRecommendation[] = [];

    const now = new Date().toISOString();

    for (const item of items) {
      // 1. Fetch 7-day demand forecast for this product
      const forecast = ForecastingEngine.generateForecast({
        source: item.source,
        productId: item.product_id,
        horizonDays: 7,
        targetMetric: 'UNITS'
      });

      const totalForecast7D = forecast.forecast_points.reduce(
        (sum, pt) => sum + pt.predicted_demand,
        0
      );
      const dailyForecastRate = Math.round((totalForecast7D / 7) * 100) / 100;

      // 2. Calculate daily demand standard deviation from historical series
      const productSeries = TimeSeriesService.getProductDailyTimeSeries(
        item.product_id,
        item.source
      );
      const dailySales = productSeries.points.map((p) => p.units);
      const stdDevDaily = this.calculateStdDev(dailySales);

      // 3. Expected Demand during Lead Time (LTD)
      const leadTime = item.supplier_lead_time_days;
      const expectedDemandLTD = Math.round(dailyForecastRate * leadTime * 10) / 10;

      // 4. Safety Stock (SS) = Z * sqrt(LTD) * sigma_d
      // For 95% service level, Z = 1.65
      const zScore = 1.65;
      const effectiveSigma = Math.max(0.5, stdDevDaily);
      const safetyStock = Math.ceil(zScore * Math.sqrt(leadTime) * effectiveSigma);

      // 5. Reorder Point (ROP) = LTD + SS
      const reorderPoint = Math.ceil(expectedDemandLTD + safetyStock);

      // 6. Target Stock Policy and Suggested Reorder Quantity (ROQ)
      // Target stock covers LTD + SS + 7 days cycle review period
      const cycleReviewDemand = dailyForecastRate * 7;
      const targetStockLevel = Math.ceil(expectedDemandLTD + safetyStock + cycleReviewDemand);

      let suggestedReorderQty = 0;
      if (item.current_stock <= reorderPoint) {
        const shortfall = targetStockLevel - item.current_stock;
        suggestedReorderQty = Math.max(item.min_order_quantity, shortfall);
      }

      // 7. Stockout Risk Assessment
      let stockoutRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      let stockoutRiskPercentage: number;
      let urgency: 'IMMEDIATE' | 'UPCOMING' | 'ADEQUATE';

      if (item.current_stock === 0) {
        stockoutRiskLevel = 'CRITICAL';
        stockoutRiskPercentage = 100;
        urgency = 'IMMEDIATE';
      } else if (item.current_stock < expectedDemandLTD) {
        stockoutRiskLevel = 'HIGH';
        stockoutRiskPercentage = Math.min(
          95,
          Math.round((1 - item.current_stock / Math.max(1, expectedDemandLTD)) * 100)
        );
        urgency = 'IMMEDIATE';
      } else if (item.current_stock <= reorderPoint) {
        stockoutRiskLevel = 'MEDIUM';
        stockoutRiskPercentage = Math.min(
          65,
          Math.round((1 - item.current_stock / Math.max(1, reorderPoint)) * 100)
        );
        urgency = 'UPCOMING';
      } else {
        stockoutRiskLevel = 'LOW';
        stockoutRiskPercentage = Math.max(
          5,
          Math.round((reorderPoint / Math.max(1, item.current_stock)) * 20)
        );
        urgency = 'ADEQUATE';
      }

      // 8. Explanation and Assumptions
      let explanation = '';
      if (item.current_stock === 0) {
        explanation = `Stockout detected! Current inventory is 0 units. Expected demand during supplier lead time (${leadTime} days) is ${expectedDemandLTD} units. Immediate reorder of ${suggestedReorderQty} units required.`;
      } else if (item.current_stock <= reorderPoint) {
        const daysRemaining =
          dailyForecastRate > 0
            ? Math.round((item.current_stock / dailyForecastRate) * 10) / 10
            : 99;
        explanation = `Inventory position (${item.current_stock} units) has breached the reorder point (${reorderPoint} units). At current daily forecast (${dailyForecastRate} units/day), remaining stock will last ~${daysRemaining} days (supplier lead time: ${leadTime} days). Recommend reordering ${suggestedReorderQty} units.`;
      } else {
        explanation = `Inventory position is healthy (${item.current_stock} units vs ROP ${reorderPoint} units). Adequate stock for current forecast. No reorder needed.`;
      }

      const assumptions = [
        `Inventory stock is DEMO_ESTIMATED baseline dynamically adjusted by canonical sales events (not live warehouse ERP).`,
        `Supplier lead time: ${leadTime} calendar days based on standard supplier catalog agreement.`,
        `Target service level: ${item.target_service_level * 100}% (standard normal Z-factor = ${zScore}).`,
        `Safety stock calculation: ceil(${zScore} * sqrt(${leadTime}) * ${Math.round(effectiveSigma * 10) / 10}) = ${safetyStock} units.`,
        `Review period cycle stock: 7 days (${Math.round(cycleReviewDemand * 10) / 10} units). Minimum order quantity: ${item.min_order_quantity} units.`
      ];

      recommendations.push({
        recommendation_id: `REC-${item.source.substring(0, 2).toUpperCase()}-${item.product_id}-${Date.now()}`,
        product_id: item.product_id,
        product_name: item.product_name,
        source: item.source,
        category: item.category,
        current_stock: item.current_stock,
        stock_data_source: 'DEMO_ESTIMATED',
        supplier_lead_time_days: leadTime,
        daily_forecast_rate: dailyForecastRate,
        expected_demand_lead_time: expectedDemandLTD,
        safety_stock: safetyStock,
        reorder_point: reorderPoint,
        suggested_reorder_qty: suggestedReorderQty,
        stockout_risk_level: stockoutRiskLevel,
        stockout_risk_percentage: stockoutRiskPercentage,
        urgency,
        explanation,
        assumptions,
        created_at: now
      });
    }

    // Sort by urgency and risk percentage descending
    const urgencyOrder = { IMMEDIATE: 0, UPCOMING: 1, ADEQUATE: 2 };
    return recommendations.sort((a, b) => {
      const uDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (uDiff !== 0) return uDiff;
      return b.stockout_risk_percentage - a.stockout_risk_percentage;
    });
  }

  private static calculateStdDev(values: number[]): number {
    if (values.length <= 1) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }
}
