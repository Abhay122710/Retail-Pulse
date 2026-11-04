import pytest
from app.services.data_loader import DataLoader
from app.services.forecasting import ForecastingService

def test_empty_historical_dataset(empty_db_path):
    loader = DataLoader(data_path=empty_db_path)
    service = ForecastingService(data_loader=loader)

    fc = service.generate_demand_forecast(source="ShopPulse", horizon_days=7)
    assert fc.status == "INSUFFICIENT_DATA"
    assert len(fc.forecast_points) == 7
    assert fc.evaluation is None
    assert any("Insufficient" in w for w in fc.warnings)
    assert all(pt.predicted_demand >= 0.0 for pt in fc.forecast_points)

def test_14d_continuous_forecasting_and_evaluation(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = ForecastingService(data_loader=loader)

    fc = service.generate_demand_forecast(
        source="ShopPulse",
        horizon_days=7,
        target_metric="UNITS"
    )

    assert fc.status == "SUFFICIENT_DATA"
    assert fc.model_name == "Holt-Winters"
    assert fc.evaluation is not None
    assert fc.evaluation.mae >= 0.0
    assert fc.evaluation.wape >= 0.0
    assert fc.evaluation.baseline_mae >= 0.0
    assert fc.evaluation.rmse is not None and fc.evaluation.rmse >= 0.0
    assert fc.evaluation.baseline_rmse is not None and fc.evaluation.baseline_rmse >= 0.0
    assert fc.evaluation.model_comparison is not None
    assert len(fc.evaluation.model_comparison) == 3
    assert fc.evaluation.test_period.test_days > 0
    assert len(fc.evaluation.actual_vs_predicted_test) == fc.evaluation.test_period.test_days

def test_predictions_are_non_negative_and_bounded(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = ForecastingService(data_loader=loader)

    fc = service.generate_demand_forecast(source="ShopPulse", horizon_days=7)
    for pt in fc.forecast_points:
        assert pt.predicted_demand >= 0.0, f"Predicted demand {pt.predicted_demand} must be >= 0"
        assert pt.lower_bound >= 0.0, f"Lower bound {pt.lower_bound} must be >= 0"
        assert pt.upper_bound >= pt.predicted_demand, f"Upper bound {pt.upper_bound} must be >= prediction"

def test_30_day_forecast_horizon(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = ForecastingService(data_loader=loader)

    fc = service.generate_demand_forecast(source="ShopPulse", horizon_days=30)
    assert fc.horizon_days == 30
    assert len(fc.forecast_points) == 30
    assert any("30-day forecast requested" in w for w in fc.warnings)

def test_product_level_demand_forecast(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = ForecastingService(data_loader=loader)

    fc = service.generate_demand_forecast(
        source="ShopPulse",
        product_id="P101",
        horizon_days=7
    )
    assert fc.product_id == "P101"
    assert fc.product_name == "SoundPulse Pro Wireless Headphones"
    assert len(fc.forecast_points) == 7
