import { TimeSeriesService } from './timeSeriesService.js';
import {
  ForecastPoint,
  ForecastRecord,
  ModelEvaluation
} from './types.js';

export class ForecastingEngine {
  /**
   * Generates a 7-day or 30-day demand forecast using historical validated data.
   * Compares Holt-Linear / Holt-Winters against a Seasonal-Naive baseline.
   */
  public static generateForecast(params: {
    source?: string;
    productId?: string | null;
    horizonDays?: number;
    targetMetric?: 'UNITS' | 'REVENUE';
  }): ForecastRecord {
    const horizon = params.horizonDays === 30 ? 30 : 7;
    const metric = params.targetMetric || 'UNITS';
    const source = params.source || 'ALL SOURCES';
    const productId = params.productId || null;

    let timeSeriesValues: number[] = [];
    let dates: string[] = [];
    let productName: string | null = null;

    if (productId) {
      const productSeries = TimeSeriesService.getProductDailyTimeSeries(productId, source);
      productName = productSeries.product_name;
      dates = productSeries.points.map((p) => p.date);
      timeSeriesValues = productSeries.points.map((p) =>
        metric === 'UNITS' ? p.units : p.revenue
      );
    } else {
      const series = TimeSeriesService.getDailyTimeSeries(source);
      dates = series.points.map((p) => p.date);
      timeSeriesValues = series.points.map((p) =>
        metric === 'UNITS' ? p.units_sold : p.revenue_net
      );
    }

    const n = timeSeriesValues.length;
    const warnings: string[] = [];

    // Case 1: Empty or Insufficient Data (< 5 days)
    if (n < 5) {
      warnings.push(
        `Insufficient historical observation period (${n} days available, minimum 5 required for reliable statistical forecasting).`
      );

      const lastDate = dates[dates.length - 1] || new Date().toISOString().slice(0, 10);
      const naiveValue = n > 0 ? Math.max(0, Math.round(timeSeriesValues.reduce((a, b) => a + b, 0) / n)) : 0;

      const points: ForecastPoint[] = [];
      for (let i = 1; i <= horizon; i++) {
        points.push({
          date: this.addDays(lastDate, i),
          predicted_demand: naiveValue,
          lower_bound: 0,
          upper_bound: naiveValue * 2
        });
      }

      return {
        forecast_id: `FCST-${source.replace(/\s+/g, '_')}-${productId || 'AGG'}-${horizon}D-${Date.now()}`,
        source,
        product_id: productId,
        product_name: productName,
        target_metric: metric,
        horizon_days: horizon,
        forecast_points: points,
        model_name: 'Seasonal-Naive',
        model_version: '1.0.0-fallback',
        evaluation: null,
        status: 'INSUFFICIENT_DATA',
        warnings,
        created_at: new Date().toISOString()
      };
    }

    // Determine status
    let status: 'SUFFICIENT_DATA' | 'LIMITED_DATA' | 'INSUFFICIENT_DATA' = 'SUFFICIENT_DATA';
    if (n < 14) {
      status = 'LIMITED_DATA';
      warnings.push(
        `Limited history (${n} days). Seasonality cycles are constrained; using Holt's Linear trend model with 7-day naive baseline.`
      );
    }
    if (horizon === 30 && n < 30) {
      warnings.push(
        `30-day forecast requested with only ${n} historical days. Variance confidence intervals widen significantly after day 14.`
      );
    }

    // Chronological train/test split: reserve last K days (min 3, max 7, at most 30% of data)
    const testDays = Math.max(2, Math.min(7, Math.floor(n * 0.25)));
    const trainValues = timeSeriesValues.slice(0, n - testDays);
    const testValues = timeSeriesValues.slice(n - testDays);
    const testDates = dates.slice(n - testDays);
    const trainDates = dates.slice(0, n - testDays);

    // Evaluate models on held-out test data
    const evaluation = this.evaluateModels(trainValues, testValues, testDates, trainDates);

    // Train final model on ALL historical data to forecast future horizon
    const { forecasts, lowerBounds, upperBounds, modelName } = this.fitAndForecast(
      timeSeriesValues,
      horizon
    );

    const lastObservedDate = dates[dates.length - 1];
    const forecastPoints: ForecastPoint[] = [];

    for (let i = 0; i < horizon; i++) {
      forecastPoints.push({
        date: this.addDays(lastObservedDate, i + 1),
        predicted_demand: Math.max(0, Math.round(forecasts[i] * 10) / 10),
        lower_bound: Math.max(0, Math.round(lowerBounds[i] * 10) / 10),
        upper_bound: Math.max(0, Math.round(upperBounds[i] * 10) / 10)
      });
    }

    return {
      forecast_id: `FCST-${source.replace(/\s+/g, '_')}-${productId || 'AGG'}-${horizon}D-${Date.now()}`,
      source,
      product_id: productId,
      product_name: productName,
      target_metric: metric,
      horizon_days: horizon,
      forecast_points: forecastPoints,
      model_name: modelName,
      model_version: '2.1.0',
      evaluation,
      status,
      warnings,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Fits Holt's Linear Exponential Smoothing (with additive 7-day seasonality if data >= 14 days)
   * Parameters: alpha=0.3 (level), beta=0.1 (trend)
   */
  private static fitAndForecast(
    series: number[],
    horizon: number
  ): {
    forecasts: number[];
    lowerBounds: number[];
    upperBounds: number[];
    modelName: 'Holt-Linear' | 'Holt-Winters';
  } {
    const n = series.length;
    const alpha = 0.3;
    const beta = 0.1;
    const gamma = 0.15;
    const seasonLength = 7;

    const useHoltWinters = n >= seasonLength * 2;
    const modelName = useHoltWinters ? 'Holt-Winters' : 'Holt-Linear';

    if (useHoltWinters) {
      // Additive Holt-Winters
      // 1. Initial season factors
      const seasonFactors: number[] = new Array(seasonLength).fill(0);
      const numSeasons = Math.floor(n / seasonLength);
      const seasonAverages: number[] = [];

      for (let s = 0; s < numSeasons; s++) {
        const chunk = series.slice(s * seasonLength, (s + 1) * seasonLength);
        const avg = chunk.reduce((a, b) => a + b, 0) / seasonLength;
        seasonAverages.push(avg);
      }

      for (let i = 0; i < seasonLength; i++) {
        let sum = 0;
        for (let s = 0; s < numSeasons; s++) {
          sum += series[s * seasonLength + i] - seasonAverages[s];
        }
        seasonFactors[i] = sum / numSeasons;
      }

      // Initial level and trend
      let level = series[0] - seasonFactors[0];
      let trend = (series[seasonLength] - series[0]) / seasonLength;
      const residuals: number[] = [];

      const currentSeasons = [...seasonFactors];

      for (let t = 0; t < n; t++) {
        const sIdx = t % seasonLength;
        const prevLevel = level;
        const prevTrend = trend;
        const y = series[t];

        const sFactor = currentSeasons[sIdx];
        level = alpha * (y - sFactor) + (1 - alpha) * (prevLevel + prevTrend);
        trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
        currentSeasons[sIdx] = gamma * (y - level) + (1 - gamma) * sFactor;

        const fitted = prevLevel + prevTrend + sFactor;
        residuals.push(y - fitted);
      }

      // Calculate residual standard deviation for prediction intervals
      const variance = residuals.reduce((a, r) => a + r * r, 0) / Math.max(1, residuals.length - 1);
      const stdErr = Math.sqrt(variance) || 1.0;

      // Project into future
      const forecasts: number[] = [];
      const lowerBounds: number[] = [];
      const upperBounds: number[] = [];

      for (let h = 1; h <= horizon; h++) {
        const sIdx = (n + h - 1) % seasonLength;
        const pointForecast = Math.max(0, level + h * trend + currentSeasons[sIdx]);
        // Interval expands with forecast horizon sqrt(h)
        const margin = 1.96 * stdErr * Math.sqrt(1 + (h - 1) * 0.1);

        forecasts.push(pointForecast);
        lowerBounds.push(Math.max(0, pointForecast - margin));
        upperBounds.push(pointForecast + margin);
      }

      return { forecasts, lowerBounds, upperBounds, modelName };
    } else {
      // Holt's Linear Exponential Smoothing
      let level = series[0];
      let trend = series.length > 1 ? series[1] - series[0] : 0;
      const residuals: number[] = [];

      for (let t = 0; t < n; t++) {
        const y = series[t];
        const prevLevel = level;
        const prevTrend = trend;

        level = alpha * y + (1 - alpha) * (prevLevel + prevTrend);
        trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;

        const fitted = prevLevel + prevTrend;
        residuals.push(y - fitted);
      }

      const variance = residuals.reduce((a, r) => a + r * r, 0) / Math.max(1, residuals.length - 1);
      const stdErr = Math.sqrt(variance) || 1.0;

      const forecasts: number[] = [];
      const lowerBounds: number[] = [];
      const upperBounds: number[] = [];

      for (let h = 1; h <= horizon; h++) {
        const pointForecast = Math.max(0, level + h * trend);
        const margin = 1.96 * stdErr * Math.sqrt(1 + (h - 1) * 0.15);

        forecasts.push(pointForecast);
        lowerBounds.push(Math.max(0, pointForecast - margin));
        upperBounds.push(pointForecast + margin);
      }

      return { forecasts, lowerBounds, upperBounds, modelName };
    }
  }

  /**
   * Chronological evaluation of Model vs Seasonal-Naive baseline on test data.
   */
  private static evaluateModels(
    train: number[],
    test: number[],
    testDates: string[],
    trainDates: string[]
  ): ModelEvaluation {
    const horizon = test.length;
    const { forecasts: modelForecasts } = this.fitAndForecast(train, horizon);

    // Seasonal-Naive baseline:
    // If train >= 7 days, baseline predicts y(t - 7). If < 7 days, baseline is last known observation.
    const baselineForecasts: number[] = [];
    for (let h = 0; h < horizon; h++) {
      if (train.length >= 7) {
        const lagIdx = train.length - 7 + (h % 7);
        baselineForecasts.push(Math.max(0, train[lagIdx] || train[train.length - 1]));
      } else {
        baselineForecasts.push(Math.max(0, train[train.length - 1] || 0));
      }
    }

    let modelErrorSum = 0;
    let baselineErrorSum = 0;
    let actualSum = 0;

    const actualVsPred: ModelEvaluation['actual_vs_predicted_test'] = [];

    for (let i = 0; i < horizon; i++) {
      const actual = test[i];
      const predicted = Math.max(0, Math.round(modelForecasts[i] * 10) / 10);
      const baseline = Math.max(0, Math.round(baselineForecasts[i] * 10) / 10);
      const error = Math.abs(actual - predicted);

      modelErrorSum += error;
      baselineErrorSum += Math.abs(actual - baseline);
      actualSum += actual;

      actualVsPred.push({
        date: testDates[i],
        actual,
        predicted,
        baseline,
        error: Math.round(error * 10) / 10
      });
    }

    const mae = Math.round((modelErrorSum / horizon) * 100) / 100;
    const baselineMae = Math.round((baselineErrorSum / horizon) * 100) / 100;

    // WAPE = (sum |actual - predicted| / sum actual) * 100%
    const wape = actualSum > 0 ? Math.round((modelErrorSum / actualSum) * 1000) / 10 : 0;

    const improvement =
      baselineMae > 0 ? Math.round(((baselineMae - mae) / baselineMae) * 1000) / 10 : 0;

    return {
      mae,
      wape,
      baseline_mae: baselineMae,
      improvement_percentage: improvement,
      train_period: {
        start_date: trainDates[0] || '',
        end_date: trainDates[trainDates.length - 1] || '',
        sample_size_days: train.length
      },
      test_period: {
        start_date: testDates[0] || '',
        end_date: testDates[testDates.length - 1] || '',
        test_days: test.length
      },
      actual_vs_predicted_test: actualVsPred
    };
  }

  private static addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00.000Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
