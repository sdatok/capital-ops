"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchCompanies } from "@/lib/apiClient";
import type { CompanySearchResult } from "@/lib/types";

const SECTOR_COLORS: Record<string, string> = {
  Technology: "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Consumer Discretionary": "bg-orange-50 text-orange-700 border-orange-100",
  "Consumer Staples": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Communication Services": "bg-violet-50 text-violet-700 border-violet-100",
  Financials: "bg-sky-50 text-sky-700 border-sky-100",
  Healthcare: "bg-rose-50 text-rose-700 border-rose-100",
  Energy: "bg-amber-50 text-amber-700 border-amber-100",
  Industrials: "bg-slate-50 text-slate-600 border-slate-100",
};

function sectorBadge(sector: string): string {
  return SECTOR_COLORS[sector] ?? "bg-gray-50 text-gray-500 border-gray-100";
}

const STATS = [
  { value: "10", label: "Companies with full data" },
  { value: "5 yrs", label: "Annual financials" },
  { value: "6", label: "Core efficiency metrics" },
  { value: "3", label: "Scenario models" },
];

export default function HomePage() {
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      searchCompanies(query)
        .then(setCompanies)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(timeout);
  }, [query]);

  const seeded = companies.filter((c) => c.has_data);
  const unseeded = companies.filter((c) => !c.has_data);
  const showUnseeded = query.trim().length > 0 && unseeded.length > 0;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-14 mb-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium tracking-wide">
              Institutional-grade analytics
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-3">
            Understand how companies
            <br />
            <span className="text-indigo-400">actually</span> deploy capital.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-xl">
            Capital Ops surfaces the metrics that matter to fundamental investors — operating
            efficiency, cash conversion, capex discipline, and margin trends — across 5 years of
            audited financials.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search ticker or company name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/8 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-10 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-6">
          <p className="font-semibold mb-0.5">Could not reach the API</p>
          <p className="text-red-500 text-xs">
            Make sure the backend is running at{" "}
            <code className="font-mono">{process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}</code>
          </p>
        </div>
      )}

      {/* Full data companies */}
      {!error && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {query ? `Results — full data` : "Full coverage"}
            </h2>
            {!query && (
              <span className="text-xs text-gray-400">{seeded.length} companies</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : seeded.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {seeded.map((c) => (
                <CompanyCard key={c.symbol} company={c} />
              ))}
            </div>
          ) : (
            !showUnseeded && (
              <p className="text-sm text-gray-400 mb-8">No companies match your search.</p>
            )
          )}

          {/* Unseeded companies — show only when searching */}
          {showUnseeded && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  In universe — no data seeded
                </h2>
                <span className="text-xs text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {unseeded.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                {unseeded.map((c) => (
                  <UnseededCard key={c.symbol} company={c} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Footer hint */}
      {!query && !loading && !error && (
        <p className="text-xs text-gray-400 border-t border-gray-100 pt-6">
          Showing 10 companies with full 5-year financials. Search to see the full 58-company universe. 
          Run <code className="font-mono bg-gray-100 px-1 rounded">python -m scripts.refresh_seed_data</code> from{" "}
          <code className="font-mono bg-gray-100 px-1 rounded">apps/api</code> to seed additional companies.
        </p>
      )}
    </div>
  );
}

function CompanyCard({ company: c }: { company: CompanySearchResult }) {
  return (
    <Link
      href={`/companies/${c.symbol}`}
      className="group bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-2.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <span className="text-base font-bold text-gray-900 font-mono tracking-tight group-hover:text-indigo-600 transition-colors">
          {c.symbol}
        </span>
        <svg
          className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
      <p className="text-xs text-gray-600 font-medium leading-snug line-clamp-2">{c.name}</p>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border w-fit mt-auto ${sectorBadge(c.sector)}`}>
        {c.sector}
      </span>
    </Link>
  );
}

function UnseededCard({ company: c }: { company: CompanySearchResult }) {
  return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 flex flex-col gap-2.5 opacity-60 cursor-default">
      <div className="flex items-start justify-between">
        <span className="text-base font-bold text-gray-400 font-mono tracking-tight">
          {c.symbol}
        </span>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          No data
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium leading-snug line-clamp-2">{c.name}</p>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border w-fit mt-auto ${sectorBadge(c.sector)}`}>
        {c.sector}
      </span>
    </div>
  );
}
