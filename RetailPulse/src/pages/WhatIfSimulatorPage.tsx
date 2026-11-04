import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import { SegmentedControl } from '../components/common/SegmentedControl';
import {
  Sliders,
  Play,
  RotateCcw,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Package,
  DollarSign,
  ShieldAlert,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ScenarioResult {
  scenario_name: string;
  assumptions: {
    source: string;
    product_id: string | null;
    price_change_pct: number;
    demand_change_pct: number;
    price_elasticity: number;
    effective_demand_multiplier: number;
    inventory_delta_pct: number;
    lead_time_days_delta: number;
    horizon_days: number;
  };
  baseline: {
    period_days: number;
    projected_units: number;
    projected_revenue: number;
    current_stock: number;
    lead_time_days: number;
    stockout_risk: string;
    projected_cost: number | null;
    projected_gross_profit: number | null;
    gross_margin_pct: number | null;
  };
  scenario: {
    projected_units: number;
    projected_revenue: number;
    simulated_stock: number;
    effective_lead_time_days: number;
    stockout_risk: string;
    stockout_day: number | null;
    projected_cost: number | null;
    projected_gross_profit: number | null;
    gross_margin_pct: number | null;
  };
  impact: {
    revenue_delta: number;
    revenue_delta_pct: number;
    units_delta: number;
    units_delta_pct: number;
    stockout_risk_change: string;
    profit_delta: number | null;
    profit_delta_pct: number | null;
  };
  trajectory: Array<{
    day: number;
    date: string;
    baseline_units: number;
    baseline_revenue: number;
    scenario_units: number;
    scenario_revenue: number;
    scenario_stock_level: number;
  }>;
  warnings: string[];
  computation_method: string;
}

const normalizeSimulationData = (raw: any): ScenarioResult => {
  if (!raw) {
    throw new Error('Simulation response payload is empty');
  }

  // If already in ScenarioResult format:
  if (raw.scenario && raw.baseline && raw.impact) {
    return raw as ScenarioResult;
  }

  const bm = raw.baseline_metrics || {};
  const sm = raw.simulated_metrics || {};
  const pc = raw.percentage_changes || {};
  const ii = raw.inventory_impact || {};
  const pi = raw.profitability_impact || {};

  const baseline_rev = Number(bm.total_revenue ?? 0);
  const simulated_rev = Number(sm.total_revenue ?? 0);
  const rev_delta = simulated_rev - baseline_rev;
  const rev_delta_pct = pc.revenue_pct_change ?? (baseline_rev > 0 ? (rev_delta / baseline_rev) * 100 : 0);

  const baseline_units = Number(bm.total_units ?? 0);
  const simulated_units = Number(sm.total_units ?? 0);
  const units_delta = simulated_units - baseline_units;
  const units_delta_pct = pc.units_pct_change ?? (baseline_units > 0 ? (units_delta / baseline_units) * 100 : 0);

  const traj = (raw.daily_trajectory || []).map((pt: any, idx: number) => ({
    day: idx + 1,
    date: pt.date || `Day ${idx + 1}`,
    baseline_units: Number(pt.baseline_units ?? 0),
    baseline_revenue: Number(pt.baseline_revenue ?? 0),
    scenario_units: Number(pt.simulated_units ?? pt.scenario_units ?? 0),
    scenario_revenue: Number(pt.simulated_revenue ?? pt.scenario_revenue ?? 0),
    scenario_stock_level: Number(pt.projected_stock_level ?? pt.scenario_stock_level ?? 0)
  }));

  return {
    scenario_name: raw.product_name || raw.scenario_id || 'What-If Simulation',
    assumptions: {
      source: raw.source || 'ALL SOURCES',
      product_id: raw.product_id || null,
      price_change_pct: Number(raw.assumptions?.price_change_percentage ?? raw.assumptions?.price_change_pct ?? 0),
      demand_change_pct: Number(raw.assumptions?.demand_change_percentage ?? raw.assumptions?.demand_change_pct ?? 0),
      price_elasticity: Number(raw.assumptions?.price_elasticity ?? -1.2),
      effective_demand_multiplier: 1.0,
      inventory_delta_pct: Number(raw.assumptions?.inventory_adjustment_percentage ?? raw.assumptions?.inventory_delta_pct ?? 0),
      lead_time_days_delta: Number(raw.assumptions?.lead_time_days_delta ?? 0),
      horizon_days: Number(raw.horizon_days ?? 14)
    },
    baseline: {
      period_days: Number(raw.horizon_days ?? 14),
      projected_units: baseline_units,
      projected_revenue: baseline_rev,
      current_stock: Number(ii.initial_available_stock ?? 150),
      lead_time_days: Number(raw.assumptions?.effective_lead_time_days ?? 5),
      stockout_risk: String(bm.stockout_risk_level || 'LOW'),
      projected_cost: pi.wholesale_unit_cost ? pi.wholesale_unit_cost * baseline_units : null,
      projected_gross_profit: bm.gross_profit !== undefined ? bm.gross_profit : null,
      gross_margin_pct: bm.gross_margin_pct !== undefined ? bm.gross_margin_pct : null
    },
    scenario: {
      projected_units: simulated_units,
      projected_revenue: simulated_rev,
      simulated_stock: Number(ii.projected_closing_stock ?? 150),
      effective_lead_time_days: Number(raw.assumptions?.effective_lead_time_days ?? 5),
      stockout_risk: String(sm.stockout_risk_level || 'LOW'),
      stockout_day: ii.days_until_stockout ?? null,
      projected_cost: pi.wholesale_unit_cost ? pi.wholesale_unit_cost * simulated_units : null,
      projected_gross_profit: sm.gross_profit !== undefined ? sm.gross_profit : null,
      gross_margin_pct: sm.gross_margin_pct !== undefined ? sm.gross_margin_pct : null
    },
    impact: {
      revenue_delta: rev_delta,
      revenue_delta_pct: Number(rev_delta_pct),
      units_delta: units_delta,
      units_delta_pct: Number(units_delta_pct),
      stockout_risk_change: `${bm.stockout_risk_level || 'LOW'} → ${sm.stockout_risk_level || 'LOW'}`,
      profit_delta: pi.profit_delta !== undefined ? pi.profit_delta : null,
      profit_delta_pct: pc.profit_pct_change !== undefined ? pc.profit_pct_change : null
    },
    trajectory: traj,
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    computation_method: 'Python 3.11 Statsmodels & Elasticity Engine'
  };
};

export const WhatIfSimulatorPage: React.FC = () => {
  const { selectedSource, theme } = useDashboard();
  const isDark = theme === 'dark';

  // Scenario parameters
  const [priceChange, setPriceChange] = useState<number>(0);
  const [demandChange, setDemandChange] = useState<number>(0);
  const [elasticity, setElasticity] = useState<number>(-1.2);
  const [inventoryDelta, setInventoryDelta] = useState<number>(0);
  const [leadTimeDelta, setLeadTimeDelta] = useState<number>(0);
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [scenarioTitle, setScenarioTitle] = useState<string>('Holiday Demand Surge');

  // Execution state
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Run simulation
  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccessMsg(null);

    try {
      const src = selectedSource === 'ALL SOURCES' ? 'ALL SOURCES' : selectedSource;
      const res = await retailPulseApiService.simulateScenario({
        source: src,
        price_change_pct: priceChange,
        demand_change_pct: demandChange,
        price_elasticity: elasticity,
        inventory_delta_pct: inventoryDelta,
        lead_time_days_delta: leadTimeDelta,
        horizon_days: horizonDays
      });

      if (res && res.success && res.data) {
        setResult(normalizeSimulationData(res.data));
      } else {
        setError(res?.message || 'Failed to compute scenario. Verify Python ML service is running.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing what-if simulation');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedScenarios = async () => {
    try {
      const list = await retailPulseApiService.getSavedScenarios();
      if (list) {
        setSavedScenarios(list);
      }
    } catch (e) {
      console.warn('Failed to load saved scenarios:', e);
    }
  };

  useEffect(() => {
    runSimulation();
    loadSavedScenarios();
  }, [selectedSource]);

  const handleReset = () => {
    setPriceChange(0);
    setDemandChange(0);
    setElasticity(-1.2);
    setInventoryDelta(0);
    setLeadTimeDelta(0);
    setHorizonDays(14);
  };

  const handleSaveScenario = async () => {
    if (!result) return;
    const nameToSave = scenarioTitle.trim() || `Scenario ${new Date().toLocaleDateString()}`;
    const payload = {
      name: nameToSave,
      assumptions: {
        source: selectedSource,
        price_change_pct: priceChange,
        demand_change_pct: demandChange,
        price_elasticity: elasticity,
        inventory_delta_pct: inventoryDelta,
        lead_time_days_delta: leadTimeDelta,
        horizon_days: horizonDays
      },
      results: {
        revenue_delta: result.impact.revenue_delta,
        revenue_delta_pct: result.impact.revenue_delta_pct,
        units_delta: result.impact.units_delta,
        stockout_risk: result.scenario.stockout_risk,
        projected_revenue: result.scenario.projected_revenue
      }
    };

    const ok = await retailPulseApiService.saveScenario(payload);
    if (ok) {
      setSaveSuccessMsg(`Scenario "${nameToSave}" saved successfully!`);
      loadSavedScenarios();
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    const ok = await retailPulseApiService.deleteScenario(id);
    if (ok) {
      loadSavedScenarios();
    }
  };

  const handleLoadSavedScenario = (item: any) => {
    if (item.assumptions) {
      setPriceChange(item.assumptions.price_change_pct ?? 0);
      setDemandChange(item.assumptions.demand_change_pct ?? 0);
      setElasticity(item.assumptions.price_elasticity ?? -1.2);
      setInventoryDelta(item.assumptions.inventory_delta_pct ?? 0);
      setLeadTimeDelta(item.assumptions.lead_time_days_delta ?? 0);
      setHorizonDays(item.assumptions.horizon_days ?? 14);
      setScenarioTitle(item.name || 'Custom Scenario');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">What-If Business Simulator</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Python ML Driven
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Simulate price elasticity, demand shifts, and supply chain lead times with statistical forecast baselines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#18181b] border-neutral-800 text-neutral-300 hover:bg-[#222226]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
            title="Reset simulation parameters to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full bg-neutral-950 text-white dark:bg-white dark:text-black shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Disclaimers & Calculation Architecture Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Deterministic & Predictive Calculation Pipeline</p>
          <p className="mt-0.5 text-blue-700 dark:text-blue-400">
            Simulations execute directly on the Python FastAPI service (<code className="font-mono">POST /api/predictive/simulation</code>).
            Baselines utilize empirical historical sales and inventory velocity. Demand responses incorporate user-defined price elasticity
            (<code className="font-mono">%ΔQ = PriceElasticity × %ΔP + %ΔDemand</code>). Simulated trajectories are hypothetical projections and do not alter production database state.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-xl p-4 text-sm text-green-700 dark:text-green-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Controls & Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Interactive Sliders */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" /> Scenario Controls
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{selectedSource}</span>
          </div>

          {/* Price Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">Price Adjustment</label>
              <span className={`font-mono font-bold ${priceChange > 0 ? 'text-green-600 dark:text-green-400' : priceChange < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-50% (Discount)</span>
              <span>0% (Baseline)</span>
              <span>+100% (Premium)</span>
            </div>
          </div>

          {/* Demand Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">Exogenous Demand Shift</label>
              <span className={`font-mono font-bold ${demandChange > 0 ? 'text-indigo-600 dark:text-indigo-400' : demandChange < 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                {demandChange > 0 ? `+${demandChange}%` : `${demandChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="150"
              step="5"
              value={demandChange}
              onChange={(e) => setDemandChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-50% (Slump)</span>
              <span>0% (Neutral)</span>
              <span>+150% (Viral/Surge)</span>
            </div>
          </div>

          {/* Price Elasticity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">Price Elasticity (ε)</label>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                {elasticity.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-2.5"
              max="-0.2"
              step="0.1"
              value={elasticity}
              onChange={(e) => setElasticity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-2.5 (Elastic)</span>
              <span>-1.2 (Standard)</span>
              <span>-0.2 (Inelastic)</span>
            </div>
          </div>

          {/* Inventory Starting Stock Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">Inventory Level Shift</label>
              <span className={`font-mono font-bold ${inventoryDelta > 0 ? 'text-blue-600 dark:text-blue-400' : inventoryDelta < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {inventoryDelta > 0 ? `+${inventoryDelta}%` : `${inventoryDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-75"
              max="100"
              step="5"
              value={inventoryDelta}
              onChange={(e) => setInventoryDelta(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-75% (Shortage)</span>
              <span>0% (Normal)</span>
              <span>+100% (Overstocked)</span>
            </div>
          </div>

          {/* Lead Time Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">Supplier Lead Time Delta</label>
              <span className={`font-mono font-bold ${leadTimeDelta > 0 ? 'text-amber-500' : leadTimeDelta < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                {leadTimeDelta > 0 ? `+${leadTimeDelta} Days` : `${leadTimeDelta} Days`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="15"
              step="1"
              value={leadTimeDelta}
              onChange={(e) => setLeadTimeDelta(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-5d (Expedited)</span>
              <span>0d (Normal)</span>
              <span>+15d (Disrupted)</span>
            </div>
          </div>

          {/* Horizon Selection Segmented Control */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" /> Forecast Horizon
            </label>
            <SegmentedControl
              value={horizonDays}
              onChange={(days) => setHorizonDays(days as any)}
              className="w-full flex justify-between"
              options={[
                { value: 7, label: '7 Days' },
                { value: 14, label: '14 Days' },
                { value: 30, label: '30 Days' }
              ]}
            />
          </div>

          {/* Save Scenario Form */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Save Current Configuration</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="Scenario label..."
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveScenario}
                disabled={!result}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Col (2 cols): KPIs, Comparison & Trajectory */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Output Cards */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Projected Revenue */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Projected Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  ${result.scenario.projected_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {result.impact.revenue_delta_pct >= 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      +{result.impact.revenue_delta_pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {result.impact.revenue_delta_pct.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-gray-400">vs baseline</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Baseline: ${result.baseline.projected_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Units Sold */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Projected Units</span>
                  <Package className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {result.scenario.projected_units.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {result.impact.units_delta_pct >= 0 ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      +{result.impact.units_delta_pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {result.impact.units_delta_pct.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-gray-400">vs baseline</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Baseline: {result.baseline.projected_units.toLocaleString()} units
                </div>
              </div>

              {/* Stockout Risk */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Stockout Risk</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg font-bold mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs uppercase font-extrabold tracking-wider ${
                      result.scenario.stockout_risk === 'HIGH'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : result.scenario.stockout_risk === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    }`}
                  >
                    {result.scenario.stockout_risk}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {result.scenario.stockout_day
                    ? `Depletes on Day ${result.scenario.stockout_day}`
                    : 'Stock covers horizon'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  End Stock: {result.scenario.simulated_stock.toLocaleString()} units
                </div>
              </div>

              {/* Gross Margin / Profitability */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Gross Margin</span>
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {result.scenario.gross_margin_pct !== null ? (
                    `${result.scenario.gross_margin_pct.toFixed(1)}%`
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">COST UNAVAILABLE</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {result.scenario.projected_gross_profit !== null ? (
                    `$${result.scenario.projected_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 0 })} Profit`
                  ) : (
                    <span className="text-[10px] text-amber-500">Uncosted Catalog</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Lead Time: {result.scenario.effective_lead_time_days} days
                </div>
              </div>
            </div>
          )}

          {/* Warnings Banner if any */}
          {result && result.warnings && result.warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Simulation Risk Warnings Detected ({result.warnings.length})</span>
              </div>
              <ul className="list-disc pl-5 text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Trajectory Simulation Chart */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Projected Revenue Trajectory: Baseline vs. Simulated
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily simulated revenue over the {horizonDays}-day horizon taking elasticity into account.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-3 h-0.5 bg-gray-400 inline-block"></span> Baseline
                </span>
                <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                  <span className="w-3 h-1 bg-indigo-600 inline-block rounded"></span> Simulated
                </span>
              </div>
            </div>

            <div className="h-72 w-full mt-4">
              {result && result.trajectory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.trajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 11 }} />
                    <YAxis
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderColor: isDark ? '#374151' : '#e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: any) => [
                        `$${Number(value).toFixed(2)}`,
                        name === 'scenario_revenue' ? 'Simulated Revenue' : 'Baseline Revenue'
                      ]}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="baseline_revenue"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorBaseline)"
                      name="baseline_revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="scenario_revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorScenario)"
                      name="scenario_revenue"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  Execute simulation to render trajectory chart
                </div>
              )}
            </div>
          </div>

          {/* Comparison Breakdown Table */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Comprehensive Baseline vs. Scenario Comparison
                </h3>
                <span className="text-xs font-mono text-gray-500">Method: {result.computation_method}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Metric Dimension</th>
                      <th className="px-4 py-2.5">Baseline (Empirical)</th>
                      <th className="px-4 py-2.5">Simulated Scenario</th>
                      <th className="px-4 py-2.5">Absolute Impact</th>
                      <th className="px-4 py-2.5">Variance (%Δ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-2.5 font-sans font-medium text-gray-900 dark:text-gray-100">Gross Revenue</td>
                      <td className="px-4 py-2.5">${result.baseline.projected_revenue.toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                        ${result.scenario.projected_revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">
                        {result.impact.revenue_delta >= 0 ? `+$${result.impact.revenue_delta.toFixed(2)}` : `-$${Math.abs(result.impact.revenue_delta).toFixed(2)}`}
                      </td>
                      <td className={`px-4 py-2.5 font-bold ${result.impact.revenue_delta_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {result.impact.revenue_delta_pct >= 0 ? `+${result.impact.revenue_delta_pct.toFixed(1)}%` : `${result.impact.revenue_delta_pct.toFixed(1)}%`}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-2.5 font-sans font-medium text-gray-900 dark:text-gray-100">Units Sold</td>
                      <td className="px-4 py-2.5">{result.baseline.projected_units}</td>
                      <td className="px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">{result.scenario.projected_units}</td>
                      <td className="px-4 py-2.5">
                        {result.impact.units_delta >= 0 ? `+${result.impact.units_delta}` : `${result.impact.units_delta}`}
                      </td>
                      <td className={`px-4 py-2.5 font-bold ${result.impact.units_delta_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {result.impact.units_delta_pct >= 0 ? `+${result.impact.units_delta_pct.toFixed(1)}%` : `${result.impact.units_delta_pct.toFixed(1)}%`}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-2.5 font-sans font-medium text-gray-900 dark:text-gray-100">Ending Stock Level</td>
                      <td className="px-4 py-2.5">{result.baseline.current_stock}</td>
                      <td className="px-4 py-2.5">{result.scenario.simulated_stock}</td>
                      <td className="px-4 py-2.5">{result.scenario.simulated_stock - result.baseline.current_stock}</td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {result.baseline.current_stock > 0
                          ? `${(((result.scenario.simulated_stock - result.baseline.current_stock) / result.baseline.current_stock) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-2.5 font-sans font-medium text-gray-900 dark:text-gray-100">Stockout Risk Level</td>
                      <td className="px-4 py-2.5">{result.baseline.stockout_risk}</td>
                      <td className="px-4 py-2.5 font-bold">{result.scenario.stockout_risk}</td>
                      <td className="px-4 py-2.5" colSpan={2}>
                        <span className="text-gray-500 font-sans text-xs">{result.impact.stockout_risk_change}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Scenarios Catalog */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Saved Scenario Catalog</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Persisted in connector storage. Load past scenarios to reproduce forecasts.
            </p>
          </div>
          <span className="text-xs text-gray-400">{savedScenarios.length} Scenarios</span>
        </div>

        {savedScenarios.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No saved scenarios yet. Use the Save button above to store scenarios.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {savedScenarios.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col justify-between space-y-2 hover:border-indigo-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                    <button
                      onClick={() => handleDeleteScenario(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Delete scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                    <div>Price: {item.assumptions?.price_change_pct > 0 ? `+${item.assumptions.price_change_pct}%` : `${item.assumptions?.price_change_pct}%`} | Demand: {item.assumptions?.demand_change_pct > 0 ? `+${item.assumptions.demand_change_pct}%` : `${item.assumptions?.demand_change_pct}%`}</div>
                    <div>Horizon: {item.assumptions?.horizon_days || 14}d | Risk: {item.results?.stockout_risk || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Persisted'}
                  </span>
                  <button
                    onClick={() => handleLoadSavedScenario(item)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Load Assumptions →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default WhatIfSimulatorPage;
