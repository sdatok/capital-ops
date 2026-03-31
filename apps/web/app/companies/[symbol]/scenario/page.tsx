"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { generateMemo, projectScenarios, saveAnalysis } from "@/lib/apiClient";
import { fmtBillions, fmtPct, fmtPctSigned } from "@/lib/format";
import type { MemoResponse, ScenarioInputs, ScenarioProjection, ScenarioResponse } from "@/lib/types";
import Tooltip from "@/components/Tooltip";

const DEFAULT_INPUTS: ScenarioInputs = {
  bull: { revenue_growth: 0.15, operating_margin: 0.28, fcf_margin: 0.22 },
  base: { revenue_growth: 0.08, operating_margin: 0.22, fcf_margin: 0.17 },
  bear: { revenue_growth: 0.02, operating_margin: 0.15, fcf_margin: 0.10 },
};

type ScenarioKey = "bull" | "base" | "bear";

const SCENARIO_META: Record<ScenarioKey, { label: string; color: string; bg: string; border: string; tooltip: string }> = {
  bull: { label: "Bull", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tooltip: "Optimistic scenario — assumes strong execution, favorable market conditions, and above-trend growth." },
  base: { label: "Base", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    tooltip: "Most likely scenario — assumes current trends continue at a moderate pace with no major surprises." },
  bear: { label: "Bear", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     tooltip: "Pessimistic scenario — assumes headwinds, margin pressure, or slower-than-expected growth." },
};

const INPUT_TOOLTIPS = {
  revenue_growth:    "How much you expect the company's total sales to grow over the next 12 months.",
  operating_margin:  "The % of projected revenue you expect to remain as operating profit after all costs.",
  fcf_margin:        "The % of projected revenue you expect to convert into free cash flow — real cash after capex.",
};

function NumberInput({
  label, value, onChange, isPercent = true, tooltip,
}: { label: string; value: number; onChange: (v: number) => void; isPercent?: boolean; tooltip?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs text-gray-500">{label}</label>
        {tooltip && <Tooltip text={tooltip} width="lg" />}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={isPercent ? 0.5 : 0.01}
          value={isPercent ? +(value * 100).toFixed(1) : value}
          onChange={(e) => onChange(isPercent ? parseFloat(e.target.value) / 100 : parseFloat(e.target.value))}
          className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isPercent && <span className="text-xs text-gray-400">%</span>}
      </div>
    </div>
  );
}

export default function ScenarioPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const [inputs, setInputs] = useState<ScenarioInputs>(DEFAULT_INPUTS);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("base");
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [memo, setMemo] = useState<MemoResponse | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memoLoading, setMemoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAssumption(scenario: ScenarioKey, field: keyof ScenarioInputs["bull"], value: number) {
    setInputs((prev) => ({ ...prev, [scenario]: { ...prev[scenario], [field]: value } }));
    setResult(null);
    setMemo(null);
    setSavedId(null);
  }

  async function runProjection() {
    setLoading(true);
    setError(null);
    setMemo(null);
    setSavedId(null);
    try {
      setResult(await projectScenarios(symbol, inputs));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function runMemo() {
    setMemoLoading(true);
    try {
      setMemo(await generateMemo(symbol, selectedScenario, inputs));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setMemoLoading(false);
    }
  }

  async function handleSave() {
    if (!memo) return;
    setSaving(true);
    try {
      const { id } = await saveAnalysis({
        company_symbol: symbol,
        peer_symbols: [],
        scenario_inputs: inputs,
        selected_scenario: selectedScenario,
        memo_text: memo.memo_text,
      });
      setSavedId(id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const selectedProjection = result?.projections.find(
    (p) => p.label.toLowerCase() === selectedScenario
  ) ?? null;

  return (
    <div>
      <Link
        href={`/companies/${symbol}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
      >
        ← Back to {symbol} overview
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scenario Builder</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set bull, base, and bear assumptions for <span className="font-medium text-gray-700">{symbol}</span>.
          Projections apply your assumptions to the most recent reported revenue.
        </p>
      </div>

      {/* Assumption inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {(["bull", "base", "bear"] as ScenarioKey[]).map((sc) => {
          const meta = SCENARIO_META[sc];
          return (
            <div key={sc} className={`bg-white border ${meta.border} rounded-xl p-5`}>
              <div className="flex items-center gap-1.5 mb-4">
                <p className={`text-sm font-bold ${meta.color}`}>{meta.label} Case</p>
                <Tooltip text={meta.tooltip} width="lg" />
              </div>
              <div className="flex flex-col gap-3">
                <NumberInput
                  label="Revenue Growth"
                  value={inputs[sc].revenue_growth}
                  onChange={(v) => updateAssumption(sc, "revenue_growth", v)}
                  tooltip={INPUT_TOOLTIPS.revenue_growth}
                />
                <NumberInput
                  label="Operating Margin"
                  value={inputs[sc].operating_margin}
                  onChange={(v) => updateAssumption(sc, "operating_margin", v)}
                  tooltip={INPUT_TOOLTIPS.operating_margin}
                />
                <NumberInput
                  label="FCF Margin"
                  value={inputs[sc].fcf_margin}
                  onChange={(v) => updateAssumption(sc, "fcf_margin", v)}
                  tooltip={INPUT_TOOLTIPS.fcf_margin}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={runProjection}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors mb-6"
      >
        {loading ? "Running…" : "Run projections"}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Scenario selector + output cards */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {(["bull", "base", "bear"] as ScenarioKey[]).map((sc) => {
                const meta = SCENARIO_META[sc];
                return (
                  <button
                    key={sc}
                    onClick={() => { setSelectedScenario(sc); setMemo(null); setSavedId(null); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedScenario === sc
                        ? `${meta.bg} ${meta.border} ${meta.color}`
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {selectedProjection && (
              <ProjectionCards
                projection={selectedProjection}
                baseRevenue={result.base_revenue}
                basePeriod={result.base_period}
              />
            )}
          </div>

          {/* Memo generation */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Analyst Memo</p>
              <button
                onClick={runMemo}
                disabled={memoLoading}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
              >
                {memoLoading ? "Generating…" : memo ? "Regenerate ↺" : "Generate memo →"}
              </button>
            </div>

            {memo ? (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-4">
                {memo.memo_text}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Select a scenario and click &ldquo;Generate memo&rdquo; to produce a deterministic analyst summary.
              </p>
            )}
          </div>

          {/* Save */}
          {memo && !savedId && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Save analysis"}
            </button>
          )}

          {savedId && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm">
              Analysis saved — ID: <span className="font-mono font-bold">{savedId}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProjectionCards({
  projection, baseRevenue, basePeriod,
}: { projection: ScenarioProjection; baseRevenue: number; basePeriod: string }) {
  const a = projection.assumptions;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projected Revenue</p>
        <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{fmtBillions(projection.projected_revenue)}</p>
        <p className="text-xs text-gray-400 mt-1">vs {fmtBillions(baseRevenue)} in FY{basePeriod}</p>
        <p className="text-xs text-emerald-600 font-medium mt-1">{fmtPctSigned(a.revenue_growth)} growth assumed</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projected Op. Income</p>
        <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{fmtBillions(projection.projected_operating_income)}</p>
        <p className="text-xs text-gray-400 mt-1">{fmtPct(a.operating_margin)} op. margin assumed</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projected FCF</p>
        <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{fmtBillions(projection.projected_fcf)}</p>
        <p className="text-xs text-gray-400 mt-1">{fmtPct(a.fcf_margin)} FCF margin assumed</p>
      </div>
    </div>
  );
}
