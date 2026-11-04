import json
import pytest
from pathlib import Path
from tempfile import NamedTemporaryFile

@pytest.fixture
def empty_db_path(tmp_path):
    """Fixture providing an empty RetailPulse database."""
    file_path = tmp_path / "empty_db.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump({"events": [], "sources": []}, f)
    return file_path

@pytest.fixture
def continuous_14d_db_path(tmp_path):
    """Fixture providing 14 days of realistic ShopPulse & TechMart events."""
    file_path = tmp_path / "continuous_14d.json"
    events = []

    daily_units_sp = [4, 5, 3, 6, 8, 7, 5, 4, 6, 5, 7, 8, 9, 7]
    for idx, units in enumerate(daily_units_sp):
        day_str = f"2026-10-{idx + 1:02d}"
        events.append({
            "canonical_event_id": f"EVT-SP-TEST-{idx}",
            "source": "ShopPulse",
            "event_type": "ORDER_CREATED",
            "timestamp": f"{day_str}T10:00:00Z",
            "total_amount": float(units * 2500),
            "quantity": units,
            "order_id": f"ORD-SP-{idx}",
            "product_id": "P101",
            "product_name": "SoundPulse Pro Wireless Headphones"
        })
        events.append({
            "canonical_event_id": f"EVT-SP-VIEW-{idx}",
            "source": "ShopPulse",
            "event_type": "PRODUCT_VIEW",
            "timestamp": f"{day_str}T09:30:00Z",
            "product_id": "P101"
        })

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump({"events": events, "sources": []}, f)

    return file_path
