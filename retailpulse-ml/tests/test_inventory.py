import pytest
from app.services.data_loader import DataLoader
from app.services.inventory import InventoryService

def test_inventory_items_demo_labeling(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = InventoryService(data_loader=loader)

    items = service.get_inventory_items(source="ShopPulse")
    assert len(items) > 0
    for it in items:
        assert it.stock_data_source == "DEMO_ESTIMATED", "Must strictly label stock as DEMO_ESTIMATED"
        assert it.current_stock >= 0

def test_inventory_recommendation_formulas(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = InventoryService(data_loader=loader)

    resp = service.generate_recommendations(source="ShopPulse")
    assert len(resp.recommendations) > 0

    for rec in resp.recommendations:
        # Verify ROP = ceil(LTD + SS)
        assert rec.reorder_point >= int(rec.expected_demand_lead_time + rec.safety_stock)
        assert rec.safety_stock > 0

        # If stock is 0, risk must be CRITICAL and urgency IMMEDIATE
        if rec.current_stock == 0:
            assert rec.stockout_risk_level == "CRITICAL"
            assert rec.urgency == "IMMEDIATE"
            assert rec.suggested_reorder_qty > 0

        # If stock > ROP, suggested reorder must be 0 and urgency ADEQUATE
        if rec.current_stock > rec.reorder_point:
            assert rec.suggested_reorder_qty == 0
            assert rec.urgency == "ADEQUATE"

        # Check assumptions are documented
        assert len(rec.assumptions) >= 4
        assert any("Z-factor" in a for a in rec.assumptions)

def test_inventory_recommendations_all_sources_unspecified(continuous_14d_db_path):
    """
    Regression test for DEF-ML-01: Verifies generate_recommendations(source=None)
    evaluates all catalog items (including items at or below ROP) without NameError.
    """
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = InventoryService(data_loader=loader)

    resp = service.generate_recommendations(source=None)
    assert len(resp.recommendations) >= 12
    assert resp.summary["total_skus"] == len(resp.recommendations)
    for rec in resp.recommendations:
        assert isinstance(rec.explanation, str)
        assert len(rec.explanation) > 10
        assert "units" in rec.explanation
