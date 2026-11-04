import json
import pytest
from app.services.data_loader import DataLoader
from app.services.anomaly_detection import AnomalyDetectionService

def test_anomaly_detection_empty_history(empty_db_path):
    loader = DataLoader(data_path=empty_db_path)
    service = AnomalyDetectionService(data_loader=loader)

    resp = service.detect_anomalies()
    assert len(resp.anomalies) == 0
    assert resp.summary.total == 0

def test_sudden_revenue_spike_detection(tmp_path):
    # Create 7 normal days followed by an extreme spike
    file_path = tmp_path / "spike_test.json"
    events = []
    for day in range(1, 8):
        events.append({
            "canonical_event_id": f"EVT-NORM-{day}",
            "source": "ShopPulse",
            "event_type": "ORDER_CREATED",
            "timestamp": f"2026-10-{day:02d}T10:00:00Z",
            "total_amount": 2000.0,
            "quantity": 1,
            "order_id": f"ORD-NORM-{day}",
            "product_id": "P101"
        })

    # Day 8: Extreme revenue spike
    events.append({
        "canonical_event_id": "EVT-SPIKE-8",
        "source": "ShopPulse",
        "event_type": "ORDER_CREATED",
        "timestamp": "2026-10-08T10:00:00Z",
        "total_amount": 50000.0,
        "quantity": 25,
        "order_id": "ORD-SPIKE-8",
        "product_id": "P101"
    })

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump({"events": events, "sources": []}, f)

    loader = DataLoader(data_path=file_path)
    service = AnomalyDetectionService(data_loader=loader)

    resp = service.detect_anomalies(source="ShopPulse")
    assert resp.summary.total > 0

    spike_alert = next((a for a in resp.anomalies if a.observation_date == "2026-10-08"), None)
    assert spike_alert is not None
    assert spike_alert.direction == "SPIKE"
    assert spike_alert.severity in ("CRITICAL", "WARNING")
    assert "Unusual spike" in spike_alert.explanation

def test_deduplication_of_alert_ids(continuous_14d_db_path):
    loader = DataLoader(data_path=continuous_14d_db_path)
    service = AnomalyDetectionService(data_loader=loader)

    resp1 = service.detect_anomalies(source="ShopPulse")
    resp2 = service.detect_anomalies(source="ShopPulse")

    ids1 = [a.anomaly_id for a in resp1.anomalies]
    ids2 = [a.anomaly_id for a in resp2.anomalies]
    assert ids1 == ids2, "Anomaly IDs must be deterministic and reproducible"
