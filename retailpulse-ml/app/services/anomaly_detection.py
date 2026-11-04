from datetime import datetime
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from app.services.data_loader import DataLoader
from app.schemas.anomaly_schemas import (
    AnomalyMetric,
    AnomalyRecord,
    AnomalySummary,
    AnomalyResponse,
    ExpectedRange
)

class AnomalyDetectionService:
    """
    Python-based Statistical & ML Anomaly Detection Engine.
    Uses 7-day rolling baselines, Z-scores, percentage deviations,
    and Scikit-learn Isolation Forest for multi-feature outliers.
    """

    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()

    def detect_anomalies(
        self,
        source: Optional[str] = None,
        metric_filter: Optional[str] = None,
        severity_filter: Optional[str] = None
    ) -> AnomalyResponse:
        df, meta = self.data_loader.get_daily_time_series(source)
        src_label = source or "ALL SOURCES"

        if df.empty or len(df) < 4:
            return AnomalyResponse(
                anomalies=[],
                summary=AnomalySummary(
                    total=0,
                    critical=0,
                    warning=0,
                    info=0,
                    unacknowledged=0
                )
            )

        anomalies: List[AnomalyRecord] = []
        metrics: List[AnomalyMetric] = [
            "DAILY_REVENUE",
            "ORDER_VOLUME",
            "PRODUCT_DEMAND",
            "CANCELLATION_RATE"
        ]

        # 1. Univariate Statistical Rolling Window Scan
        for m in metrics:
            if metric_filter and m != metric_filter:
                continue
            m_anomalies = self._evaluate_metric(df, m, src_label)
            anomalies.extend(m_anomalies)

        # 2. Multi-Dimensional Isolation Forest Outlier Scan (if >= 10 points)
        if len(df) >= 10 and not metric_filter:
            iso_anomalies = self._run_isolation_forest(df, src_label)
            # Avoid duplicate day alerts
            existing_dates = {a.observation_date for a in anomalies}
            for iso in iso_anomalies:
                if iso.observation_date not in existing_dates:
                    anomalies.append(iso)

        # Apply severity filter if requested
        if severity_filter:
            anomalies = [a for a in anomalies if a.severity.lower() == severity_filter.lower()]

        # Sort descending by date, then severity rank
        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        anomalies.sort(key=lambda a: (a.observation_date, -severity_order.get(a.severity, 2)), reverse=True)

        summary = AnomalySummary(
            total=len(anomalies),
            critical=sum(1 for a in anomalies if a.severity == "CRITICAL"),
            warning=sum(1 for a in anomalies if a.severity == "WARNING"),
            info=sum(1 for a in anomalies if a.severity == "INFO"),
            unacknowledged=sum(1 for a in anomalies if not a.acknowledged)
        )

        return AnomalyResponse(
            anomalies=anomalies,
            summary=summary
        )

    def _evaluate_metric(
        self,
        df: pd.DataFrame,
        metric: AnomalyMetric,
        source: str
    ) -> List[AnomalyRecord]:
        anomalies: List[AnomalyRecord] = []
        window_size = 7
        now_iso = datetime.utcnow().isoformat() + "Z"

        # Calculate metric series
        if metric == "DAILY_REVENUE":
            series = df["revenue_net"].values
            metric_label = "Daily Net Revenue (₹)"
        elif metric == "ORDER_VOLUME":
            series = df["order_count"].values
            metric_label = "Daily Order Volume"
        elif metric == "PRODUCT_DEMAND":
            series = df["units_sold"].values
            metric_label = "Product Demand (Units)"
        elif metric == "CANCELLATION_RATE":
            total_orders = df["order_count"] + df["cancelled_orders"]
            series = np.where(total_orders > 0, (df["cancelled_orders"] / total_orders) * 100.0, 0.0)
            metric_label = "Cancellation Rate (%)"
        else:
            return []

        dates = df["date"].tolist()

        for i in range(3, len(series)):
            target_date = dates[i]
            observed = float(series[i])
            history = series[max(0, i - window_size) : i]

            # If all historical and current are 0, normal inactivity
            if observed == 0.0 and np.all(history == 0.0):
                continue

            mean = float(np.mean(history))
            std_dev = float(np.std(history, ddof=1)) if len(history) > 1 else 0.0

            z_score = None
            is_anomaly = False
            severity = "INFO"
            direction = "SPIKE" if observed >= mean else "DROP"
            deviation_pct = 0.0
            detection_method = "ROLLING_ZSCORE"

            if mean > 0:
                deviation_pct = round(((observed - mean) / mean) * 100.0, 1)
            elif observed > 0:
                deviation_pct = 100.0

            if std_dev > 0:
                z_score = round((observed - mean) / std_dev, 2)
                abs_z = abs(z_score)

                if abs_z >= 3.0:
                    is_anomaly = True
                    severity = "CRITICAL"
                elif abs_z >= 2.0:
                    is_anomaly = True
                    severity = "WARNING"
                elif abs_z >= 1.75 and abs(deviation_pct) >= 50.0:
                    is_anomaly = True
                    severity = "INFO"
            else:
                detection_method = "PERCENTAGE_DEVIATION"
                if mean == 0.0 and observed > 0:
                    if metric == "DAILY_REVENUE" and observed >= 5000:
                        is_anomaly = True
                        severity = "CRITICAL" if observed >= 20000 else "WARNING"
                    elif metric == "ORDER_VOLUME" and observed >= 3:
                        is_anomaly = True
                        severity = "CRITICAL" if observed >= 10 else "WARNING"
                    elif metric == "PRODUCT_DEMAND" and observed >= 5:
                        is_anomaly = True
                        severity = "CRITICAL" if observed >= 15 else "WARNING"
                elif mean > 0:
                    if abs(deviation_pct) >= 150:
                        is_anomaly = True
                        severity = "CRITICAL"
                    elif abs(deviation_pct) >= 75:
                        is_anomaly = True
                        severity = "WARNING"

            if is_anomaly:
                lower_expected = max(0.0, round(mean - 2.0 * std_dev, 1))
                upper_expected = round(mean + 2.0 * std_dev, 1)
                clean_src = source.replace(" ", "_")
                anomaly_id = f"ANOM-PY-{metric}-{clean_src}-{target_date}"

                sign = "+" if deviation_pct >= 0 else ""
                explanation = (
                    f"Unusual {direction.lower()} in {metric_label}: observed {round(observed, 1)} vs "
                    f"7-day rolling expected baseline of {round(mean, 1)} ({sign}{deviation_pct}%). "
                    f"Rolling standard deviation: {round(std_dev, 1)}."
                )

                anomalies.append(
                    AnomalyRecord(
                        anomaly_id=anomaly_id,
                        source=source,
                        metric=metric,
                        observation_date=target_date,
                        observed_value=round(observed, 1),
                        expected_baseline=round(mean, 1),
                        expected_range=ExpectedRange(lower=lower_expected, upper=upper_expected),
                        deviation_percentage=deviation_pct,
                        z_score=z_score,
                        severity=severity,
                        direction=direction,
                        detection_method=detection_method,
                        explanation=explanation,
                        acknowledged=False,
                        created_at=now_iso
                    )
                )

        return anomalies

    def _run_isolation_forest(self, df: pd.DataFrame, source: str) -> List[AnomalyRecord]:
        """
        Fits Scikit-learn Isolation Forest on multi-variate business metrics
        (revenue, order volume, units sold) to capture complex multi-dimensional outliers.
        """
        features = df[["revenue_net", "order_count", "units_sold"]].values
        now_iso = datetime.utcnow().isoformat() + "Z"

        if len(features) < 10:
            return []

        # Fit Isolation Forest with contamination=0.1
        iso = IsolationForest(contamination=0.1, random_state=42)
        preds = iso.fit_predict(features)
        scores = iso.decision_function(features)

        anomalies = []
        for i, (pred, score) in enumerate(zip(preds, scores)):
            if pred == -1 and i >= 3:  # Outlier detected
                d = df.iloc[i]["date"]
                rev = float(df.iloc[i]["revenue_net"])
                orders = int(df.iloc[i]["order_count"])
                units = int(df.iloc[i]["units_sold"])

                anomalies.append(
                    AnomalyRecord(
                        anomaly_id=f"ANOM-PY-ISOFOREST-{source.replace(' ', '_')}-{d}",
                        source=source,
                        metric="DAILY_REVENUE",
                        observation_date=d,
                        observed_value=rev,
                        expected_baseline=round(float(df["revenue_net"].mean()), 1),
                        expected_range=ExpectedRange(
                            lower=max(0.0, round(float(df["revenue_net"].mean() - df["revenue_net"].std()), 1)),
                            upper=round(float(df["revenue_net"].mean() + df["revenue_net"].std()), 1)
                        ),
                        deviation_percentage=round(score * 100.0, 1),
                        z_score=None,
                        severity="WARNING",
                        direction="SPIKE" if rev >= df["revenue_net"].mean() else "DROP",
                        detection_method="ISOLATION_FOREST",
                        explanation=(
                            f"Multi-variate anomaly detected via Isolation Forest (score: {round(score, 3)}). "
                            f"Combination of revenue ₹{rev}, {orders} orders, and {units} units is statistically aberrant."
                        ),
                        acknowledged=False,
                        created_at=now_iso
                    )
                )
        return anomalies
