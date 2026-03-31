"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  { value: "Any", label: "Publicly traded ticker" },
  { value: "5 yrs", label: "Annual financials" },
  { value: "6", label: "Core efficiency metrics" },
  { value: "3", label: "Scenario models" },
];

function looksLikeTicker(q: string): boolean {
  return /^[A-Za-z]{1,6}(-[A-Za-z])?$/.test(q.trim());
}

export default function HomePage() {
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
  const trimmedQuery = query.trim().toUpperCase();
  const showLookupCTA =
    query.trim().length > 0 &&
    looksLikeTicker(query) &&
    !companies.some((c) => c.symbol === trimmedQuery);

  function handleLookup() {
    if (trimmedQuery) router.push(`/companies/${trimmedQuery}`);
  }

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
            efficiency, free cash flow conversion, capex discipline, and margin trends — across
            5 years of audited financials.
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
              placeholder="Search ticker or company name… or press Enter to look up any ticker"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLookup(); }}
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

      {/* How it works */}
      {!query && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">How it works</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                step: "01",
                title: "Search any company",
                desc: "10 companies pre-seeded for instant load. Any other publicly traded ticker is fetched live from Yahoo Finance and cached.",
                accent: "indigo",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Company overview",
                desc: "6 core efficiency metrics — revenue growth, margins, FCF, capex intensity, cash conversion — with 5-year trend charts.",
                accent: "violet",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4-4 4 4 4-7 4 4" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Peer comparison",
                desc: "Compare any combination of companies side-by-side. Historical metric trend charts and a ranked table by latest period.",
                accent: "sky",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Scenario + memo",
                desc: "Model bull, base, and bear outcomes with custom assumptions. Generate a deterministic analyst memo referencing only real numbers.",
                accent: "emerald",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
            ].map((item, i, arr) => {
              const styles: Record<string, { icon: string; step: string; border: string }> = {
                indigo:  { icon: "bg-indigo-50 text-indigo-600 border-indigo-100",  step: "text-indigo-300",  border: "hover:border-indigo-200"  },
                violet:  { icon: "bg-violet-50 text-violet-600 border-violet-100",  step: "text-violet-300",  border: "hover:border-violet-200"  },
                sky:     { icon: "bg-sky-50 text-sky-600 border-sky-100",            step: "text-sky-300",     border: "hover:border-sky-200"     },
                emerald: { icon: "bg-emerald-50 text-emerald-600 border-emerald-100",step: "text-emerald-300", border: "hover:border-emerald-200" },
              };
              const s = styles[item.accent];
              return (
                <div key={item.step} className="relative">
                  <div className={`bg-white border border-gray-100 rounded-xl p-5 h-full flex flex-col gap-3 transition-all hover:shadow-sm ${s.border}`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.icon}`}>
                        {item.icon}
                      </div>
                      <span className={`text-2xl font-bold tabular-nums ${s.step}`}>{item.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-1.5 -translate-y-1/2 z-10 items-center justify-center w-3 h-3">
                      <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 6 6">
                        <path d="M0 3l6-3v6L0 3z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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

          {/* Live lookup CTA — shown when query looks like a ticker not in our universe */}
          {showLookupCTA && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Not in universe — live lookup available
                </h2>
              </div>
              <button
                onClick={handleLookup}
                className="group flex items-center gap-4 bg-white border border-indigo-200 rounded-xl px-5 py-4 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200 text-left w-full max-w-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 font-mono">{trimmedQuery}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fetch live from Yahoo Finance →
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

      {/* Footer hint */}
      {!query && !loading && !error && (
        <p className="text-xs text-gray-400 border-t border-gray-100 pt-6">
          10 companies pre-seeded for instant load. Search any ticker to look it up live via Yahoo Finance.
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
