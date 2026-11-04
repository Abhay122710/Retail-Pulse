from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Path
from app.services.anomaly_detection import AnomalyDetectionService
from app.schemas.anomaly_schemas import AnomalyResponse

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])
anomaly_service = AnomalyDetectionService()

# In-memory acknowledgment tracker
ACKNOWLEDGED_SET = set()

@router.get("", response_model=AnomalyResponse)
def get_anomalies(
    source: Optional[str] = Query(default=None),
    metric: Optional[str] = Query(default=None),
    severity: Optional[str] = Query(default=None)
):
    """
    Detects statistical and multi-variate anomalies across revenue, order volume,
    product demand, and cancellation rate.
    """
    try:
        response = anomaly_service.detect_anomalies(
            source=source,
            metric_filter=metric,
            severity_filter=severity
        )

        # Reflect acknowledged status
        for a in response.anomalies:
            if a.anomaly_id in ACKNOWLEDGED_SET:
                a.acknowledged = True

        response.summary.unacknowledged = sum(1 for a in response.anomalies if not a.acknowledged)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

@router.post("/{anomaly_id}/ack")
def acknowledge_anomaly(
    anomaly_id: str = Path(...)
):
    """
    Acknowledges an anomaly alert.
    """
    ACKNOWLEDGED_SET.add(anomaly_id)
    return {
        "status": "success",
        "message": f"Anomaly '{anomaly_id}' successfully acknowledged"
    }
