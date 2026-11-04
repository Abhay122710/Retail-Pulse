from fastapi import APIRouter, HTTPException
from app.schemas.simulation_schemas import SimulationRequest, SimulationResponse
from app.services.simulation import SimulationService

router = APIRouter(prefix="/simulation", tags=["What-If Business Simulator"])
simulation_service = SimulationService()

@router.post("", response_model=SimulationResponse)
def run_scenario_simulation(payload: SimulationRequest):
    """
    Executes a what-if scenario simulation evaluating price elasticity, demand shifts,
    inventory depletion, stockout risk, and gross profit impact.
    """
    try:
        return simulation_service.run_simulation(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
