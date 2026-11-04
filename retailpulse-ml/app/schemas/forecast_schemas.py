from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class ForecastPoint(BaseModel):
    date: str
    predicted_demand: float = Field(ge=0.0)
    lower_bound: float = Field(ge=0.0)
    upper_bound: float = Field(ge=0.0)

class ActualVsPredicted(BaseModel):
    date: str
    actual: float
    predicted: float
    baseline: float
    error: float

class TrainPeriod(BaseModel):
    start_date: str
    end_date: str
    sample_size_days: int

class TestPeriod(BaseModel):
    start_date: str
    end_date: str
    test_days: int

class ModelEvaluation(BaseModel):
    mae: float
    wape: float
    rmse: Optional[float] = None
    baseline_mae: float
    baseline_rmse: Optional[float] = None
    improvement_percentage: float
    train_period: TrainPeriod
    test_period: TestPeriod
    actual_vs_predicted_test: List[ActualVsPredicted]
    model_comparison: Optional[List[Dict[str, Any]]] = None

class ForecastResponse(BaseModel):
    forecast_id: str
    source: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    target_metric: Literal["UNITS", "REVENUE"] = "UNITS"
    horizon_days: int
    forecast_points: List[ForecastPoint]
    model_name: Literal["Holt-Linear", "Holt-Winters", "Seasonal-Naive"]
    model_version: str
    evaluation: Optional[ModelEvaluation] = None
    status: Literal["SUFFICIENT_DATA", "LIMITED_DATA", "INSUFFICIENT_DATA"]
    warnings: List[str] = []
    created_at: str

class ForecastRequest(BaseModel):
    source: Optional[str] = "ALL SOURCES"
    product_id: Optional[str] = None
    horizon_days: Optional[int] = 7
    target_metric: Optional[Literal["UNITS", "REVENUE"]] = "UNITS"
