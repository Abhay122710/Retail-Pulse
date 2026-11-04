import math
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import numpy as np

from app.services.data_loader import DataLoader
from app.services.forecasting import ForecastingService
from app.services.inventory import DEFAULT_CATALOG
from app.schemas.simulation_schemas import (
    SimulationRequest,
    SimulationResponse,
    SimulationMetrics,
    PercentageChanges,
    DailyTrajectoryPoint
)

CATALOG_COSTS = {
    "P101": 1650.0,
    "P102": 800.0,
    "P103": 1400.0,
    "P104": 750.0,
    "P105": 2300.0,
    "P106": 2900.0,
    "P001": 1600.0,
    "TM-PROD-101": 68000.0,
    "TM-PROD-102": 21500.0,
    "TM-PROD-103": 3200.0,
    "TM-PROD-104": 2100.0,
    "TM-PROD-105": 3100.0,
    "TM-PROD-106": 5200.0,
    "TM-LAP-001": 110000.0
}

class SimulationService:
    """
    Python-powered What-If Scenario Business Simulator.
    Simulates demand, revenue, stock depletion, stockout risk, and gross margin
    using statistical forecasting and economic price elasticity.
    """

    def __init__(
        self,
        data_loader: Optional[DataLoader] = None,
        forecasting_service: Optional[ForecastingService] = None
    ):
        self.data_loader = data_loader or DataLoader()
        self.forecasting_service = forecasting_service or ForecastingService(self.data_loader)

    def run_simulation(self, req: SimulationRequest) -> SimulationResponse:
        horizon = min(30, max(1, req.horizon_days))
        warnings: List[str] = []

        if req.horizon_days > 14:
            warnings.append(
                f"Horizon of {req.horizon_days} days exceeds primary 14-day high-confidence model window. Projections exhibit wider variance bounds."
            )

        # 1. Obtain baseline demand forecast
        fc_units = self.forecasting_service.generate_demand_forecast(
            source=req.source,
            product_id=req.product_id,
            horizon_days=horizon,
            target_metric="UNITS"
        )
        warnings.extend(fc_units.warnings)

        # Obtain product info if product-level
        product_item = None
        unit_price = 0.0
        initial_stock = 0
        lead_time = 5
        moq = 20
        unit_cost: Optional[float] = None

        if req.product_id:
            for item in DEFAULT_CATALOG:
                if item["product_id"] == req.product_id:
                    product_item = item
                    unit_price = float(item["unit_price"])
                    initial_stock = int(item["initial_stock"])
                    lead_time = int(item["supplier_lead_time_days"])
                    moq = int(item["min_order_quantity"])
                    unit_cost = CATALOG_COSTS.get(req.product_id)
                    break

        if not product_item:
            # Aggregate or unknown product: estimate unit price from recent events
            df, _ = self.data_loader.get_daily_time_series(req.source)
            tot_rev = float(df["revenue_net"].sum()) if not df.empty else 0.0
            tot_u = float(df["units_sold"].sum()) if not df.empty else 0.0
            unit_price = (tot_rev / tot_u) if tot_u > 0 else 1000.0
            initial_stock = 150
            lead_time = 5
            moq = 50

        # Adjust inventory by inventory_delta_pct
        effective_stock = max(0.0, round(initial_stock * (1.0 + req.inventory_delta_pct / 100.0), 1))
        effective_lead_time = max(1, lead_time + req.lead_time_days_delta)
        effective_moq = req.min_order_quantity_override if req.min_order_quantity_override is not None else moq

        # Calculate Price Elasticity Effect
        # % change in quantity demanded due to price = price_elasticity * price_change_pct
        price_elasticity_effect = (req.price_elasticity * req.price_change_pct) / 100.0
        exogenous_demand_effect = req.demand_change_pct / 100.0

        # Total demand multiplier
        demand_multiplier = max(0.0, 1.0 + price_elasticity_effect + exogenous_demand_effect)
        simulated_unit_price = max(0.0, unit_price * (1.0 + req.price_change_pct / 100.0))

        # 2. Daily trajectory simulation
        trajectory: List[DailyTrajectoryPoint] = []
        curr_stock_sim = float(effective_stock)
        stockout_day_index = -1

        base_total_units = 0.0
        base_total_rev = 0.0
        sim_total_units = 0.0
        sim_total_rev = 0.0

        for i, pt in enumerate(fc_units.forecast_points):
            b_u = max(0.0, float(pt.predicted_demand))
            b_rev = max(0.0, b_u * unit_price)

            s_u = max(0.0, round(b_u * demand_multiplier, 1))
            s_rev = max(0.0, round(s_u * simulated_unit_price, 2))

            base_total_units += b_u
            base_total_rev += b_rev
            sim_total_units += s_u
            sim_total_rev += s_rev

            curr_stock_sim = max(0.0, round(curr_stock_sim - s_u, 1))
            if curr_stock_sim == 0.0 and stockout_day_index == -1:
                stockout_day_index = i + 1

            trajectory.append(
                DailyTrajectoryPoint(
                    date=pt.date,
                    baseline_units=round(b_u, 1),
                    simulated_units=round(s_u, 1),
                    baseline_revenue=round(b_rev, 2),
                    simulated_revenue=round(s_rev, 2),
                    projected_stock_level=curr_stock_sim
                )
            )

        # Stockout Risk Evaluation
        sim_risk: str = "LOW"
        if stockout_day_index > 0:
            if stockout_day_index <= effective_lead_time:
                sim_risk = "CRITICAL"
            elif stockout_day_index <= horizon:
                sim_risk = "HIGH"
            else:
                sim_risk = "MEDIUM"
        elif curr_stock_sim < (sim_total_units / max(1, horizon)) * effective_lead_time:
            sim_risk = "HIGH"

        base_risk: str = "LOW"
        if initial_stock <= (base_total_units / max(1, horizon)) * lead_time:
            base_risk = "HIGH"

        # Gross Profit calculations (strictly if wholesale cost is known)
        cost_available = unit_cost is not None
        base_profit = None
        base_margin = None
        sim_profit = None
        sim_margin = None
        profit_pct_change = None
        profit_explanation = ""

        if cost_available:
            base_cogs = base_total_units * unit_cost
            base_profit = round(base_total_rev - base_cogs, 2)
            base_margin = round((base_profit / base_total_rev * 100.0), 1) if base_total_rev > 0 else 0.0

            sim_cogs = sim_total_units * unit_cost
            sim_profit = round(sim_total_rev - sim_cogs, 2)
            sim_margin = round((sim_profit / sim_total_rev * 100.0), 1) if sim_total_rev > 0 else 0.0

            if base_profit != 0:
                profit_pct_change = round(((sim_profit - base_profit) / abs(base_profit)) * 100.0, 1)
            profit_explanation = f"Calculated using verified wholesale unit cost of ₹{unit_cost:.2f}."
        else:
            profit_explanation = "Profitability impact unavailable: wholesale product unit cost is not defined in the catalog."

        # Percentage Changes
        rev_pct_change = round(((sim_total_rev - base_total_rev) / base_total_rev * 100.0), 1) if base_total_rev > 0 else 0.0
        units_pct_change = round(((sim_total_units - base_total_units) / base_total_units * 100.0), 1) if base_total_units > 0 else 0.0
        stock_req_pct_change = round(((sim_total_units - base_total_units) / max(1.0, base_total_units) * 100.0), 1)

        scenario_id = f"SCEN-{int(datetime.utcnow().timestamp())}-{np.random.randint(100, 999)}"

        return SimulationResponse(
            scenario_id=scenario_id,
            source=req.source or "ALL SOURCES",
            product_id=req.product_id,
            product_name=product_item["product_name"] if product_item else "All Catalog Products (Aggregate)",
            horizon_days=horizon,
            assumptions={
                "price_change_percentage": req.price_change_pct,
                "demand_change_percentage": req.demand_change_pct,
                "price_elasticity": req.price_elasticity,
                "inventory_adjustment_percentage": req.inventory_delta_pct,
                "lead_time_days_delta": req.lead_time_days_delta,
                "effective_lead_time_days": effective_lead_time,
                "min_order_quantity": effective_moq,
                "baseline_unit_price": round(unit_price, 2),
                "simulated_unit_price": round(simulated_unit_price, 2)
            },
            baseline_metrics=SimulationMetrics(
                total_units=round(base_total_units, 1),
                total_revenue=round(base_total_rev, 2),
                average_unit_price=round(unit_price, 2),
                stockout_risk_level=base_risk,
                stockout_days=0,
                stock_required=round(base_total_units, 1),
                gross_profit=base_profit,
                gross_margin_pct=base_margin
            ),
            simulated_metrics=SimulationMetrics(
                total_units=round(sim_total_units, 1),
                total_revenue=round(sim_total_rev, 2),
                average_unit_price=round(simulated_unit_price, 2),
                stockout_risk_level=sim_risk,
                stockout_days=max(0, horizon - stockout_day_index + 1) if stockout_day_index > 0 else 0,
                stock_required=round(sim_total_units, 1),
                gross_profit=sim_profit,
                gross_margin_pct=sim_margin
            ),
            percentage_changes=PercentageChanges(
                revenue_pct_change=rev_pct_change,
                units_pct_change=units_pct_change,
                stock_requirement_pct_change=stock_req_pct_change,
                profit_pct_change=profit_pct_change
            ),
            daily_trajectory=trajectory,
            inventory_impact={
                "initial_available_stock": effective_stock,
                "projected_closing_stock": curr_stock_sim,
                "stockout_projected": stockout_day_index > 0,
                "days_until_stockout": stockout_day_index if stockout_day_index > 0 else None,
                "recommended_reorder_qty": max(effective_moq, round(sim_total_units - effective_stock)) if curr_stock_sim < (sim_total_units / horizon) * effective_lead_time else 0,
                "stockout_risk": sim_risk
            },
            profitability_impact={
                "cost_available": cost_available,
                "wholesale_unit_cost": unit_cost,
                "baseline_profit": base_profit,
                "simulated_profit": sim_profit,
                "profit_delta": round(sim_profit - base_profit, 2) if (sim_profit is not None and base_profit is not None) else None,
                "explanation": profit_explanation
            },
            warnings=warnings,
            disclaimer="Hypothetical business simulation based on price elasticity and time-series projection. Does not guarantee real-world market outcomes.",
            created_at=datetime.utcnow().isoformat() + "Z"
        )
