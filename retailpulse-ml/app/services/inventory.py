import math
from datetime import datetime
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd

from app.services.data_loader import DataLoader
from app.services.forecasting import ForecastingService
from app.schemas.inventory_schemas import (
    InventoryItemInfo,
    InventoryRecommendation,
    InventoryResponse
)

DEFAULT_CATALOG = [
    # ShopPulse Products
    {
        "product_id": "P101",
        "product_name": "SoundPulse Pro Wireless Headphones",
        "source": "ShopPulse",
        "category": "Electronics",
        "unit_price": 2549.0,
        "initial_stock": 14,
        "supplier_lead_time_days": 5,
        "min_order_quantity": 20,
        "target_service_level": 0.95
    },
    {
        "product_id": "P102",
        "product_name": "BoomBox X Portable Bluetooth Speaker",
        "source": "ShopPulse",
        "category": "Electronics",
        "unit_price": 1199.0,
        "initial_stock": 45,
        "supplier_lead_time_days": 4,
        "min_order_quantity": 15,
        "target_service_level": 0.95
    },
    {
        "product_id": "P103",
        "product_name": "FitPulse Smart Watch v2",
        "source": "ShopPulse",
        "category": "Electronics",
        "unit_price": 2449.0,
        "initial_stock": 8,
        "supplier_lead_time_days": 6,
        "min_order_quantity": 25,
        "target_service_level": 0.95
    },
    {
        "product_id": "P104",
        "product_name": "Precision Ergonomic Gaming Mouse",
        "source": "ShopPulse",
        "category": "Computer Accessories",
        "unit_price": 1169.0,
        "initial_stock": 50,
        "supplier_lead_time_days": 3,
        "min_order_quantity": 10,
        "target_service_level": 0.95
    },
    {
        "product_id": "P105",
        "product_name": "Ultra-Slim Mechanical Gaming Keyboard",
        "source": "ShopPulse",
        "category": "Computer Accessories",
        "unit_price": 3399.0,
        "initial_stock": 4,
        "supplier_lead_time_days": 5,
        "min_order_quantity": 15,
        "target_service_level": 0.95
    },
    {
        "product_id": "P106",
        "product_name": "CrystalVision 4K USB-C Webcam",
        "source": "ShopPulse",
        "category": "Computer Accessories",
        "unit_price": 3999.0,
        "initial_stock": 0,
        "supplier_lead_time_days": 7,
        "min_order_quantity": 20,
        "target_service_level": 0.95
    },
    # TechMart Products
    {
        "product_id": "TM-PROD-101",
        "product_name": "NovaBook Pro 16 Laptop",
        "source": "TechMart",
        "category": "Computers",
        "unit_price": 84999.0,
        "initial_stock": 6,
        "supplier_lead_time_days": 8,
        "min_order_quantity": 10,
        "target_service_level": 0.95
    },
    {
        "product_id": "TM-PROD-102",
        "product_name": 'HyperView 27" 4K Gaming Monitor',
        "source": "TechMart",
        "category": "Displays",
        "unit_price": 26999.0,
        "initial_stock": 18,
        "supplier_lead_time_days": 6,
        "min_order_quantity": 10,
        "target_service_level": 0.95
    },
    {
        "product_id": "TM-PROD-103",
        "product_name": "PulseBeat ANC Wireless Headphones",
        "source": "TechMart",
        "category": "Audio",
        "unit_price": 5499.0,
        "initial_stock": 35,
        "supplier_lead_time_days": 4,
        "min_order_quantity": 20,
        "target_service_level": 0.95
    },
    {
        "product_id": "TM-PROD-104",
        "product_name": "Aerox Ultra Wireless Gaming Mouse",
        "source": "TechMart",
        "category": "Peripherals",
        "unit_price": 3499.0,
        "initial_stock": 5,
        "supplier_lead_time_days": 3,
        "min_order_quantity": 15,
        "target_service_level": 0.95
    },
    {
        "product_id": "TM-PROD-105",
        "product_name": "Apex Mechanical RGB Keyboard",
        "source": "TechMart",
        "category": "Peripherals",
        "unit_price": 4999.0,
        "initial_stock": 22,
        "supplier_lead_time_days": 5,
        "min_order_quantity": 15,
        "target_service_level": 0.95
    },
    {
        "product_id": "TM-PROD-106",
        "product_name": "StreamCam 4K Pro Broadcast Webcam",
        "source": "TechMart",
        "category": "Accessories",
        "unit_price": 7999.0,
        "initial_stock": 2,
        "supplier_lead_time_days": 5,
        "min_order_quantity": 10,
        "target_service_level": 0.95
    }
]

