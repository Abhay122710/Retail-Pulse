# RetailPulse Python Predictive ML Engine (Part 3)

The Python-based Machine Learning service for RetailPulse, providing demand forecasting, inventory optimization, and statistical anomaly detection.

## Architecture

- **Demand Forecasting**: Holt's Linear and Holt-Winters Exponential Smoothing evaluated against a Seasonal-Naive baseline using chronological splits.
- **Inventory Optimization**: Reorder Point ($ROP = LTD + SS$), Safety Stock ($SS$), and Suggested Reorder Quantity ($ROQ$) based on a target cycle policy. Stock is strictly labeled `DEMO_ESTIMATED`.
- **Anomaly Detection**: 7-day rolling window statistical Z-score and percentage deviation detection, combined with Scikit-learn's Isolation Forest.
- **API Framework**: FastAPI with Pydantic validation and CORS support.

## Setup & Execution

### 1. Environment & Dependencies

The service uses a local virtual environment located at `.venv`:

```powershell
# Activate Virtual Environment (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install / update requirements
pip install -r requirements.txt
```

### 2. Run Automated Pytest Suite

```powershell
.\.venv\Scripts\pytest -v
```

All 16 unit, integration, and API tests will run and validate:
- Chronological train/test splits without future data leakage
- Zero-demand date gap filling
- Non-negative prediction boundaries
- Deterministic safety stock formulas
- Anomaly alerts and deduplicated IDs
- FastAPI endpoints

### 3. Run FastAPI ML Service

```powershell
# Start ML Service on http://127.0.0.1:8000
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. API Endpoints

- `GET /api/predictive/forecasts` — Generate or retrieve demand forecast
- `POST /api/predictive/forecasts/generate` — Explicitly trigger model training
- `GET /api/predictive/forecasts/evaluation` — Retrieve MAE, WAPE, and baseline comparison
- `GET /api/predictive/inventory` — Compute live reorder points and stockout risks
- `GET /api/predictive/anomalies` — Scan and retrieve business metric anomalies
- `POST /api/predictive/anomalies/{id}/ack` — Acknowledge an anomaly alert
