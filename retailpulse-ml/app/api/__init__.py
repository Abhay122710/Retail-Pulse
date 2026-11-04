from fastapi import APIRouter
from app.api.forecasts import router as forecasts_router
from app.api.inventory import router as inventory_router
from app.api.anomalies import router as anomalies_router
from app.api.simulation import router as simulation_router

api_router = APIRouter(prefix="/api/predictive")
api_router.include_router(forecasts_router)
api_router.include_router(inventory_router)
api_router.include_router(anomalies_router)
api_router.include_router(simulation_router)
