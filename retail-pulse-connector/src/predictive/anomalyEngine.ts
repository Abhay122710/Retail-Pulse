import { db } from '../models/database.js';
import { TimeSeriesService } from './timeSeriesService.js';
import { AnomalyMetric, AnomalyRecord, DailyTimeSeriesPoint } from './types.js';

export class AnomalyEngine {
  /**
   * Scans historical daily time series and identifies statistical anomalies
   * using a 7-day rolling baseline, Z-score, and percentage deviations.
   */
  public static detectAnomalies(source?: string): AnomalyRecord[] {
    const isAll = !source || source === 'ALL SOURCES' || source === 'All';
    const seriesResult = TimeSeriesService.getDailyTimeSeries(source);
    const points = seriesResult.points;

    if (points.length < 4) {
      // Not enough observations to compute a statistically defensible rolling baseline
      return [];
    }

    const anomalies: AnomalyRecord[] = [];
    const metrics: AnomalyMetric[] = [
      'DAILY_REVENUE',
      'ORDER_VOLUME',
      'PRODUCT_DEMAND',
      'CANCELLATION_RATE'
    ];

    for (const metric of metrics) {
      const metricAnomalies = this.evaluateMetricSeries(
        points,
        metric,
        isAll ? 'ALL SOURCES' : source!
      );
      anomalies.push(...metricAnomalies);
    }

    // Sort descending by date, then severity
    const severityRank = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return anomalies.sort((a, b) => {
      const dateDiff = b.observation_date.localeCompare(a.observation_date);
      if (dateDiff !== 0) return dateDiff;
      return severityRank[a.severity] - severityRank[b.severity];
    });
  }

  /**
   * Evaluates a single metric across the time series with a rolling window (min 3, default 7 days).
   */
  private static evaluateMetricSeries(
    points: DailyTimeSeriesPoint[],
    metric: AnomalyMetric,
    source: string
  ): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = [];
    const windowSize = 7;

    for (let i = 3; i < points.length; i++) {
      const targetPoint = points[i];
      const historyPoints = points.slice(Math.max(0, i - windowSize), i);

      // Extract numeric values for the metric
      const historyValues = historyPoints.map((p) => this.extractMetricValue(p, metric));
      const observed = this.extractMetricValue(targetPoint, metric);

      // Skip evaluation if both observed and all historical are zero (normal inactivity)
      if (observed === 0 && historyValues.every((v) => v === 0)) {
        continue;
      }

      const mean = historyValues.reduce((a, b) => a + b, 0) / historyValues.length;
      const variance =
        historyValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
        Math.max(1, historyValues.length - 1);
      const stdDev = Math.sqrt(variance);

      // Calculate deviation and z-score
      let zScore: number | null = null;
      let isAnomaly = false;
      let severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';
      let direction: 'SPIKE' | 'DROP' = observed >= mean ? 'SPIKE' : 'DROP';
      let deviationPct = 0;
      let detectionMethod: 'ROLLING_ZSCORE' | 'PERCENTAGE_DEVIATION' = 'ROLLING_ZSCORE';

      if (mean > 0) {
        deviationPct = Math.round(((observed - mean) / mean) * 100);
      } else if (observed > 0) {
        deviationPct = 100; // Jump from 0
      }

      if (stdDev > 0) {
        zScore = Math.round(((observed - mean) / stdDev) * 100) / 100;
        const absZ = Math.abs(zScore);

        if (absZ >= 3.0) {
          isAnomaly = true;
          severity = 'CRITICAL';
        } else if (absZ >= 2.0) {
          isAnomaly = true;
          severity = 'WARNING';
        } else if (absZ >= 1.75 && Math.abs(deviationPct) >= 50) {
          isAnomaly = true;
          severity = 'INFO';
        }
      } else {
        // Zero standard deviation in historical window: use percentage threshold
        detectionMethod = 'PERCENTAGE_DEVIATION';
        if (mean === 0 && observed > 0) {
          // Surge from baseline zero
          if (metric === 'DAILY_REVENUE' && observed >= 5000) {
            isAnomaly = true;
            severity = observed >= 20000 ? 'CRITICAL' : 'WARNING';
          } else if (metric === 'ORDER_VOLUME' && observed >= 3) {
            isAnomaly = true;
            severity = observed >= 10 ? 'CRITICAL' : 'WARNING';
          } else if (metric === 'PRODUCT_DEMAND' && observed >= 5) {
            isAnomaly = true;
            severity = observed >= 15 ? 'CRITICAL' : 'WARNING';
          }
        } else if (mean > 0) {
          if (Math.abs(deviationPct) >= 150) {
            isAnomaly = true;
            severity = 'CRITICAL';
          } else if (Math.abs(deviationPct) >= 75) {
            isAnomaly = true;
            severity = 'WARNING';
          }
        }
      }

      if (isAnomaly) {
        const lowerExpected = Math.max(0, Math.round((mean - 2 * stdDev) * 10) / 10);
        const upperExpected = Math.round((mean + 2 * stdDev) * 10) / 10;
        const anomalyId = `ANOM-${metric}-${source.replace(/[^A-Za-z0-9]/g, '_')}-${targetPoint.date}`;

        const metricLabel = this.formatMetricName(metric);
        let explanation = '';

        if (direction === 'SPIKE') {
          explanation = `Unusual spike in ${metricLabel}: observed ${observed} vs 7-day expected baseline of ${Math.round(mean * 10) / 10} (+${deviationPct}%). Standard deviation: ${Math.round(stdDev * 10) / 10}.`;
        } else {
          explanation = `Unusual drop in ${metricLabel}: observed ${observed} vs 7-day expected baseline of ${Math.round(mean * 10) / 10} (${deviationPct}%). Standard deviation: ${Math.round(stdDev * 10) / 10}.`;
        }

        anomalies.push({
          anomaly_id: anomalyId,
          source,
          metric,
          observation_date: targetPoint.date,
          observed_value: observed,
          expected_baseline: Math.round(mean * 10) / 10,
          expected_range: { lower: lowerExpected, upper: upperExpected },
          deviation_percentage: deviationPct,
          z_score: zScore,
          severity,
          direction,
          detection_method: detectionMethod,
          explanation,
          acknowledged: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return anomalies;
  }

  private static extractMetricValue(point: DailyTimeSeriesPoint, metric: AnomalyMetric): number {
    switch (metric) {
      case 'DAILY_REVENUE':
        return point.revenue_net;
      case 'ORDER_VOLUME':
        return point.order_count;
      case 'PRODUCT_DEMAND':
        return point.units_sold;
      case 'CANCELLATION_RATE':
        return point.order_count + point.cancelled_orders > 0
          ? Math.round(
              (point.cancelled_orders / (point.order_count + point.cancelled_orders)) * 100
            )
          : 0;
      case 'ABANDONMENT_RATE':
        return point.checkout_starts > 0
          ? Math.max(
              0,
              Math.round(((point.checkout_starts - point.order_count) / point.checkout_starts) * 100)
            )
          : 0;
      default:
        return 0;
    }
  }

  private static formatMetricName(metric: AnomalyMetric): string {
    switch (metric) {
      case 'DAILY_REVENUE':
        return 'Daily Net Revenue';
      case 'ORDER_VOLUME':
        return 'Daily Order Volume';
      case 'PRODUCT_DEMAND':
        return 'Product Demand (Units)';
      case 'CANCELLATION_RATE':
        return 'Cancellation Rate (%)';
      case 'ABANDONMENT_RATE':
        return 'Checkout Abandonment Rate (%)';
    }
  }
}
