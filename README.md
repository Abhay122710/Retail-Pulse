# RetailPulse — A Multi-Source Pipeline for E-Commerce Business Intelligence

**RetailPulse** is an enterprise-grade, distributed e-commerce business intelligence platform that unifies real-time clickstream events, inventory signals, and transactions from multiple heterogeneous storefronts (**ShopPulse** and **TechMart**) into a centralized canonical data warehouse, powered by a dedicated **Python Machine Learning Engine** and visualized through an executive analytics dashboard.

---

## 🌟 Key Features

### 1. Heterogeneous Storefront Ecosystem
- **ShopPulse (`Site1`, Port 3000)**: Lifestyle and consumer apparel storefront built with React 19, TypeScript, and Vite.
- **TechMart (`TechMart`, Port 5174)**: Electronics and computing marketplace with native telemetry (`net_value`, `units`, `skus`).

### 2. Centralized Ingestion Gateway (`retail-pulse-connector`, Port 5000)
- **Canonical Schema Normalization**: Pluggable adapters (`ShopPulseAdapter`, `TechMartAdapter`) normalizing differing payloads into an immutable canonical format.
- **Strict Business Idempotency**: Deduplicates repeated order submissions and transactions without data corruption.
- **Dynamic Business KPI Engine**: Real-time cross-store revenue netting, cancellation deductions, conversion funnel tracking, and cart abandonment velocity.
- **Crash-Resilient Persistence**: Atomic JSON persistence with automated `.bak` backups and crash recovery.
- **Python ML Gateway**: Strictly proxies predictive requests to the Python engine with zero hidden TypeScript prediction fallbacks.

### 3. Dedicated Machine Learning Engine (`retailpulse-ml`, Port 8000)
- **Strict Python-Only AI/ML**: Implemented with Python 3.11, FastAPI, Pandas, Scikit-learn, and Statsmodels.
- **Demand Forecasting**: Holt-Winters exponential smoothing (7-day seasonality) and Holt-Linear models with non-negative constraints and 95% confidence intervals, evaluated against a Seasonal-Naive baseline.
- **Inventory Optimization**: Target stock policy with dynamic Safety Stock and Reorder Points ($SS = \lceil 1.65 \sqrt{L} \sigma_d \rceil$), with stock explicitly watermarked as `DEMO_ESTIMATED`.
- **Anomaly Detection**: Dual-engine anomaly detection combining 7-day rolling Z-scores ($|Z| \ge 2.0$ WARNING, $\ge 3.0$ CRITICAL) and multivariate Scikit-learn `IsolationForest`.
- **Stateful Anomaly Acknowledgment**: Tracks acknowledged anomaly alerts across system restarts.

### 4. Executive Analytics Dashboard (`RetailPulse`, Port 5173)
- Real-time cross-store performance cards with multi-source filtering (`ALL SOURCES`, `ShopPulse`, `TechMart`).
- Dedicated **Predictive Analytics Page** with 4 interactive panels:
  1. Demand Forecasts (Interactive Recharts curves with 95% CI bands, 7D/30D horizon switcher, Units/Revenue metric switcher).
  2. Inventory Optimization (Stockout risk tags, reorder quantities, lead time metrics).
  3. Anomaly Alerts (Severity cards, plain-English explanations, live interactive acknowledgment).
  4. Model Evaluation (Residual analysis, MAE, WAPE, and baseline comparison).

---

## 🏗️ Repository Architecture & Ports

```
d:\Major Project\
├── retail-pulse-connector/   # Central Express / TypeScript Connector (Port 5000)
├── retailpulse-ml/           # Python FastAPI Machine Learning Service (Port 8000)
├── RetailPulse/              # Executive Analytics Dashboard (Port 5173)
├── Site1/                    # ShopPulse Demo Storefront (Port 3000)
├── TechMart/                 # TechMart Demo Storefront (Port 5174)
├── start-all.ps1             # PowerShell script launching all 5 services concurrently
├── start-all.bat             # Batch launcher script
├── package.json              # Monorepo root scripts & test orchestration
├── RETAILPULSE_FINAL_IMPLEMENTATION_REPORT.md  # Detailed audit and engineering report
├── RETAILPULSE_SETUP_AND_RUN.md               # Step-by-step setup and operation guide
├── RETAILPULSE_API_REFERENCE.md               # Comprehensive REST API specifications
└── RETAILPULSE_DEMO_GUIDE.md                  # 12-step live examiner demonstration guide
```

| Subsystem | Technology Stack | Port | Health Check Endpoint |
|---|---|---|---|
| **RetailPulse Dashboard** | React 19, TypeScript, Vite, Tailwind CSS | `5173` | `GET /` (HTTP 200) |
| **Central Connector Gateway** | Node.js v22, Express, TypeScript | `5000` | `GET /api/health` |
| **Python ML Engine** | Python 3.11, FastAPI, Scikit-learn, Pandas | `8000` | `GET /health` |
| **ShopPulse Storefront** | React 19, TypeScript, Vite | `3000` | `GET /` (HTTP 200) |
| **TechMart Storefront** | React 19, TypeScript, Vite | `5174` | `GET /` (HTTP 200) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** `>= 18.0.0` (Verified on v22)
- **npm** `>= 9.0.0`
- **Python** `>= 3.10.0` (Verified on 3.11.9)

### 2. Installation
```powershell
# In the project root:
npm install
npm --prefix RetailPulse install
npm --prefix retail-pulse-connector install
npm --prefix Site1 install
npm --prefix TechMart install

# Configure Python virtual environment:
cd retailpulse-ml
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
cd ..
```

### 3. Launching All Services Concurrently
```powershell
npm run dev
# or
.\start-all.ps1
```

Once running, access:
- **RetailPulse Executive Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Predictive Analytics**: [http://localhost:5173/predictive](http://localhost:5173/predictive)
- **ShopPulse Storefront**: [http://localhost:3000](http://localhost:3000)
- **TechMart Storefront**: [http://localhost:5174](http://localhost:5174)
- **Central Connector API**: [http://localhost:5000](http://localhost:5000)
- **Python ML FastAPI API**: [http://localhost:8000](http://localhost:8000)

---

## 🧪 Automated Testing (66 Tests — 100% Passing)

RetailPulse features a comprehensive regression and end-to-end test suite:

```powershell
# Run ALL test suites (Connector + Python ML):
npm run test:all

# Run only Connector & E2E integration tests (50 tests):
npm test

# Run only Python ML tests (16 tests):
npm run test:python

# Validate production builds for all applications:
npm run build
```

### Test Suite Breakdown
- **Connector & Ingestion (A1–A4, E2E, P1–P3)**: 50 tests passed (Node.js test runner)
- **Python ML Engine (`retailpulse-ml/tests/`)**: 16 tests passed (pytest)
- **Total Passing Automated Tests**: **66 tests passed (0 failed, 0 skipped)**

---

## 📚 Project Documentation

For in-depth architectural and operational documentation, refer to:
- [**Final Implementation Report**](RETAILPULSE_FINAL_IMPLEMENTATION_REPORT.md): Complete architectural audit, benchmark measurements, and validation evidence.
- [**Setup and Run Guide**](RETAILPULSE_SETUP_AND_RUN.md): Step-by-step instructions for installation, configuration, health checks, and troubleshooting.
- [**API Reference Manual**](RETAILPULSE_API_REFERENCE.md): Full contracts for all Connector and Python ML REST endpoints.
- [**Live Demonstration Guide**](RETAILPULSE_DEMO_GUIDE.md): 12-step guided demonstration sequence for examiners and evaluators.
