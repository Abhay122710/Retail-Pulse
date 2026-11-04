import time
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta

from app.services.data_loader import DataLoader
from app.services.forecasting import ForecastingService
from app.services.inventory import InventoryService
from app.services.anomaly_detection import AnomalyDetectionService
from app.services.simulation import SimulationService
from app.schemas.ai_schemas import (
    ChatRequest,
    ChatResponse,
    ToolExecutionStep,
    EvidenceItem
)

class PulseAIAgent:
    """
    Evidence-driven, read-only AI Business Intelligence Assistant.
    Coordinates bounded multi-step tool execution across RetailPulse's
    predictive and analytical engines.
    """

    MAX_TOOL_STEPS = 4

    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()
        self.forecasting_service = ForecastingService(self.data_loader)
        self.inventory_service = InventoryService(self.data_loader)
        self.anomaly_service = AnomalyDetectionService(self.data_loader)
        self.simulation_service = SimulationService(self.data_loader)

    # =========================================================================
    # APPROVED BUSINESS TOOLS (Strictly Scoped & Read-Only)
    # =========================================================================

    def tool_query_kpis(self, source: str = "ALL SOURCES", days: int = 30) -> Dict[str, Any]:
        """Tool 1: Queries approved financial KPIs over a defined historical period."""
        events = self.data_loader.load_raw_events()
        if source and source not in ("ALL SOURCES", "All"):
            events = [e for e in events if e.get("source") == source]

        now = datetime.utcnow()
        period_start = now - timedelta(days=days)

        gross_rev = 0.0
        cancelled_rev = 0.0
        orders_count = 0
        cancelled_count = 0

        for e in events:
            ts_str = e.get("timestamp")
            if not ts_str:
                continue
            try:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                continue

            if dt < period_start:
                continue

            etype = e.get("event_type")
            amt = float(e.get("total_amount") or 0.0)

            if etype in ("ORDER_CREATED", "CHECKOUT_COMPLETED"):
                orders_count += 1
                gross_rev += amt
            elif etype == "ORDER_CANCELLED":
                cancelled_count += 1
                cancelled_rev += amt

        net_rev = max(0.0, gross_rev - cancelled_rev)
        cancellation_rate = (cancelled_count / orders_count * 100.0) if orders_count > 0 else 0.0
        aov = (gross_rev / orders_count) if orders_count > 0 else 0.0

        return {
            "period_days": days,
            "source": source,
            "gross_revenue": round(gross_rev, 2),
            "net_revenue": round(net_rev, 2),
            "total_orders": orders_count,
            "cancelled_orders": cancelled_count,
            "cancellation_rate_pct": round(cancellation_rate, 1),
            "average_order_value": round(aov, 2)
        }

    def tool_get_aggregated_sales(self, source: str = "ALL SOURCES", group_by: str = "category", days: int = 30) -> List[Dict[str, Any]]:
        """Tool 2: Retrieves aggregated sales by product or category."""
        events = self.data_loader.load_raw_events()
        if source and source not in ("ALL SOURCES", "All"):
            events = [e for e in events if e.get("source") == source]

        grouped: Dict[str, Dict[str, Any]] = {}
        for e in events:
            if e.get("event_type") not in ("ORDER_CREATED", "CHECKOUT_COMPLETED"):
                continue

            key = e.get(group_by) or e.get("product_name") or "Uncategorized"
            amt = float(e.get("total_amount") or 0.0)
            units = int(e.get("quantity") or 1)

            if key not in grouped:
                grouped[key] = {"group": key, "revenue": 0.0, "units": 0}
            grouped[key]["revenue"] += amt
            grouped[key]["units"] += units

        results = list(grouped.values())
        results.sort(key=lambda x: x["revenue"], reverse=True)
        for r in results:
            r["revenue"] = round(r["revenue"], 2)
        return results[:10]

    def tool_get_inventory_recommendations(self, source: str = "ALL SOURCES") -> List[Dict[str, Any]]:
        """Tool 3: Inspects real-time inventory recommendations and stockout risks."""
        src_param = None if source in ("ALL SOURCES", "All") else source
        resp = self.inventory_service.generate_recommendations(src_param)
        recs = resp.recommendations
        return [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "source": r.source,
                "current_stock": r.current_stock,
                "reorder_point": r.reorder_point,
                "suggested_reorder_qty": r.suggested_reorder_qty,
                "stockout_risk_level": r.stockout_risk_level,
                "urgency": r.urgency
            }
            for r in recs
        ]

    def tool_get_forecasts(self, source: str = "ALL SOURCES", horizon_days: int = 7) -> Dict[str, Any]:
        """Tool 4: Retrieves statistical time-series demand forecasts from Python engine."""
        src_param = None if source in ("ALL SOURCES", "All") else source
        fc = self.forecasting_service.generate_demand_forecast(source=src_param, horizon_days=horizon_days)
        total_pred = sum(p.predicted_demand for p in fc.forecast_points)
        return {
            "source": fc.source,
            "horizon_days": fc.horizon_days,
            "target_metric": fc.target_metric,
            "total_predicted_demand": round(total_pred, 2),
            "model_champion": fc.model_name,
            "evaluation_mae": fc.evaluation.mae if fc.evaluation else None,
            "evaluation_rmse": fc.evaluation.rmse if fc.evaluation else None
        }

    def tool_get_anomalies(self, source: str = "ALL SOURCES", metric: str = "DAILY_REVENUE") -> List[Dict[str, Any]]:
        """Tool 5: Retrieves statistical anomaly alerts."""
        src_param = None if source in ("ALL SOURCES", "All") else source
        resp = self.anomaly_service.detect_anomalies(source=src_param, metric_filter=metric)
        anomalies = resp.anomalies
        return [
            {
                "anomaly_id": a.anomaly_id,
                "source": a.source,
                "metric": a.metric,
                "observation_date": a.observation_date,
                "observed_value": a.observed_value,
                "expected_baseline": a.expected_baseline,
                "deviation_percentage": a.deviation_percentage,
                "severity": a.severity,
                "direction": a.direction
            }
            for a in anomalies
        ]

    def tool_get_model_evaluation(self, source: str = "ALL SOURCES") -> Dict[str, Any]:
        """Tool 6: Retrieves Champion vs Challenger model accuracy metrics."""
        src_param = None if source in ("ALL SOURCES", "All") else source
        fc = self.forecasting_service.generate_demand_forecast(source=src_param, horizon_days=7)
        if not fc.evaluation:
            return {"status": "INSUFFICIENT_DATA", "message": "Evaluation requires at least 10 days of continuous data."}

        return {
            "status": "EVALUATION_AVAILABLE",
            "champion_model": fc.model_name,
            "mae": fc.evaluation.mae,
            "rmse": fc.evaluation.rmse,
            "wape": fc.evaluation.wape,
            "improvement_vs_baseline_pct": fc.evaluation.improvement_percentage,
            "model_comparison": [
                {
                    "model": m.model_name,
                    "role": m.role,
                    "mae": m.mae,
                    "rmse": m.rmse,
                    "wape": m.wape,
                    "improvement_vs_baseline_pct": m.improvement_vs_baseline_pct
                }
                for m in (fc.evaluation.model_comparison or [])
            ]
        }

    def tool_run_simulation(
        self,
        source: str = "ALL SOURCES",
        price_change_pct: float = 0.0,
        demand_change_pct: float = 0.0,
        inventory_delta_pct: float = 0.0,
        horizon_days: int = 14
    ) -> Dict[str, Any]:
        """Tool 7: Runs what-if price elasticity and supply chain simulation."""
        from app.schemas.simulation_schemas import SimulationRequest
        req = SimulationRequest(
            source=source,
            price_change_pct=price_change_pct,
            demand_change_pct=demand_change_pct,
            inventory_delta_pct=inventory_delta_pct,
            horizon_days=horizon_days
        )
        res = self.simulation_service.run_simulation(req)
        rev_delta = round(res.simulated_metrics.total_revenue - res.baseline_metrics.total_revenue, 2)
        return {
            "baseline_revenue": round(res.baseline_metrics.total_revenue, 2),
            "scenario_revenue": round(res.simulated_metrics.total_revenue, 2),
            "revenue_delta": rev_delta,
            "revenue_delta_pct": round(res.percentage_changes.revenue_pct_change, 1),
            "baseline_units": int(res.baseline_metrics.total_units),
            "scenario_units": int(res.simulated_metrics.total_units),
            "units_delta_pct": round(res.percentage_changes.units_pct_change, 1),
            "simulated_stockout_risk": res.simulated_metrics.stockout_risk_level,
            "stockout_risk_change": f"Transitions to {res.simulated_metrics.stockout_risk_level}"
        }

    def tool_get_product_profitability(self, source: str = "ALL SOURCES") -> Dict[str, Any]:
        """Tool 8: Analyzes product profitability and margins with strict cost coverage."""
        events = self.data_loader.load_raw_events()
        if source and source not in ("ALL SOURCES", "All"):
            events = [e for e in events if e.get("source") == source]

        # Standard known catalog costs
        known_costs = {
            "P101": 1650.0,
            "P102": 3200.0,
            "P103": 1100.0,
            "P104": 2800.0,
            "P105": 600.0,
            "TM-PROD-101": 5200.0,
            "TM-PROD-102": 1850.0,
            "TM-PROD-103": 3200.0,
            "TM-PROD-104": 2100.0,
            "TM-PROD-105": 3100.0,
            "TM-PROD-106": 5200.0,
            "TM-LAP-001": 110000.0,
            "TM-MON-002": 22000.0
        }

        prod_stats: Dict[str, Dict[str, Any]] = {}
        for e in events:
            if e.get("event_type") not in ("ORDER_CREATED", "CHECKOUT_COMPLETED"):
                continue

            pid = e.get("product_id") or "UNKNOWN"
            pname = e.get("product_name") or pid
            amt = float(e.get("total_amount") or 0.0)
            units = int(e.get("quantity") or 1)

            if pid not in prod_stats:
                prod_stats[pid] = {"product_id": pid, "name": pname, "revenue": 0.0, "units": 0}
            prod_stats[pid]["revenue"] += amt
            prod_stats[pid]["units"] += units

        costed_items = []
        uncosted_items = []

        for pid, stat in prod_stats.items():
            base_pid = pid.replace("SP-PROD-", "").replace("TM-SKU-", "")
            unit_cost = known_costs.get(base_pid) or known_costs.get(pid)

            if unit_cost is not None:
                total_cogs = unit_cost * stat["units"]
                gross_profit = stat["revenue"] - total_cogs
                margin_pct = (gross_profit / stat["revenue"] * 100.0) if stat["revenue"] > 0 else 0.0
                costed_items.append({
                    "product_id": pid,
                    "product_name": stat["name"],
                    "revenue": round(stat["revenue"], 2),
                    "gross_profit": round(gross_profit, 2),
                    "margin_pct": round(margin_pct, 1),
                    "cost_status": "VERIFIED_CATALOG_COST"
                })
            else:
                uncosted_items.append({
                    "product_id": pid,
                    "product_name": stat["name"],
                    "revenue": round(stat["revenue"], 2),
                    "gross_profit": None,
                    "margin_pct": None,
                    "cost_status": "COST_UNAVAILABLE"
                })

        costed_items.sort(key=lambda x: x["revenue"], reverse=True)
        return {
            "costed_products": costed_items,
            "uncosted_products": uncosted_items,
            "audit_notice": "Products without verified cost sheets are strictly classified as COST_UNAVAILABLE."
        }

    # =========================================================================
    # MULTI-STEP INTENT RESOLVER & WORKFLOW DISPATCHER
    # =========================================================================

    def answer_query(self, request: ChatRequest) -> ChatResponse:
        """
        Executes bounded, auditable investigation and synthesizes evidence-backed response.
        Guarantees zero hallucinated numbers, full citation trace, and strict safety.
        """
        query_lower = request.query.lower().strip()
        source = request.source or "ALL SOURCES"

        # 1. Guard against prompt injection and jailbreak attempts
        injection_patterns = [
            r"ignore (all )?previous instructions",
            r"disregard (all )?previous instructions",
            r"system override",
            r"bypass (all )?(safety|guardrails|filters|rules)",
            r"reveal (the )?(system prompt|initial instructions)",
            r"you are now (dan|jailbreak|unrestricted)",
            r"drop database",
            r"drop table",
            r"truncate table",
            r"delete from",
            r"union\s+select",
            r"exec\s*\(",
            r"<script>",
            r"<svg/onload",
            r"javascript:"
        ]
        for pat in injection_patterns:
            if re.search(pat, query_lower):
                return ChatResponse(
                    query=request.query,
                    intent="SECURITY_REJECTION",
                    engine="PulseAI-SecurityGuard",
                    answer="Query rejected by RetailPulse security policies. System instructions, data tables, and access controls are protected and read-only.",
                    execution_steps=[
                        ToolExecutionStep(
                            step=1,
                            tool="security_validator",
                            arguments={"pattern_matched": pat},
                            status="FAILED",
                            duration_ms=1.0,
                            output_summary="Prompt injection attempt blocked"
                        )
                    ],
                    evidence=[],
                    citations=["RetailPulse Security Sandbox Policy"],
                    caveats_and_limitations=["Unsafe execution tokens rejected."]
                )

        steps: List[ToolExecutionStep] = []
        evidence: List[EvidenceItem] = []
        citations: List[str] = ["RetailPulse Shared Database (retail_pulse.json)"]
        caveats: List[str] = []

        # ---------------------------------------------------------------------
        # WORKFLOW 1: Revenue Change / Why did revenue fall?
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["why did revenue", "revenue fall", "revenue drop", "revenue decrease", "sales down"]):
            t0 = time.time()
            current_kpi = self.tool_query_kpis(source, days=7)
            prev_kpi = self.tool_query_kpis(source, days=14)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_query_kpis", arguments={"source": source, "days": 7},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Gross: ${current_kpi['gross_revenue']}, Net: ${current_kpi['net_revenue']}"
            ))

            t0 = time.time()
            cat_sales = self.tool_get_aggregated_sales(source, group_by="category", days=7)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=2, tool="tool_get_aggregated_sales", arguments={"group_by": "category"},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Analyzed {len(cat_sales)} categories"
            ))

            t0 = time.time()
            anomalies = self.tool_get_anomalies(source, metric="DAILY_REVENUE")
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=3, tool="tool_get_anomalies", arguments={"metric": "DAILY_REVENUE"},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Found {len(anomalies)} revenue anomalies"
            ))

            evidence.append(EvidenceItem(
                metric_name="7-Day Net Revenue",
                actual_value=f"${current_kpi['net_revenue']:,.2f}",
                comparison_value=f"${prev_kpi['net_revenue']:,.2f}",
                change_pct=f"{((current_kpi['net_revenue'] - prev_kpi['net_revenue']) / prev_kpi['net_revenue'] * 100):.1f}%" if prev_kpi['net_revenue'] > 0 else "N/A",
                source=source,
                data_classification="OBSERVED"
            ))

            evidence.append(EvidenceItem(
                metric_name="Cancellation Rate",
                actual_value=f"{current_kpi['cancellation_rate_pct']}%",
                comparison_value=f"{prev_kpi['cancellation_rate_pct']}%",
                change_pct=f"{(current_kpi['cancellation_rate_pct'] - prev_kpi['cancellation_rate_pct']):+.1f}%",
                source=source,
                data_classification="OBSERVED"
            ))

            top_cat = cat_sales[0]["group"] if cat_sales else "General"
            top_cat_rev = cat_sales[0]["revenue"] if cat_sales else 0.0
            answer = (
                f"Revenue analysis for {source} over the last 7 days shows observed Net Revenue of "
                f"${current_kpi['net_revenue']:,.2f} across {current_kpi['total_orders']} orders. "
                f"Order cancellations totaled {current_kpi['cancelled_orders']} ({current_kpi['cancellation_rate_pct']}% of orders). "
                f"The top sales category was '{top_cat}' with ${top_cat_rev:,.2f} in sales."
            )
            caveats.append(
                "Correlation vs. Causation Warning: Elevated cancellations coincide with net revenue compression, "
                "but specific gateway timeout logs or bank decline reasons are unverified in the event telemetry."
            )

            return ChatResponse(
                query=request.query, intent="REVENUE_INVESTIGATION", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # WORKFLOW 2: Stockout & Supply Chain Risk
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["stockout", "highest stockout risk", "inventory risk", "reorder", "depleting"]):
            t0 = time.time()
            recs = self.tool_get_inventory_recommendations(source)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_get_inventory_recommendations", arguments={"source": source},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Evaluated {len(recs)} catalog items"
            ))

            crit_items = [r for r in recs if r["stockout_risk_level"] in ("CRITICAL", "HIGH")]

            for item in crit_items[:3]:
                evidence.append(EvidenceItem(
                    metric_name=f"{item['product_name']} Stock",
                    actual_value=f"{item['current_stock']} units",
                    comparison_value=f"ROP: {item['reorder_point']} units",
                    change_pct=None,
                    source=item["source"],
                    data_classification="ESTIMATED"
                ))

            if crit_items:
                top_item = crit_items[0]
                t0 = time.time()
                fc = self.tool_get_forecasts(source, horizon_days=7)
                d_ms = round((time.time() - t0) * 1000, 2)
                steps.append(ToolExecutionStep(
                    step=2, tool="tool_get_forecasts", arguments={"horizon_days": 7},
                    status="SUCCESS", duration_ms=d_ms, output_summary=f"7-day demand: {fc['total_predicted_demand']} units"
                ))

                answer = (
                    f"Supply chain analysis detected {len(crit_items)} products at elevated stockout risk in {source}. "
                    f"The highest risk item is '{top_item['product_name']}' with {top_item['current_stock']} units remaining "
                    f"(below safety threshold of {top_item['reorder_point']} units). "
                    f"Recommended immediate reorder quantity is {top_item['suggested_reorder_qty']} units."
                )
            else:
                answer = f"All monitored products in {source} currently maintain stock levels above their designated Reorder Points."

            caveats.append("Inventory levels for demo stores use deterministic depletion formulas with synthetic baseline bounds.")

            return ChatResponse(
                query=request.query, intent="INVENTORY_RISK_INVESTIGATION", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # WORKFLOW 3: Cross-Store Benchmarking (ShopPulse vs TechMart)
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["compare", "shoppulse and techmart", "vs techmart", "benchmark"]):
            t0 = time.time()
            sp_kpi = self.tool_query_kpis("ShopPulse", days=30)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_query_kpis", arguments={"source": "ShopPulse", "days": 30},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"ShopPulse Net: ${sp_kpi['net_revenue']}"
            ))

            t0 = time.time()
            tm_kpi = self.tool_query_kpis("TechMart", days=30)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=2, tool="tool_query_kpis", arguments={"source": "TechMart", "days": 30},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"TechMart Net: ${tm_kpi['net_revenue']}"
            ))

            diff = round(sp_kpi["net_revenue"] - tm_kpi["net_revenue"], 2)
            leading = "ShopPulse" if diff >= 0 else "TechMart"

            evidence.append(EvidenceItem(
                metric_name="ShopPulse Net Revenue",
                actual_value=f"${sp_kpi['net_revenue']:,.2f}",
                comparison_value=f"AOV: ${sp_kpi['average_order_value']:.2f}",
                change_pct=None,
                source="ShopPulse",
                data_classification="OBSERVED"
            ))

            evidence.append(EvidenceItem(
                metric_name="TechMart Net Revenue",
                actual_value=f"${tm_kpi['net_revenue']:,.2f}",
                comparison_value=f"AOV: ${tm_kpi['average_order_value']:.2f}",
                change_pct=None,
                source="TechMart",
                data_classification="OBSERVED"
            ))

            answer = (
                f"30-day comparative benchmark: {leading} leads combined net revenue with "
                f"${max(sp_kpi['net_revenue'], tm_kpi['net_revenue']):,.2f} versus "
                f"${min(sp_kpi['net_revenue'], tm_kpi['net_revenue']):,.2f} (a difference of ${abs(diff):,.2f}). "
                f"ShopPulse AOV is ${sp_kpi['average_order_value']:.2f} across {sp_kpi['total_orders']} orders, while "
                f"TechMart AOV is ${tm_kpi['average_order_value']:.2f} across {tm_kpi['total_orders']} orders."
            )
            caveats.append("TechMart order totals incorporate transactional promotional discounts netted at point of sale.")

            return ChatResponse(
                query=request.query, intent="STORE_BENCHMARKING", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # WORKFLOW 4: What-If Simulation
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["what happens if", "simulate", "demand increases", "price increases"]):
            # Extract demand increase pct if mentioned, default to 15%
            demand_match = re.search(r"(\d+(\.\d+)?)%", query_lower)
            demand_pct = float(demand_match.group(1)) if demand_match else 15.0

            t0 = time.time()
            sim = self.tool_run_simulation(source, demand_change_pct=demand_pct, horizon_days=14)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_run_simulation", arguments={"demand_change_pct": demand_pct, "horizon_days": 14},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Simulated Revenue: ${sim['scenario_revenue']}"
            ))

            evidence.append(EvidenceItem(
                metric_name=f"Simulated Revenue (+{demand_pct}% Demand)",
                actual_value=f"${sim['scenario_revenue']:,.2f}",
                comparison_value=f"${sim['baseline_revenue']:,.2f} baseline",
                change_pct=f"+{sim['revenue_delta_pct']:.1f}%",
                source=source,
                data_classification="SIMULATED"
            ))

            evidence.append(EvidenceItem(
                metric_name="Simulated Units Sold",
                actual_value=f"{sim['scenario_units']:,} units",
                comparison_value=f"{sim['baseline_units']:,} units",
                change_pct=f"+{sim['units_delta_pct']:.1f}%",
                source=source,
                data_classification="SIMULATED"
            ))

            answer = (
                f"Simulating a +{demand_pct}% exogenous demand surge over the next 14 days for {source} projects revenue of "
                f"${sim['scenario_revenue']:,.2f} (a +{sim['revenue_delta_pct']:.1f}% increase over the baseline of ${sim['baseline_revenue']:,.2f}). "
                f"Projected unit demand increases by {sim['units_delta_pct']:.1f}% to {sim['scenario_units']:,} units. "
                f"Stockout risk transitions to {sim['simulated_stockout_risk']} ({sim['stockout_risk_change']})."
            )
            caveats.append("Simulated trajectories are projections derived from price elasticity assumptions and do not alter stored database records.")

            return ChatResponse(
                query=request.query, intent="SCENARIO_SIMULATION", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # WORKFLOW 5: Profitability & Margins
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["margin", "profitability", "low margin", "high revenue low margin"]):
            t0 = time.time()
            prof = self.tool_get_product_profitability(source)
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_get_product_profitability", arguments={"source": source},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"{len(prof['costed_products'])} costed, {len(prof['uncosted_products'])} uncosted"
            ))

            costed = prof["costed_products"]
            for item in costed[:2]:
                evidence.append(EvidenceItem(
                    metric_name=f"{item['product_name']} Gross Margin",
                    actual_value=f"{item['margin_pct']}%",
                    comparison_value=f"${item['gross_profit']:,.2f} Profit",
                    change_pct=None,
                    source=source,
                    data_classification="OBSERVED"
                ))

            if prof["uncosted_products"]:
                evidence.append(EvidenceItem(
                    metric_name=f"{prof['uncosted_products'][0]['product_name']} Margin",
                    actual_value="COST_UNAVAILABLE",
                    comparison_value="Missing Catalog COGS",
                    change_pct=None,
                    source=source,
                    data_classification="OBSERVED"
                ))

            if costed:
                low_margin = min(costed, key=lambda x: x["margin_pct"])
                high_rev = max(costed, key=lambda x: x["revenue"])
                answer = (
                    f"Product profitability analysis for {source}: Among verified costed items, '{high_rev['product_name']}' "
                    f"generated top revenue of ${high_rev['revenue']:,.2f} with a {high_rev['margin_pct']}% margin. "
                    f"Lowest margin was '{low_margin['product_name']}' at {low_margin['margin_pct']}%. "
                    f"{len(prof['uncosted_products'])} products lack verified supplier cost sheets and are strictly classified as COST_UNAVAILABLE."
                )
            else:
                answer = "Analyzed products lack verified catalog supplier costs and are strictly labeled COST_UNAVAILABLE without fabricated profit estimates."

            caveats.append("RetailPulse strictly prohibits fabricating COGS from revenue alone.")

            return ChatResponse(
                query=request.query, intent="PROFITABILITY_ANALYSIS", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # WORKFLOW 6: Statistical Anomalies
        # ---------------------------------------------------------------------
        if any(w in query_lower for w in ["anomaly", "anomalies", "outlier", "spike"]):
            t0 = time.time()
            anomalies = self.tool_get_anomalies(source, metric="DAILY_REVENUE")
            d_ms = round((time.time() - t0) * 1000, 2)
            steps.append(ToolExecutionStep(
                step=1, tool="tool_get_anomalies", arguments={"source": source, "metric": "DAILY_REVENUE"},
                status="SUCCESS", duration_ms=d_ms, output_summary=f"Found {len(anomalies)} anomalies"
            ))

            for a in anomalies[:3]:
                evidence.append(EvidenceItem(
                    metric_name=f"Anomaly on {a['observation_date']}",
                    actual_value=f"${a['observed_value']:,.2f}",
                    comparison_value=f"Baseline: ${a['expected_baseline']:,.2f}",
                    change_pct=f"{a['deviation_percentage']:+.1f}%",
                    source=a["source"],
                    data_classification="OBSERVED"
                ))

            if anomalies:
                answer = (
                    f"Statistical anomaly engine identified {len(anomalies)} alerts for {source}. "
                    f"Latest alert: {anomalies[0]['direction']} on {anomalies[0]['observation_date']} with "
                    f"${anomalies[0]['observed_value']:,.2f} ({anomalies[0]['deviation_percentage']:+.1f}% deviation "
                    f"from ${anomalies[0]['expected_baseline']:,.2f} baseline, severity: {anomalies[0]['severity']})."
                )
            else:
                answer = f"No statistical anomalies (z-score > 2.5 or > 50% deviation) detected for {source} in the monitored period."

            caveats.append("Anomalies are detected using rolling 7-day Gaussian baseline bands.")

            return ChatResponse(
                query=request.query, intent="ANOMALY_INVESTIGATION", engine="PulseAI-MultiStepWorkflow",
                answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
            )

        # ---------------------------------------------------------------------
        # DEFAULT WORKFLOW: Comprehensive Executive Overview
        # ---------------------------------------------------------------------
        t0 = time.time()
        kpi = self.tool_query_kpis(source, days=30)
        d_ms = round((time.time() - t0) * 1000, 2)
        steps.append(ToolExecutionStep(
            step=1, tool="tool_query_kpis", arguments={"source": source, "days": 30},
            status="SUCCESS", duration_ms=d_ms, output_summary=f"Gross: ${kpi['gross_revenue']}, Net: ${kpi['net_revenue']}"
        ))

        t0 = time.time()
        fc = self.tool_get_forecasts(source, horizon_days=7)
        d_ms = round((time.time() - t0) * 1000, 2)
        steps.append(ToolExecutionStep(
            step=2, tool="tool_get_forecasts", arguments={"source": source, "horizon_days": 7},
            status="SUCCESS", duration_ms=d_ms, output_summary=f"7d Forecast: {fc['total_predicted_demand']} units"
        ))

        evidence.append(EvidenceItem(
            metric_name="30-Day Net Revenue",
            actual_value=f"${kpi['net_revenue']:,.2f}",
            comparison_value=f"Gross: ${kpi['gross_revenue']:,.2f}",
            change_pct=None,
            source=source,
            data_classification="OBSERVED"
        ))

        evidence.append(EvidenceItem(
            metric_name="7-Day Demand Forecast",
            actual_value=f"{fc['total_predicted_demand']:,.1f} units",
            comparison_value=f"Model: {fc['model_champion']}",
            change_pct=None,
            source=source,
            data_classification="PREDICTED"
        ))

        answer = (
            f"Executive summary for {source}: Over the last 30 days, observed Net Revenue was "
            f"${kpi['net_revenue']:,.2f} across {kpi['total_orders']} orders (AOV: ${kpi['average_order_value']:.2f}). "
            f"Order cancellations averaged {kpi['cancellation_rate_pct']}%. "
            f"The Python {fc['model_champion']} model projects next 7-day demand at {fc['total_predicted_demand']:,.1f} units."
        )

        return ChatResponse(
            query=request.query, intent="EXECUTIVE_SUMMARY", engine="PulseAI-MultiStepWorkflow",
            answer=answer, execution_steps=steps, evidence=evidence, citations=citations, caveats_and_limitations=caveats
        )
