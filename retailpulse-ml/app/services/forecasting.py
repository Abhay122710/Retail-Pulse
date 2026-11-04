from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
import numpy as np
import pandas as pd

from app.services.data_loader import DataLoader
from app.schemas.forecast_schemas import (
    ForecastPoint,
    ForecastResponse,
    ModelEvaluation,
    ActualVsPredicted,
    TrainPeriod,
    TestPeriod
)

class ForecastingService:
    """
    Python-based Demand Forecasting Engine.
    Implements Holt-Linear & Holt-Winters exponential smoothing,
    evaluated against a Seasonal-Naive baseline using chronological splits.
    """

    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()

    def generate_demand_forecast(
        self,
        source: Optional[str] = "ALL SOURCES",
        product_id: Optional[str] = None,
        horizon_days: int = 7,
        target_metric: str = "UNITS"
    ) -> ForecastResponse:
        horizon = 30 if horizon_days == 30 else 7
        metric = "REVENUE" if target_metric == "REVENUE" else "UNITS"
        src_label = source or "ALL SOURCES"

        # Load time series
        product_name = None
        if product_id:
            df, meta = self.data_loader.get_product_daily_series(product_id, source)
            product_name = meta.get("product_name")
            dates = df["date"].tolist() if not df.empty else []
            values = df["revenue"].tolist() if metric == "REVENUE" else df["units"].tolist()
        else:
            df, meta = self.data_loader.get_daily_time_series(source)
            dates = df["date"].tolist() if not df.empty else []
            values = df["revenue_net"].tolist() if metric == "REVENUE" else df["units_sold"].tolist()

        n = len(values)
        warnings: List[str] = []
        now_iso = datetime.utcnow().isoformat() + "Z"

        # Case 1: Insufficient historical observations (< 5 days)
        if n < 5:
            warnings.append(
                f"Insufficient historical observation period ({n} days available; minimum 5 required for statistical forecasting)."
            )
            naive_val = float(np.mean(values)) if n > 0 else 0.0
            naive_val = max(0.0, round(naive_val, 1))

            last_date_str = dates[-1] if dates else datetime.utcnow().strftime("%Y-%m-%d")
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d")

            forecast_points = []
            for i in range(1, horizon + 1):
                f_date = (last_date + timedelta(days=i)).strftime("%Y-%m-%d")
                forecast_points.append(
                    ForecastPoint(
                        date=f_date,
                        predicted_demand=naive_val,
                        lower_bound=0.0,
                        upper_bound=round(naive_val * 2.0, 1)
                    )
                )

            return ForecastResponse(
                forecast_id=f"FCST-PY-{src_label.replace(' ', '_')}-{product_id or 'AGG'}-{horizon}D-{int(datetime.utcnow().timestamp())}",
                source=src_label,
                product_id=product_id,
                product_name=product_name,
                target_metric=metric,
                horizon_days=horizon,
                forecast_points=forecast_points,
                model_name="Seasonal-Naive",
                model_version="3.0.0-py",
                evaluation=None,
                status="INSUFFICIENT_DATA",
                warnings=warnings,
                created_at=now_iso
            )

        status: str = "SUFFICIENT_DATA"
        if n < 14:
            status = "LIMITED_DATA"
            warnings.append(
                f"Limited historical window ({n} days). Using Holt's Linear trend model with 7-day naive baseline."
            )
        if horizon == 30 and n < 30:
            warnings.append(
                f"30-day forecast requested with only {n} historical days. Variance bounds widen significantly past day 14."
            )

        # Chronological train/test split: held-out test data (min 2, max 7, at most 25% of dataset)
        test_days = max(2, min(7, int(n * 0.25)))
        train_vals = values[:-test_days]
        test_vals = values[-test_days:]
        train_dates = dates[:-test_days]
        test_dates = dates[-test_days:]

        # Evaluate model against held-out test data
        evaluation = self._evaluate_model(train_vals, test_vals, train_dates, test_dates)

        # Fit model on ALL available data to generate future projection
        forecasts, lower_bounds, upper_bounds, model_name = self._fit_and_project(values, horizon)

        last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
        forecast_points: List[ForecastPoint] = []
        for i in range(horizon):
            f_date = (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            forecast_points.append(
                ForecastPoint(
                    date=f_date,
                    predicted_demand=max(0.0, round(float(forecasts[i]), 1)),
                    lower_bound=max(0.0, round(float(lower_bounds[i]), 1)),
                    upper_bound=max(0.0, round(float(upper_bounds[i]), 1))
                )
            )

        return ForecastResponse(
            forecast_id=f"FCST-PY-{src_label.replace(' ', '_')}-{product_id or 'AGG'}-{horizon}D-{int(datetime.utcnow().timestamp())}",
            source=src_label,
            product_id=product_id,
            product_name=product_name,
            target_metric=metric,
            horizon_days=horizon,
            forecast_points=forecast_points,
            model_name=model_name,
            model_version="3.0.0-py",
            evaluation=evaluation,
            status=status,
            warnings=warnings,
            created_at=now_iso
        )

    def _fit_and_project(
        self,
        series: List[float],
        horizon: int
    ) -> Tuple[List[float], List[float], List[float], str]:
        """
        Fits Holt-Linear or Holt-Winters depending on seasonality length.
        Ensures non-negative predictions.
        """
        n = len(series)
        season_length = 7
        use_hw = n >= season_length * 2

        alpha = 0.3
        beta = 0.1
        gamma = 0.15

        if use_hw:
            # Additive Holt-Winters with 7-day seasonality
            num_seasons = n // season_length
            season_averages = [
                float(np.mean(series[s * season_length : (s + 1) * season_length]))
                for s in range(num_seasons)
            ]

            season_factors = [0.0] * season_length
            for i in range(season_length):
                diffs = [
                    series[s * season_length + i] - season_averages[s]
                    for s in range(num_seasons)
                ]
                season_factors[i] = float(np.mean(diffs))

            level = series[0] - season_factors[0]
            trend = (series[season_length] - series[0]) / season_length
            residuals = []
            curr_seasons = list(season_factors)

            for t in range(n):
                s_idx = t % season_length
                prev_level = level
                prev_trend = trend
                y = series[t]

                s_factor = curr_seasons[s_idx]
                level = alpha * (y - s_factor) + (1 - alpha) * (prev_level + prev_trend)
                trend = beta * (level - prev_level) + (1 - beta) * prev_trend
                curr_seasons[s_idx] = gamma * (y - level) + (1 - gamma) * s_factor

                fitted = prev_level + prev_trend + s_factor
                residuals.append(y - fitted)

            var = float(np.var(residuals, ddof=1)) if len(residuals) > 1 else 1.0
            std_err = np.sqrt(max(0.1, var))

            forecasts = []
            lower_bounds = []
            upper_bounds = []

            for h in range(1, horizon + 1):
                s_idx = (n + h - 1) % season_length
                point_fc = max(0.0, level + h * trend + curr_seasons[s_idx])
                margin = 1.96 * std_err * np.sqrt(1.0 + (h - 1) * 0.1)

                forecasts.append(point_fc)
                lower_bounds.append(max(0.0, point_fc - margin))
                upper_bounds.append(point_fc + margin)

            return forecasts, lower_bounds, upper_bounds, "Holt-Winters"
        else:
            # Holt's Linear Exponential Smoothing
            level = series[0]
            trend = series[1] - series[0] if n > 1 else 0.0
            residuals = []

            for t in range(n):
                y = series[t]
                prev_level = level
                prev_trend = trend

                level = alpha * y + (1 - alpha) * (prev_level + prev_trend)
                trend = beta * (level - prev_level) + (1 - beta) * prev_trend

                fitted = prev_level + prev_trend
                residuals.append(y - fitted)

            var = float(np.var(residuals, ddof=1)) if len(residuals) > 1 else 1.0
            std_err = np.sqrt(max(0.1, var))

            forecasts = []
            lower_bounds = []
            upper_bounds = []

            for h in range(1, horizon + 1):
                point_fc = max(0.0, level + h * trend)
                margin = 1.96 * std_err * np.sqrt(1.0 + (h - 1) * 0.15)

                forecasts.append(point_fc)
                lower_bounds.append(max(0.0, point_fc - margin))
                upper_bounds.append(point_fc + margin)

            return forecasts, lower_bounds, upper_bounds, "Holt-Linear"

    def _evaluate_model(
        self,
        train: List[float],
        test: List[float],
        train_dates: List[str],
        test_dates: List[str]
    ) -> ModelEvaluation:
        """
        Chronologically evaluates the model against a Seasonal-Naive baseline.
        """
        horizon = len(test)
        model_fc, _, _, model_name = self._fit_and_project(train, horizon)

        # Seasonal-Naive baseline
        baseline_fc = []
        for h in range(horizon):
            if len(train) >= 7:
                lag_idx = len(train) - 7 + (h % 7)
                baseline_fc.append(max(0.0, train[lag_idx]))
            else:
                baseline_fc.append(max(0.0, train[-1] if train else 0.0))

        # Challenger model (Simple Moving Average / Naive Drift)
        challenger_fc = []
        challenger_name = "7-Day Moving Average" if len(train) >= 7 else "Naive Drift"
        if len(train) >= 7:
            ma_val = float(np.mean(train[-7:]))
            challenger_fc = [max(0.0, ma_val)] * horizon
        else:
            drift = (train[-1] - train[0]) / max(1, len(train) - 1) if len(train) > 1 else 0.0
            challenger_fc = [max(0.0, train[-1] + (h + 1) * drift) for h in range(horizon)]

        actual_vs_pred = []
        abs_errors = []
        sq_errors = []
        baseline_abs_errors = []
        baseline_sq_errors = []
        challenger_abs_errors = []
        challenger_sq_errors = []

        for i in range(horizon):
            act = float(test[i])
            pred = max(0.0, round(float(model_fc[i]), 1))
            base = max(0.0, round(float(baseline_fc[i]), 1))
            chall = max(0.0, round(float(challenger_fc[i]), 1))
            err = round(abs(act - pred), 1)

            abs_errors.append(abs(act - pred))
            sq_errors.append((act - pred) ** 2)
            baseline_abs_errors.append(abs(act - base))
            baseline_sq_errors.append((act - base) ** 2)
            challenger_abs_errors.append(abs(act - chall))
            challenger_sq_errors.append((act - chall) ** 2)

            actual_vs_pred.append(
                ActualVsPredicted(
                    date=test_dates[i],
                    actual=act,
                    predicted=pred,
                    baseline=base,
                    error=err
                )
            )

        mae = float(np.mean(abs_errors)) if abs_errors else 0.0
        rmse = float(np.sqrt(np.mean(sq_errors))) if sq_errors else 0.0
        baseline_mae = float(np.mean(baseline_abs_errors)) if baseline_abs_errors else 0.0
        baseline_rmse = float(np.sqrt(np.mean(baseline_sq_errors))) if baseline_sq_errors else 0.0
        challenger_mae = float(np.mean(challenger_abs_errors)) if challenger_abs_errors else 0.0
        challenger_rmse = float(np.sqrt(np.mean(challenger_sq_errors))) if challenger_sq_errors else 0.0

        total_actual = float(sum(test))
        wape = (float(sum(abs_errors)) / total_actual * 100.0) if total_actual > 0 else 0.0
        baseline_wape = (float(sum(baseline_abs_errors)) / total_actual * 100.0) if total_actual > 0 else 0.0
        challenger_wape = (float(sum(challenger_abs_errors)) / total_actual * 100.0) if total_actual > 0 else 0.0

        improvement = (
            ((baseline_mae - mae) / baseline_mae * 100.0) if baseline_mae > 0 else 0.0
        )
        challenger_improvement = (
            ((baseline_mae - challenger_mae) / baseline_mae * 100.0) if baseline_mae > 0 else 0.0
        )

        model_comparison = [
            {
                "model_name": f"{model_name} (Additive)",
                "role": "Champion (Deployed)",
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "wape": round(wape, 1),
                "improvement_vs_baseline_pct": round(improvement, 1),
                "status": "ACTIVE"
            },
            {
                "model_name": challenger_name,
                "role": "Challenger",
                "mae": round(challenger_mae, 2),
                "rmse": round(challenger_rmse, 2),
                "wape": round(challenger_wape, 1),
                "improvement_vs_baseline_pct": round(challenger_improvement, 1),
                "status": "CANDIDATE"
            },
            {
                "model_name": "Seasonal-Naive (Lag-7)",
                "role": "Baseline Benchmark",
                "mae": round(baseline_mae, 2),
                "rmse": round(baseline_rmse, 2),
                "wape": round(baseline_wape, 1),
                "improvement_vs_baseline_pct": 0.0,
                "status": "BENCHMARK"
            }
        ]

        return ModelEvaluation(
            mae=round(mae, 2),
            wape=round(wape, 1),
            rmse=round(rmse, 2),
            baseline_mae=round(baseline_mae, 2),
            baseline_rmse=round(baseline_rmse, 2),
            improvement_percentage=round(improvement, 1),
            train_period=TrainPeriod(
                start_date=train_dates[0] if train_dates else "",
                end_date=train_dates[-1] if train_dates else "",
                sample_size_days=len(train)
            ),
            test_period=TestPeriod(
                start_date=test_dates[0] if test_dates else "",
                end_date=test_dates[-1] if test_dates else "",
                test_days=len(test)
            ),
            actual_vs_predicted_test=actual_vs_pred,
            model_comparison=model_comparison
        )
