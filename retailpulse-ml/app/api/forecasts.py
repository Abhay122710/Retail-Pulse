from typing import Optional, Literal
from fastapi import APIRouter, Query, HTTPException
from app.services.forecasting import ForecastingService
from app.schemas.forecast_schemas import ForecastResponse, ForecastRequest, ModelEvaluation

router = APIRouter(prefix="/forecasts", tags=["Demand Forecasting"])
forecasting_service = ForecastingService()

@router.get("", response_model=ForecastResponse)
def get_demand_forecast(
    source: Optional[str] = Query(default="ALL SOURCES"),
    productId: Optional[str] = Query(default=None),
    horizonDays: Optional[int] = Query(default=7, ge=1, le=30),
    targetMetric: Optional[Literal["UNITS", "REVENUE"]] = Query(default="UNITS")
):
    """
    Generates or retrieves demand forecast with chronological train/test evaluation.
    """
    try:
        return forecasting_service.generate_demand_forecast(
            source=source,
            product_id=productId,
            horizon_days=horizonDays,
            target_metric=targetMetric
        )
    except Exception as e:
        from app.config import settings
        err_msg = str(e) if settings.ENV != "production" else "Internal error during forecast computation."
        raise HTTPException(status_code=500, detail=f"Forecasting error: {err_msg}")

@router.post("/generate", response_model=ForecastResponse)
def generate_forecast_post(payload: ForecastRequest):
    """
    Explicitly triggers model training and projection for the requested parameters.
    """
    try:
        return forecasting_service.generate_demand_forecast(
            source=payload.source,
            product_id=payload.product_id,
            horizon_days=payload.horizon_days or 7,
            target_metric=payload.target_metric or "UNITS"
        )
    except Exception as e:
        from app.config import settings
        err_msg = str(e) if settings.ENV != "production" else "Internal error during forecast computation."
        raise HTTPException(status_code=500, detail=f"Forecasting error: {err_msg}")

@router.get("/evaluation")
def get_model_evaluation(
    source: Optional[str] = Query(default="ALL SOURCES"),
    productId: Optional[str] = Query(default=None)
):
    """
    Retrieves model evaluation metrics (MAE, WAPE, baseline comparison) on held-out test data.
    """
    try:
        fc = forecasting_service.generate_demand_forecast(
            source=source,
            product_id=productId,
            horizon_days=7
        )
        return {
            "model_name": fc.model_name,
            "model_version": fc.model_version,
            "status": fc.status,
            "warnings": fc.warnings,
            "evaluation": fc.evaluation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")
