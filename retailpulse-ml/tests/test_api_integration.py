from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "RetailPulse Predictive ML Engine"
    assert data["status"] == "healthy"

    res_h = client.get("/health")
    assert res_h.status_code == 200

def test_api_forecasts_endpoint():
    res = client.get("/api/predictive/forecasts?source=ShopPulse&horizonDays=7")
    assert res.status_code == 200
    data = res.json()
    assert "forecast_id" in data
    assert len(data["forecast_points"]) == 7
    assert data["model_name"] in ("Holt-Linear", "Holt-Winters", "Seasonal-Naive")

def test_api_forecast_generate_post():
    payload = {
        "source": "ShopPulse",
        "horizon_days": 7,
        "target_metric": "UNITS"
    }
    res = client.post("/api/predictive/forecasts/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["horizon_days"] == 7
    assert len(data["forecast_points"]) == 7

def test_api_inventory_endpoint():
    res = client.get("/api/predictive/inventory?source=ShopPulse")
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert "inventory_items" in data
    assert "summary" in data

def test_api_anomalies_endpoint_and_ack():
    res = client.get("/api/predictive/anomalies?source=ShopPulse")
    assert res.status_code == 200
    data = res.json()
    assert "anomalies" in data
    assert "summary" in data

    # Test acknowledgment endpoint
    dummy_id = "ANOM-TEST-ACK-1"
    ack_res = client.post(f"/api/predictive/anomalies/{dummy_id}/ack")
    assert ack_res.status_code == 200
    assert "successfully acknowledged" in ack_res.json()["message"]

def test_api_evaluation_endpoint():
    res = client.get("/api/predictive/forecasts/evaluation?source=ShopPulse")
    assert res.status_code == 200
    data = res.json()
    assert "model_name" in data
    assert "status" in data
