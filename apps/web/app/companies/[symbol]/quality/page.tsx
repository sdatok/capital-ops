"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getQualityScore } from "@/lib/apiClient";
import type { QualityScore, ScoreComponent } from "@/lib/types";

const GRADE_STYLES: Record<string, { ring: string; text: string; bg: string; badge: string }> = {
  emerald: {
    ring:  "ring-emerald-400",
    text:  "text-emerald-400",
    bg:    "bg-emerald-500/10",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  indigo: {
    ring:  "ring-indigo-400",
    text:  "text-indigo-400",
    bg:    "bg-indigo-500/10",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  amber: {
    ring:  "ring-amber-400",
    text:  "text-amber-400",
    bg:    "bg-amber-500/10",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  orange: {
    ring:  "ring-orange-400",
    text:  "text-orange-400",
    bg:    "bg-orange-500/10",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },
  red: {
    ring:  "ring-red-400",
    text:  "text-red-400",
    bg:    "bg-red-500/10",
    badge: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

const COMPONENT_ACCENTS: Record<string, string> = {
  fcf_margin:        "bg-indigo-500",
  cash_conversion:   "bg-violet-500",
  capex_efficiency:  "bg-sky-500",
  operating_margin:  "bg-emerald-500",
  growth_quality:    "bg-amber-500",
};

function formatRawValue(key: string, value: number | null): string {
  if (value === null) return "N/A";
  if (key === "cash_conversion") return `${value.toFixed(2)}×`;
  return `${(value * 100).toFixed(1)}%`;
}

export default function QualityScorePage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const [data, setData] = useState<QualityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getQualityScore(symbol)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <LoadingSkeleton symbol={symbol} />;
  if (error || !data) return <ErrorState symbol={symbol} message={error ?? "Unknown error"} />;

  const styles = GRADE_STYLES[data.grade_color] ?? GRADE_STYLES.indigo;
  const circumference = 2 * Math.PI * 44; // r=44
  const dashOffset = circumference * (1 - data.total_score / 100);

  return (
    <div>
      <Link
        href={`/companies/${symbol}`}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors mb-6 group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to {symbol} overview
      </Link>

      {/* Hero score card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">

          {/* Score ring */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className={`${styles.text} transition-all duration-700`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold tabular-nums ${styles.text}`}>
                  {Math.round(data.total_score)}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">/ 100</span>
              </div>
            </div>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold ${styles.badge}`}>
              {data.grade}
              <span className="text-xs font-normal opacity-80">— {data.grade_label}</span>
            </div>
          </div>

          {/* Summary text */}
          <div className="flex-1">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Capital Allocation Quality Score</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{data.name}</h1>
            <p className="text-slate-400 text-sm mb-4">{data.symbol} · {data.periods_analyzed}-year analysis</p>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">{data.summary}</p>
          </div>
        </div>

        {/* Mini score bar */}
        <div className="relative mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-500">0</span>
            <div className="flex-1 relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${styles.text.replace("text-", "bg-")}`}
                style={{ width: `${data.total_score}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">100</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 px-3 -mt-0.5">
            <span>F · Poor</span>
            <span>D</span>
            <span>C · Average</span>
            <span>B</span>
            <span>A+ · Elite</span>
          </div>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Score breakdown</span>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">{data.total_score.toFixed(1)} / 100 pts total</span>
        </div>

        <div className="flex flex-col gap-3">
          {data.components.map((comp) => (
            <ComponentRow key={comp.key} component={comp} />
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-slate-950 rounded-2xl p-7">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">How the score is calculated</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {data.components.map((comp) => (
            <div key={comp.key} className="border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{comp.name}</p>
                <span className="text-xs text-slate-500 font-mono">{(comp.weight * 100).toFixed(0)}% weight</span>
              </div>
              <p className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded mb-2 leading-relaxed">
                {comp.formula}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{comp.benchmark}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-500 leading-relaxed">
          <div>
            <p className="text-slate-300 font-semibold mb-1">Why these five metrics?</p>
            <p>Together they capture whether a business generates real cash (FCF margin), whether its accounting is trustworthy (cash conversion), how asset-efficient its model is (capex), how well it controls costs (operating margin), and whether growth is creating or destroying value (growth quality).</p>
          </div>
          <div>
            <p className="text-slate-300 font-semibold mb-1">Why absolute benchmarks, not relative?</p>
            <p>Using absolute thresholds means this score works for any publicly traded company — not just the ones pre-seeded in this app. A 25% FCF margin is excellent in any sector. Relative rankings would require a complete peer universe, which we don't always have.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentRow({ component: c }: { component: ScoreComponent }) {
  const fillPct = (c.points_earned / c.points_max) * 100;
  const accent = COMPONENT_ACCENTS[c.key] ?? "bg-indigo-500";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{c.name}</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              {(c.weight * 100).toFixed(0)}% weight
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{c.interpretation}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">
            {c.points_earned.toFixed(1)}
            <span className="text-sm text-gray-400 font-normal"> / {c.points_max.toFixed(0)}</span>
          </p>
          {c.raw_value !== null && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {formatRawValue(c.key, c.raw_value)}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${accent}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton({ symbol }: { symbol: string }) {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
      <div className="bg-slate-900 rounded-2xl h-48 mb-8" />
      <div className="h-4 w-40 bg-gray-200 rounded mb-5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl h-20 mb-3" />
      ))}
    </div>
  );
}

function ErrorState({ symbol, message }: { symbol: string; message: string }) {
  return (
    <div>
      <Link
        href={`/companies/${symbol}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-6"
      >
        ← Back to {symbol} overview
      </Link>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        <p className="font-semibold mb-1">Could not load quality score for {symbol}</p>
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
}