class InventoryService:
    """
    Python-based Inventory Recommendation & Risk Engine.
    Implements deterministic Reorder Point (ROP = LTD + SS) with Safety Stock (SS)
    and Target Stock policy (ROQ).
    """

    def __init__(self, data_loader: Optional[DataLoader] = None, forecasting_service: Optional[ForecastingService] = None):
        self.data_loader = data_loader or DataLoader()
        self.forecasting_service = forecasting_service or ForecastingService(self.data_loader)

    def get_inventory_items(self, source: Optional[str] = None) -> List[InventoryItemInfo]:
        """
        Retrieves catalog items with current stock netted from verified sales events.
        """
        catalog = DEFAULT_CATALOG
        if source and source not in ("ALL SOURCES", "All", "all"):
            catalog = [c for c in catalog if c["source"].lower() == source.lower()]

        events = self.data_loader.load_raw_events()
        cancelled_order_ids = {
            e.get("order_id")
            for e in events
            if e.get("event_type") == "ORDER_CANCELLED" and e.get("order_id")
        }

        # Compute units sold per product
        sold_map: Dict[str, int] = {}
        for e in events:
            if e.get("event_type") == "ORDER_CREATED":
                oid = e.get("order_id")
                if not oid or oid not in cancelled_order_ids:
                    pid = e.get("product_id")
                    if pid:
                        qty = int(e.get("quantity") or 1)
                        sold_map[pid] = sold_map.get(pid, 0) + qty

        items = []
        for item in catalog:
            sold = sold_map.get(item["product_id"], 0)
            stock = max(0, item["initial_stock"] - sold)
            items.append(
                InventoryItemInfo(
                    product_id=item["product_id"],
                    product_name=item["product_name"],
                    source=item["source"],
                    category=item["category"],
                    unit_price=item["unit_price"],
                    current_stock=stock,
                    stock_data_source="DEMO_ESTIMATED",
                    supplier_lead_time_days=item["supplier_lead_time_days"],
                    min_order_quantity=item["min_order_quantity"],
                    target_service_level=item["target_service_level"]
                )
            )
        return items

    def generate_recommendations(self, source: Optional[str] = None) -> InventoryResponse:
        """
        Calculates reorder point, safety stock, suggested reorder quantity, and stockout risk.
        """
        items = self.get_inventory_items(source)
        recommendations: List[InventoryRecommendation] = []
        now_iso = datetime.utcnow().isoformat() + "Z"

        for item in items:
            # 1. 7-Day Demand Forecast
            fc_resp = self.forecasting_service.generate_demand_forecast(
                source=item.source,
                product_id=item.product_id,
                horizon_days=7,
                target_metric="UNITS"
            )
            total_7d_forecast = sum(pt.predicted_demand for pt in fc_resp.forecast_points)
            daily_forecast_rate = round(total_7d_forecast / 7.0, 2)

            # 2. Daily demand standard deviation from historical series
            df, _ = self.data_loader.get_product_daily_series(item.product_id, item.source)
            if not df.empty and len(df) > 1:
                std_dev_daily = float(np.std(df["units"].values, ddof=1))
            else:
                std_dev_daily = 0.0

            # 3. Expected Demand During Lead Time (LTD)
            lead_time = item.supplier_lead_time_days
            ltd = round(daily_forecast_rate * lead_time, 1)

            # 4. Safety Stock (SS) = Z * sqrt(LTD) * sigma_d (Z = 1.65 for 95% service level)
            z_factor = 1.65
            effective_sigma = max(0.5, std_dev_daily)
            safety_stock = int(math.ceil(z_factor * math.sqrt(lead_time) * effective_sigma))

            # 5. Reorder Point (ROP) = LTD + SS
            reorder_point = int(math.ceil(ltd + safety_stock))

            # 6. Target Stock Policy and Suggested Reorder Quantity (ROQ)
            cycle_review_demand = daily_forecast_rate * 7.0
            target_stock = int(math.ceil(ltd + safety_stock + cycle_review_demand))

            suggested_reorder_qty = 0
            if item.current_stock <= reorder_point:
                shortfall = target_stock - item.current_stock
                suggested_reorder_qty = max(item.min_order_quantity, shortfall)

            # 7. Stockout Risk Assessment
            if item.current_stock == 0:
                risk_level = "CRITICAL"
                risk_pct = 100.0
                urgency = "IMMEDIATE"
            elif item.current_stock < ltd:
                risk_level = "HIGH"
                risk_pct = min(95.0, round((1.0 - (item.current_stock / max(1.0, ltd))) * 100.0, 1))
                urgency = "IMMEDIATE"
            elif item.current_stock <= reorder_point:
                risk_level = "MEDIUM"
                risk_pct = min(65.0, round((1.0 - (item.current_stock / max(1.0, reorder_point))) * 100.0, 1))
                urgency = "UPCOMING"
            else:
                risk_level = "LOW"
                risk_pct = max(5.0, round((reorder_point / max(1.0, item.current_stock)) * 20.0, 1))
                urgency = "ADEQUATE"

            # 8. Explanation and Assumptions
            if item.current_stock == 0:
                explanation = (
                    f"Stockout detected! Current inventory is 0 units. Expected lead-time demand "
                    f"({lead_time} days) is {ltd} units. Immediate reorder of {suggested_reorder_qty} units required."
                )
            elif item.current_stock <= reorder_point:
                days_left = round(item.current_stock / daily_forecast_rate, 1) if daily_forecast_rate > 0 else 99
                explanation = (
                    f"Inventory position ({item.current_stock} units) is at or below the reorder point ({reorder_point} units). "
                    f"At {daily_forecast_rate} units/day burn rate, remaining stock will deplete in ~{days_left} days "
                    f"(supplier lead time: {lead_time} days). Recommend reordering {suggested_reorder_qty} units."
                )
            else:
                explanation = (
                    f"Inventory position is healthy ({item.current_stock} units vs ROP {reorder_point} units). "
                    f"Adequate stock for current forecast. No reorder needed."
                )

            assumptions = [
                "Inventory stock is DEMO_ESTIMATED baseline dynamically adjusted by canonical sales events (not live warehouse ERP).",
                f"Supplier lead time: {lead_time} calendar days based on standard supplier catalog agreement.",
                f"Target service level: {int(item.target_service_level * 100)}% (standard normal Z-factor = {z_factor}).",
                f"Safety stock: ceil({z_factor} * sqrt({lead_time}) * {round(effective_sigma, 1)}) = {safety_stock} units.",
                f"Review period cycle stock: 7 days ({round(cycle_review_demand, 1)} units). Minimum order quantity: {item.min_order_quantity} units."
            ]

            rec_id = f"REC-PY-{item.source[:2].upper()}-{item.product_id}-{int(datetime.utcnow().timestamp())}"
            recommendations.append(
                InventoryRecommendation(
                    recommendation_id=rec_id,
                    product_id=item.product_id,
                    product_name=item.product_name,
                    source=item.source,
                    category=item.category,
                    current_stock=item.current_stock,
                    stock_data_source="DEMO_ESTIMATED",
                    supplier_lead_time_days=lead_time,
                    daily_forecast_rate=daily_forecast_rate,
                    expected_demand_lead_time=ltd,
                    safety_stock=safety_stock,
                    reorder_point=reorder_point,
                    suggested_reorder_qty=suggested_reorder_qty,
                    stockout_risk_level=risk_level,
                    stockout_risk_percentage=risk_pct,
                    urgency=urgency,
                    explanation=explanation,
                    assumptions=assumptions,
                    created_at=now_iso
                )
            )

        # Sort recommendations: IMMEDIATE > UPCOMING > ADEQUATE, then risk_pct descending
        urgency_rank = {"IMMEDIATE": 0, "UPCOMING": 1, "ADEQUATE": 2}
        recommendations.sort(key=lambda r: (urgency_rank[r.urgency], -r.stockout_risk_percentage))

        summary = {
            "total_skus": len(recommendations),
            "critical_stockouts": sum(1 for r in recommendations if r.stockout_risk_level == "CRITICAL"),
            "high_risk": sum(1 for r in recommendations if r.stockout_risk_level == "HIGH"),
            "reorders_recommended": sum(1 for r in recommendations if r.suggested_reorder_qty > 0)
        }

        return InventoryResponse(
            recommendations=recommendations,
            inventory_items=items,
            summary=summary,
            timestamp=now_iso
        )
