import pytest
from app.services.data_loader import DataLoader
from app.services.forecasting import ForecastingService
from app.services.simulation import SimulationService
from app.schemas.simulation_schemas import SimulationRequest

def test_baseline_simulation_zero_deltas(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = SimulationService(data_loader=loader)

    req = SimulationRequest(
        source="ShopPulse",
        product_id="P101",
        price_change_pct=0.0,
        demand_change_pct=0.0,
        inventory_delta_pct=0.0,
        horizon_days=7
    )
    res = service.run_simulation(req)

    assert res.scenario_id.startswith("SCEN-")
    assert res.horizon_days == 7
    assert len(res.daily_trajectory) == 7

    # With zero deltas, simulated metrics match baseline
    assert res.percentage_changes.revenue_pct_change == 0.0
    assert res.percentage_changes.units_pct_change == 0.0
    assert res.simulated_metrics.total_units == res.baseline_metrics.total_units
    assert res.profitability_impact["cost_available"] is True
    assert res.profitability_impact["wholesale_unit_cost"] == 1650.0

def test_price_increase_reduces_demand_via_elasticity(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = SimulationService(data_loader=loader)

    req = SimulationRequest(
        source="ShopPulse",
        product_id="P101",
        price_change_pct=20.0, # +20% price
        price_elasticity=-1.5, # elasticity = -1.5 -> quantity should drop 30%
        demand_change_pct=0.0,
        horizon_days=7
    )
    res = service.run_simulation(req)

    # Simulated units should be strictly lower than baseline
    assert res.simulated_metrics.total_units < res.baseline_metrics.total_units
    assert res.percentage_changes.units_pct_change < 0.0
    assert res.assumptions["simulated_unit_price"] > res.assumptions["baseline_unit_price"]

def test_inventory_depletion_and_stockout_risk(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = SimulationService(data_loader=loader)

    # Cut inventory by 90% and increase demand by 50%
    req = SimulationRequest(
        source="ShopPulse",
        product_id="P101",
        inventory_delta_pct=-90.0,
        demand_change_pct=50.0,
        horizon_days=7
    )
    res = service.run_simulation(req)

    # Stockout should be projected and risk elevated
    assert res.simulated_metrics.stockout_risk_level in ("CRITICAL", "HIGH")
    assert res.inventory_impact["stockout_risk"] in ("CRITICAL", "HIGH")
    assert res.disclaimer is not None

def test_simulation_cost_unavailable_handling(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = SimulationService(data_loader=loader)

    # Request simulation for product not in cost catalog
    req = SimulationRequest(
        source="ShopPulse",
        product_id="UNKNOWN_CUSTOM_SKU_999",
        price_change_pct=10.0,
        demand_change_pct=5.0,
        horizon_days=7
    )
    res = service.run_simulation(req)

    assert res.profitability_impact["cost_available"] is False
    assert res.profitability_impact["baseline_profit"] is None
    assert res.profitability_impact["simulated_profit"] is None
    assert "unavailable" in res.profitability_impact["explanation"].lower()
