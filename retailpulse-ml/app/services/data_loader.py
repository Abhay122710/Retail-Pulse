import json
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
import pandas as pd
import numpy as np

from app.config import settings

class DataLoader:
    """
    Loads, cleans, and structures canonical events from the shared RetailPulse database.
    Performs gap filling to distinguish true calendar zero-demand days from missing ranges.
    """

    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or settings.DATA_FILE_PATH

    def load_raw_events(self) -> List[Dict[str, Any]]:
        """Reads canonical events from retail_pulse.json."""
        if not self.data_path.exists():
            return []
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("events", [])
        except Exception as e:
            print(f"[DataLoader] Error reading data file {self.data_path}: {e}")
            return []

    def get_daily_time_series(
        self,
        source: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Builds a continuous daily time series for a source or all sources combined.
        Guarantees consecutive daily dates with interpolated zeros for dormant days.
        """
        events = self.load_raw_events()

        if source and source not in ("ALL SOURCES", "All", "all"):
            events = [e for e in events if e.get("source") == source]

        if not events:
            empty_df = pd.DataFrame(columns=[
                "date", "revenue_gross", "revenue_net", "order_count",
                "units_sold", "cancelled_orders", "checkout_starts",
                "product_views", "cart_additions", "is_interpolated_zero"
            ])
            return empty_df, {
                "start_date": None,
                "end_date": None,
                "total_days": 0,
                "active_days": 0
            }

        # Identify cancelled order IDs to apply documented cancellation rule
        cancelled_order_ids = {
            e.get("order_id")
            for e in events
            if e.get("event_type") == "ORDER_CANCELLED" and e.get("order_id")
        }

        # Group events by calendar date
        daily_records: Dict[str, Dict[str, float]] = {}

        for e in events:
            ts = e.get("timestamp")
            if not ts:
                continue
            date_str = ts[:10]

            if date_str not in daily_records:
                daily_records[date_str] = {
                    "revenue_gross": 0.0,
                    "revenue_net": 0.0,
                    "order_count": 0,
                    "units_sold": 0,
                    "cancelled_orders": 0,
                    "checkout_starts": 0,
                    "product_views": 0,
                    "cart_additions": 0
                }

            day = daily_records[date_str]
            evt_type = e.get("event_type")

            if evt_type == "ORDER_CREATED":
                amount = float(e.get("total_amount") or 0.0)
                qty = int(e.get("quantity") or 1)
                day["revenue_gross"] += amount

                order_id = e.get("order_id")
                if not order_id or order_id not in cancelled_order_ids:
                    day["revenue_net"] += amount
                    day["order_count"] += 1
                    day["units_sold"] += qty

            elif evt_type == "ORDER_CANCELLED":
                day["cancelled_orders"] += 1
            elif evt_type == "CHECKOUT_STARTED":
                day["checkout_starts"] += 1
            elif evt_type == "PRODUCT_VIEW":
                day["product_views"] += 1
            elif evt_type == "ADD_TO_CART":
                day["cart_additions"] += 1

        dates = sorted(daily_records.keys())
        if not dates:
            empty_df = pd.DataFrame(columns=[
                "date", "revenue_gross", "revenue_net", "order_count",
                "units_sold", "cancelled_orders", "checkout_starts",
                "product_views", "cart_additions", "is_interpolated_zero"
            ])
            return empty_df, {"start_date": None, "end_date": None, "total_days": 0, "active_days": 0}

        min_date = dates[0]
        max_date = dates[-1]

        # Generate continuous range of calendar days
        all_dates = pd.date_range(start=min_date, end=max_date, freq="D").strftime("%Y-%m-%d").tolist()

        rows = []
        active_days_count = 0

        for d in all_dates:
            if d in daily_records:
                active_days_count += 1
                row = {
                    "date": d,
                    "revenue_gross": round(daily_records[d]["revenue_gross"], 2),
                    "revenue_net": round(daily_records[d]["revenue_net"], 2),
                    "order_count": int(daily_records[d]["order_count"]),
                    "units_sold": int(daily_records[d]["units_sold"]),
                    "cancelled_orders": int(daily_records[d]["cancelled_orders"]),
                    "checkout_starts": int(daily_records[d]["checkout_starts"]),
                    "product_views": int(daily_records[d]["product_views"]),
                    "cart_additions": int(daily_records[d]["cart_additions"]),
                    "is_interpolated_zero": False
                }
            else:
                row = {
                    "date": d,
                    "revenue_gross": 0.0,
                    "revenue_net": 0.0,
                    "order_count": 0,
                    "units_sold": 0,
                    "cancelled_orders": 0,
                    "checkout_starts": 0,
                    "product_views": 0,
                    "cart_additions": 0,
                    "is_interpolated_zero": True
                }
            rows.append(row)

        df = pd.DataFrame(rows)
        meta = {
            "start_date": min_date,
            "end_date": max_date,
            "total_days": len(df),
            "active_days": active_days_count
        }
        return df, meta

    def get_product_daily_series(
        self,
        product_id: str,
        source: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Builds a daily time series for a specific product.
        Aligns to the overall store observation window with genuine zeros.
        """
        events = self.load_raw_events()

        if source and source not in ("ALL SOURCES", "All", "all"):
            events = [e for e in events if e.get("source") == source]

        cancelled_order_ids = {
            e.get("order_id")
            for e in events
            if e.get("event_type") == "ORDER_CANCELLED" and e.get("order_id")
        }

        # Filter events relevant to this product
        p_events = [
            e for e in events
            if e.get("product_id") == product_id or
               (e.get("canonical_product_id") and e.get("canonical_product_id").endswith(product_id))
        ]

        product_name = p_events[0].get("product_name") if p_events else f"Product {product_id}"
        product_source = p_events[0].get("source") if p_events else (source or "ShopPulse")

        full_df, meta = self.get_daily_time_series(source)
        if full_df.empty:
            empty_df = pd.DataFrame(columns=["date", "units", "revenue", "views", "is_interpolated_zero"])
            return empty_df, {"product_id": product_id, "product_name": product_name, "source": product_source}

        # Aggregate product sales by date
        prod_daily: Dict[str, Dict[str, float]] = {}
        for e in p_events:
            ts = e.get("timestamp")
            if not ts:
                continue
            d = ts[:10]
            if d not in prod_daily:
                prod_daily[d] = {"units": 0, "revenue": 0.0, "views": 0}

            evt_type = e.get("event_type")
            if evt_type == "PRODUCT_VIEW":
                prod_daily[d]["views"] += 1
            elif evt_type == "ORDER_CREATED":
                order_id = e.get("order_id")
                if not order_id or order_id not in cancelled_order_ids:
                    prod_daily[d]["units"] += int(e.get("quantity") or 1)
                    prod_daily[d]["revenue"] += float(e.get("total_amount") or 0.0)

        rows = []
        for d in full_df["date"].tolist():
            if d in prod_daily:
                rows.append({
                    "date": d,
                    "units": prod_daily[d]["units"],
                    "revenue": round(prod_daily[d]["revenue"], 2),
                    "views": prod_daily[d]["views"],
                    "is_interpolated_zero": False
                })
            else:
                rows.append({
                    "date": d,
                    "units": 0,
                    "revenue": 0.0,
                    "views": 0,
                    "is_interpolated_zero": True
                })

        df = pd.DataFrame(rows)
        return df, {
            "product_id": product_id,
            "product_name": product_name,
            "source": product_source,
            "total_days": len(df)
        }
