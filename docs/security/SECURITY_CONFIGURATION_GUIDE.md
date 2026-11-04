# RetailPulse — Security Configuration & Hardening Guide

This guide provides configuration specifications for operating RetailPulse securely in development, staging, and production environments.

---

## 1. Network & Port Isolation

| Service | Default Port | Recommended Production Binding | Network Policy |
|---|:---:|:---:|---|
| **RetailPulse Dashboard** | `5173` | Reverse proxy via Nginx / Cloudflare | Public HTTPS (Port 443) |
| **Central Connector Gateway** | `5000` | `127.0.0.1:5000` behind TLS reverse proxy | Authenticated internal / Ingress |
| **Python FastAPI ML Engine** | `8000` | `127.0.0.1:8000` (Private VPC / Localhost) | Strictly internal (No public ingress) |
| **ShopPulse Storefront** | `3000` | Reverse proxy via Nginx / Cloudflare | Public HTTPS |
| **TechMart Storefront** | `5174` | Reverse proxy via Nginx / Cloudflare | Public HTTPS |

---

## 2. Environment Variables & Secret Handling

Ensure `.env` files are excluded from version control (enforced in `.gitignore`).

### Key Production Variables:
```ini
# Central Connector Gateway (retail-pulse-connector)
NODE_ENV=production
PORT=5000
HOST=127.0.0.1
ALLOWED_ORIGINS=https://dashboard.retailpulse.com,https://shoppulse.com,https://techmart.com
RATE_LIMIT_MAX_REQUESTS=300
RATE_LIMIT_WINDOW_MS=60000

# Python ML Service (retailpulse-ml)
ENV=production
PORT=8000
HOST=127.0.0.1
ALLOWED_ORIGINS=http://127.0.0.1:5000
DEFAULT_HORIZON_DAYS=7
DEFAULT_SERVICE_LEVEL=0.95
ANOMALY_ZSCORE_THRESHOLD=2.0
```

---

## 3. Rate Limiting Guidelines
- **API Ingestion (`/api/events`)**: 300 requests/minute per client IP. Returns HTTP 429 with `Retry-After`.
- **PulseAI Reasoning (`/api/ai/chat`)**: Max query length 1000 characters, max history 30 items.
- **Export Endpoints (`/api/reports/export-csv`)**: Bounded and sanitized against formula injection.

---

## 4. Operational Best Practices
- Never bypass `SchemaValidator` or disable `SecurityHeadersMiddleware`.
- Maintain automated regression and security test execution (`npm run test:all`) in CI pipelines.
- Rotate any administrative credentials every 90 days.

