from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class InventoryItemInfo(BaseModel):
    product_id: str
    product_name: str
    source: str
    category: str
    unit_price: float
    current_stock: int = Field(ge=0)
    stock_data_source: Literal["DEMO_ESTIMATED", "LIVE_CONNECTOR"] = "DEMO_ESTIMATED"
    supplier_lead_time_days: int = Field(gt=0)
    min_order_quantity: int = Field(gt=0)
    target_service_level: float = Field(default=0.95, gt=0, lt=1)

class InventoryRecommendation(BaseModel):
    recommendation_id: str
    product_id: str
    product_name: str
    source: str
    category: str
    current_stock: int = Field(ge=0)
    stock_data_source: Literal["DEMO_ESTIMATED", "LIVE_CONNECTOR"] = "DEMO_ESTIMATED"
    supplier_lead_time_days: int
    daily_forecast_rate: float
    expected_demand_lead_time: float
    safety_stock: int
    reorder_point: int
    suggested_reorder_qty: int
    stockout_risk_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    stockout_risk_percentage: float
    urgency: Literal["IMMEDIATE", "UPCOMING", "ADEQUATE"]
    explanation: str
    assumptions: List[str]
    created_at: str

class InventoryResponse(BaseModel):
    recommendations: List[InventoryRecommendation]
    inventory_items: List[InventoryItemInfo]
    summary: dict
    timestamp: str
