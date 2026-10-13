# Retail Pulse - Multi-Source E-Commerce Intelligence Suite

A full-stack, distributed e-commerce analytics and intelligence platform that unifies real-time clickstream events, inventory signals, and transactions from multiple heterogeneous storefronts (**ShopPulse** and **TechMart**) into a centralized canonical data warehouse and an interactive executive intelligence dashboard (**Retail Pulse**).

---

## 🌟 Key Features

- **Multi-Storefront Ecosystem**:
  - **ShopPulse (`Site1`)**: Modern lifestyle and consumer apparel storefront built with React, Vite, and Tailwind CSS.
  - **TechMart (`TechMart`)**: Electronics and gadgets marketplace with active telemetry and simulated cart interactions.
- **Centralized Connector & Ingestion Engine (`retail-pulse-connector`)**:
  - Event streaming API (`POST /api/events`) capturing product views, cart modifications, searches, and checkouts.
  - Pluggable source adapters (`ShopPulseAdapter`, `TechMartAdapter`) normalizing differing payloads into a canonical schema.
  - Batch extraction and automated synchronization pipeline.
  - Real-time behavioural insights engine (cart abandonment rate, search trends, journey tracking, conversion velocity).
- **Executive Analytics Dashboard (`RetailPulse`)**:
  - Real-time revenue, conversion, and traffic KPI tracking.
  - Multi-platform comparative performance graphs (ShopPulse vs. TechMart).
  - Cross-source funnel analysis and real-time live event feed.
  - Behavioral insights visualization with Recharts & Lucide icons.

---

## 🏗️ Repository Architecture

```
Major Project/
├── retail-pulse-connector/   # Central Express/Node.js ingestion & normalization service (Port 3001)
├── RetailPulse/              # Executive Analytics Dashboard frontend (React + Vite + Tailwind)
├── Site1/                    # ShopPulse Storefront frontend (React + Vite + Tailwind)
├── TechMart/                 # TechMart Storefront frontend (React + Vite + Tailwind)
├── start-all.ps1             # PowerShell script to boot all 4 services concurrently
├── start-all.bat             # Batch launcher script
├── launch-terminals.bat      # Launches individual terminal windows for each service
└── package.json              # Monorepo root scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

Install dependencies for all sub-projects:

```bash
# In the repository root:
npm --prefix retail-pulse-connector install
npm --prefix RetailPulse install
npm --prefix Site1 install
npm --prefix TechMart install
```

### Running All Services

You can launch all 4 services simultaneously using any of the following options:

#### Option 1: Monorepo Root Script
```bash
npm run dev
```

#### Option 2: PowerShell Script
```powershell
.\start-all.ps1
```

#### Option 3: Separate Terminals (Windows Batch)
Double-click `launch-terminals.bat` or run:
```cmd
launch-terminals.bat
```

### Service Port Allocation

| Service | Port | Description |
| :--- | :--- | :--- |
| **Retail Pulse Connector** | `http://localhost:3001` | Data Ingestion, Extraction & Analytics API |
| **Retail Pulse Dashboard** | `http://localhost:5173` | Executive Analytics Dashboard |
| **ShopPulse** | `http://localhost:5174` | E-Commerce Storefront 1 |
| **TechMart** | `http://localhost:5175` | E-Commerce Storefront 2 |

---

## 📡 API Overview (Connector Service)

- `POST /api/events` - Ingest clickstream/storefront event
- `GET /api/events` - Query normalized canonical events
- `POST /api/extract` - Trigger historical batch data extraction
- `GET /api/summary` - Aggregate metrics across all platforms
- `GET /api/insights` - Behavioral insights, conversion velocity & cart abandonment metrics
- `GET /api/sources` - Health & status of connected storefronts
- `GET /api/health` - Connector service health check

---

## 📜 License

This project is developed as an academic Major Project. All rights reserved.
