from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.inventory import InventoryService
from app.schemas.inventory_schemas import InventoryResponse

router = APIRouter(prefix="/inventory", tags=["Inventory Optimization"])
inventory_service = InventoryService()

@router.get("", response_model=InventoryResponse)
def get_inventory_recommendations(
    source: Optional[str] = Query(default=None)
):
    """
    Computes transparent Reorder Point (ROP = LTD + SS), Safety Stock (SS),
    Suggested Reorder Quantity (ROQ), and Stockout Risk levels.
    """
    try:
        return inventory_service.generate_recommendations(source=source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inventory calculation error: {str(e)}")
