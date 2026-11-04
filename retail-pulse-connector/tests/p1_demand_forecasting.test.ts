import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/models/database.js';
import { ForecastingEngine } from '../src/predictive/forecastingEngine.js';
import { TimeSeriesService } from '../src/predictive/timeSeriesService.js';
import { CanonicalEvent } from '../src/models/types.js';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_retail_pulse_p1.json');

describe('P1: Demand Forecasting Verification', () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db.loadDatabaseFile(TEST_DB_PATH);
    db.clearAllData();
  });

  after(() => {
    db.loadDatabaseFile(path.resolve(process.cwd(), 'data', 'retail_pulse.json'));
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  });

  it('P1-T1: Empty database returns INSUFFICIENT_DATA with clear warning and zero-bounded points', () => {
    const forecast = ForecastingEngine.generateForecast({
      source: 'ShopPulse',
      horizonDays: 7
    });

    assert.strictEqual(forecast.status, 'INSUFFICIENT_DATA');
    assert.strictEqual(forecast.forecast_points.length, 7);
    assert.ok(forecast.warnings.length > 0, 'Must provide warning about insufficient data');
    assert.ok(
      forecast.forecast_points.every((pt) => pt.predicted_demand >= 0),
      'Predictions must be non-negative'
    );
  });

  it('P1-T2: Insufficient history (< 5 days) flags warning without crashing', () => {
    db.clearAllData();
    const sampleEvents: CanonicalEvent[] = [
      {
        event_id: 'EVT-TEST-1',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: '2026-10-01T10:00:00Z',
        session_id: 'SES-TEST-1',
        user_id: null,
        canonical_user_id: null,
        product_id: 'P101',
        canonical_product_id: null,
        product_name: 'SoundPulse Pro Wireless Headphones',
        category: 'Electronics',
        order_id: 'ORD-101',
        canonical_transaction_id: 'SP-ORD-101',
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 2,
        unit_price: 2500,
        total_amount: 5000,
        cart_value: null,
        item_count: 2,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      },
      {
        event_id: 'EVT-TEST-2',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: '2026-10-02T11:00:00Z',
        session_id: 'SES-TEST-2',
        user_id: null,
        canonical_user_id: null,
        product_id: 'P101',
        canonical_product_id: null,
        product_name: 'SoundPulse Pro Wireless Headphones',
        category: 'Electronics',
        order_id: 'ORD-102',
        canonical_transaction_id: 'SP-ORD-102',
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 1,
        unit_price: 3000,
        total_amount: 3000,
        cart_value: null,
        item_count: 1,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      },
      {
        event_id: 'EVT-TEST-3',
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: '2026-10-03T12:00:00Z',
        session_id: 'SES-TEST-3',
        user_id: null,
        canonical_user_id: null,
        product_id: 'P101',
        canonical_product_id: null,
        product_name: 'SoundPulse Pro Wireless Headphones',
        category: 'Electronics',
        order_id: 'ORD-103',
        canonical_transaction_id: 'SP-ORD-103',
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: 2,
        unit_price: 2250,
        total_amount: 4500,
        cart_value: null,
        item_count: 2,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      }
    ];

    sampleEvents.forEach((e) => db.insertEvent(e));

    const forecast = ForecastingEngine.generateForecast({
      source: 'ShopPulse',
      horizonDays: 7
    });

    assert.strictEqual(forecast.status, 'INSUFFICIENT_DATA');
    assert.ok(forecast.warnings[0].includes('minimum 5 required'));
  });

  it('P1-T3: Continuous time series properly interpolates calendar gaps with true zero-sales days', () => {
    // Current events are on Oct 01, Oct 02, Oct 03. Add jump event on Oct 07
    const jumpEvent: CanonicalEvent = {
      event_id: 'EVT-TEST-4',
      source: 'ShopPulse',
      source_type: 'ecommerce',
      event_type: 'ORDER_CREATED',
      timestamp: '2026-10-07T14:00:00Z',
      session_id: 'SES-TEST-4',
      user_id: null,
      canonical_user_id: null,
      product_id: 'P101',
      canonical_product_id: null,
      product_name: 'SoundPulse Pro Wireless Headphones',
      category: 'Electronics',
      order_id: 'ORD-104',
      canonical_transaction_id: 'SP-ORD-104',
      search_query: null,
      results_count: null,
      view_duration_seconds: null,
      quantity: 4,
      unit_price: 2000,
      total_amount: 8000,
      cart_value: null,
      item_count: 4,
      rating: null,
      payment_method: null,
      payload: '{}',
      created_at: new Date().toISOString()
    };
    db.insertEvent(jumpEvent);

    const series = TimeSeriesService.getDailyTimeSeries('ShopPulse');
    assert.strictEqual(series.startDate, '2026-10-01');
    assert.strictEqual(series.endDate, '2026-10-07');
    assert.strictEqual(series.totalDays, 7); // Oct 1, 2, 3, 4, 5, 6, 7

    const oct4 = series.points.find((p) => p.date === '2026-10-04');
    assert.ok(oct4, 'Oct 04 must exist in continuous timeline');
    assert.strictEqual(oct4.is_interpolated_zero, true);
    assert.strictEqual(oct4.units_sold, 0);
    assert.strictEqual(oct4.revenue_net, 0);
  });

  it('P1-T4: Chronological train/test split evaluates Model vs Baseline with MAE and WAPE', () => {
    // Populate 14 days of realistic sales data (Oct 01 to Oct 14)
    db.clearAllData();
    const dailyQuantities = [3, 4, 2, 5, 6, 8, 7, 4, 5, 3, 6, 7, 9, 8];

    dailyQuantities.forEach((qty, idx) => {
      const dayNum = String(idx + 1).padStart(2, '0');
      db.insertEvent({
        event_id: `EVT-P1-${idx}`,
        source: 'ShopPulse',
        source_type: 'ecommerce',
        event_type: 'ORDER_CREATED',
        timestamp: `2026-10-${dayNum}T10:00:00Z`,
        session_id: `SES-P1-${idx}`,
        user_id: null,
        canonical_user_id: null,
        product_id: 'P101',
        canonical_product_id: null,
        product_name: 'SoundPulse Pro Wireless Headphones',
        category: 'Electronics',
        order_id: `ORD-P1-${idx}`,
        canonical_transaction_id: `SP-ORD-P1-${idx}`,
        search_query: null,
        results_count: null,
        view_duration_seconds: null,
        quantity: qty,
        unit_price: 1500,
        total_amount: qty * 1500,
        cart_value: null,
        item_count: qty,
        rating: null,
        payment_method: null,
        payload: '{}',
        created_at: new Date().toISOString()
      });
    });

    const forecast = ForecastingEngine.generateForecast({
      source: 'ShopPulse',
      horizonDays: 7,
      targetMetric: 'UNITS'
    });

    assert.strictEqual(forecast.status, 'SUFFICIENT_DATA');
    assert.strictEqual(forecast.model_name, 'Holt-Winters');
    assert.ok(forecast.evaluation !== null, 'Model evaluation must be populated');

    const evalReport = forecast.evaluation!;
    assert.ok(evalReport.mae >= 0, 'MAE must be non-negative');
    assert.ok(evalReport.wape >= 0, 'WAPE must be non-negative');
    assert.ok(evalReport.baseline_mae >= 0, 'Baseline MAE must be non-negative');
    assert.ok(evalReport.test_period.test_days > 0, 'Must have evaluated on held-out test days');
    assert.strictEqual(
      evalReport.actual_vs_predicted_test.length,
      evalReport.test_period.test_days
    );
  });

  it('P1-T5: Forecast predictions are non-negative and properly bounded', () => {
    const forecast = ForecastingEngine.generateForecast({
      source: 'ShopPulse',
      horizonDays: 7,
      targetMetric: 'UNITS'
    });

    forecast.forecast_points.forEach((pt) => {
      assert.ok(pt.predicted_demand >= 0, `Predicted demand ${pt.predicted_demand} must be >= 0`);
      assert.ok(pt.lower_bound >= 0, `Lower bound ${pt.lower_bound} must be >= 0`);
      assert.ok(
        pt.upper_bound >= pt.predicted_demand,
        `Upper bound ${pt.upper_bound} must be >= predicted demand ${pt.predicted_demand}`
      );
    });
  });

  it('P1-T6: 30-day forecast horizon generates exactly 30 future calendar points', () => {
    const series = TimeSeriesService.getDailyTimeSeries('ShopPulse');
    const forecast30 = ForecastingEngine.generateForecast({
      source: 'ShopPulse',
      horizonDays: 30,
      targetMetric: 'UNITS'
    });

    assert.strictEqual(forecast30.horizon_days, 30);
    assert.strictEqual(forecast30.forecast_points.length, 30);
    if (series.endDate) {
      assert.ok(
        forecast30.forecast_points[0].date > series.endDate,
        'Forecast must begin strictly after the last observed date'
      );
    }
  });

  it('P1-T7: Product-level demand forecast isolates product sales and honors cancellations', () => {
    // Add a cancelled order for P101 on Oct 14
    db.insertEvent({
      event_id: 'EVT-CANCEL-1',
      source: 'ShopPulse',
      source_type: 'ecommerce',
      event_type: 'ORDER_CANCELLED',
      timestamp: '2026-10-14T12:00:00Z',
      session_id: 'SES-CANCEL-1',
      user_id: null,
      canonical_user_id: null,
      product_id: 'P101',
      canonical_product_id: null,
      product_name: 'SoundPulse Pro Wireless Headphones',
      category: 'Electronics',
      order_id: 'ORD-P1-13', // The last day's order
      canonical_transaction_id: 'SP-ORD-P1-13',
      search_query: null,
      results_count: null,
      view_duration_seconds: null,
      quantity: 8,
      unit_price: 1500,
      total_amount: 12000,
      cart_value: null,
      item_count: 8,
      rating: null,
      payment_method: null,
      payload: '{}',
      created_at: new Date().toISOString()
    });

    const series = TimeSeriesService.getProductDailyTimeSeries('P101', 'ShopPulse');
    const lastDay = series.points.find((p) => p.date === '2026-10-14');
    assert.ok(lastDay);
    // Previously was 8 units, cancelled order removed it so net units sold = 0
    assert.strictEqual(lastDay.units, 0, 'Cancelled order units must be deducted from net units');
  });
});
