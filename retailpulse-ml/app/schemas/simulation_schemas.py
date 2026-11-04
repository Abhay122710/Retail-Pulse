from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    source: Optional[str] = "ALL SOURCES"
    product_id: Optional[str] = None
    price_change_pct: float = Field(default=0.0, ge=-80.0, le=200.0)
    demand_change_pct: float = Field(default=0.0, ge=-80.0, le=300.0)
    price_elasticity: float = Field(default=-1.2, ge=-5.0, le=0.0)
    inventory_delta_pct: float = Field(default=0.0, ge=-90.0, le=500.0)
    lead_time_days_delta: int = Field(default=0, ge=-10, le=30)
    min_order_quantity_override: Optional[int] = Field(default=None, ge=1)
    horizon_days: int = Field(default=7, ge=1, le=30)

class DailyTrajectoryPoint(BaseModel):
    date: str
    baseline_units: float
    simulated_units: float
    baseline_revenue: float
    simulated_revenue: float
    projected_stock_level: float

class SimulationMetrics(BaseModel):
    total_units: float
    total_revenue: float
    average_unit_price: float
    stockout_risk_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    stockout_days: int
    stock_required: float
    gross_profit: Optional[float] = None
    gross_margin_pct: Optional[float] = None

class PercentageChanges(BaseModel):
    revenue_pct_change: float
    units_pct_change: float
    stock_requirement_pct_change: float
    profit_pct_change: Optional[float] = None

class SimulationResponse(BaseModel):
    scenario_id: str
    source: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    horizon_days: int
    assumptions: Dict[str, Any]
    baseline_metrics: SimulationMetrics
    simulated_metrics: SimulationMetrics
    percentage_changes: PercentageChanges
    daily_trajectory: List[DailyTrajectoryPoint]
    inventory_impact: Dict[str, Any]
    profitability_impact: Dict[str, Any]
    warnings: List[str] = []
    disclaimer: str
    created_at: str
