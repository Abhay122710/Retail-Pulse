from typing import List, Optional, Literal, Dict
from pydantic import BaseModel

AnomalyMetric = Literal[
    "DAILY_REVENUE",
    "ORDER_VOLUME",
    "PRODUCT_DEMAND",
    "CANCELLATION_RATE",
    "ABANDONMENT_RATE"
]

class ExpectedRange(BaseModel):
    lower: float
    upper: float

class AnomalyRecord(BaseModel):
    anomaly_id: str
    source: str
    metric: AnomalyMetric
    observation_date: str
    observed_value: float
    expected_baseline: float
    expected_range: ExpectedRange
    deviation_percentage: float
    z_score: Optional[float] = None
    severity: Literal["CRITICAL", "WARNING", "INFO"]
    direction: Literal["SPIKE", "DROP"]
    detection_method: Literal["ROLLING_ZSCORE", "PERCENTAGE_DEVIATION", "ISOLATION_FOREST"]
    explanation: str
    acknowledged: bool = False
    created_at: str

class AnomalySummary(BaseModel):
    total: int
    critical: int
    warning: int
    info: int
    unacknowledged: int

class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyRecord]
    summary: AnomalySummary
