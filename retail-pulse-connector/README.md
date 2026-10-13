# Retail Pulse Connector Service

The **Retail Pulse Connector** is a central service designed to collect real-time e-commerce events and structured data from multiple e-commerce platforms (**ShopPulse** and **TechMart**), normalize them into a canonical data model, store them in a persistent data store, and expose REST APIs for the **Retail Pulse Analytics Dashboard**.

## Features

- **Real-Time Data Ingestion**: REST endpoint `POST /api/events` to ingest e-commerce user interaction events.
- **Source-Specific Adapters**: Dedicated adapters (`ShopPulseAdapter` and `TechMartAdapter`) to handle heterogeneous data schemas without forcing changes on source systems.
- **Canonical Schema Normalization**: Normalizes IDs (`canonical_user_id`, `canonical_product_id`, `canonical_transaction_id`) and timestamps.
- **Batch Data Extraction**: Endpoint `POST /api/extract` for historical and scheduled data extractions.
- **Analytics & Insights Engine**: Dynamically calculates behavioral insights, cart abandonment rate, conversion rates, user journeys, search terms, and sales metrics.
- **Persistent Data Store**: Built with SQLite (`retail_pulse.db`).

## API Endpoints

- `POST /api/events` - Ingest raw e-commerce events from ShopPulse or TechMart.
- `POST /api/extract` - Trigger batch data extraction.
- `GET /api/sources` - Status and metadata of connected data sources.
- `GET /api/events` - Query normalized canonical events.
- `GET /api/extractions` - Extraction execution history.
- `GET /api/summary` - Aggregate summary metrics.
- `GET /api/insights` - Real-time computed behavioral and sales insights.
- `POST /api/test-event` - Inject test event for demo mode.
- `GET /api/health` - Health check.
