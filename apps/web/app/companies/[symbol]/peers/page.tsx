"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PeerChart from "@/components/PeerChart";
import { comparePeers, searchCompanies } from "@/lib/apiClient";
import type { CompanySearchResult, MetricComparison, PeerCompareResponse } from "@/lib/types";

const PERCENT_METRICS = new Set([
  "gross_margin", "operating_margin", "fcf_margin", "capex_intensity", "revenue_growth",
]);

export default function PeersPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const [allCompanies, setAllCompanies] = useState<CompanySearchResult[]>([]);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [result, setResult] = useState<PeerCompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllPeers, setShowAllPeers] = useState(false);

  useEffect(() => {
    searchCompanies().then(setAllCompanies).catch(() => {});
  }, []);

  function togglePeer(sym: string) {
    setSelectedPeers((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
    setResult(null);
  }

  async function runComparison() {
    if (selectedPeers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await comparePeers(symbol, selectedPeers);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const seededPeers = allCompanies.filter((c) => c.symbol !== symbol && c.has_data);
  const allPeers = allCompanies.filter((c) => c.symbol !== symbol);
  const peers = showAllPeers ? allPeers : seededPeers;

  return (
    <div>
      <Link
        href={`/companies/${symbol}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
      >
        ← Back to {symbol} overview
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Peer Comparison</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select companies to compare against <span className="font-medium text-gray-700">{symbol}</span>.
        </p>
      </div>

      {/* Peer picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Select peers to compare</p>
          <button
            onClick={() => setShowAllPeers((v) => !v)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            {showAllPeers
              ? `Show seeded only (${seededPeers.length})`
              : `Show all tickers (${allPeers.length}) — live fetch`}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {peers.map((c) => {
            const selected = selectedPeers.includes(c.symbol);
            return (
              <button
                key={c.symbol}
                onClick={() => togglePeer(c.symbol)}
                title={c.has_data ? c.name : `${c.name} — will be fetched live`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selected
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : c.has_data
                    ? "bg-white text-gray-700 border-gray-200 hover:border-indigo-400"
                    : "bg-gray-50 text-gray-500 border-dashed border-gray-200 hover:border-indigo-300"
                }`}
              >
                {c.symbol}
                {!c.has_data && <span className="ml-1 text-[10px] opacity-60">⚡</span>}
                <span className="ml-1.5 text-xs opacity-70 hidden sm:inline">{c.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
        {showAllPeers && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            ⚡ Companies marked with a bolt will be fetched live from Yahoo Finance — first load may take a few seconds per ticker.
          </p>
        )}
        <button
          onClick={runComparison}
          disabled={selectedPeers.length === 0 || loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Fetching data & comparing…" : `Compare ${symbol} vs ${selectedPeers.length > 0 ? selectedPeers.join(", ") : "selected peers"}`}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Latest ranking table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 overflow-x-auto">
            <p className="text-sm font-semibold text-gray-700 mb-4">Latest period ranking</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4">Metric</th>
                  {[symbol, ...selectedPeers].map((sym) => (
                    <th key={sym} className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 px-3">
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.comparisons.map((comp) => (
                  <RankingRow
                    key={comp.metric_key}
                    comparison={comp}
                    symbols={[symbol, ...selectedPeers]}
                    isPercent={PERCENT_METRICS.has(comp.metric_key)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts grid */}
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Historical trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.comparisons.map((comp) => (
              <PeerChart
                key={comp.metric_key}
                comparison={comp}
                isPercent={PERCENT_METRICS.has(comp.metric_key)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RankingRow({
  comparison,
  symbols,
  isPercent,
}: {
  comparison: MetricComparison;
  symbols: string[];
  isPercent: boolean;
}) {
  const latestBySymbol: Record<string, number | null> = {};
  for (const s of comparison.series) {
    const val = [...s.values].reverse().find((v) => v !== null) ?? null;
    latestBySymbol[s.symbol] = val;
  }

  const bestRank = comparison.latest_ranking[0];

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-2.5 pr-4 text-gray-700 font-medium whitespace-nowrap">
        {comparison.metric_label}
      </td>
      {symbols.map((sym) => {
        const val = latestBySymbol[sym];
        const isBest = sym === bestRank;
        const formatted =
          val === null ? "—" : isPercent ? `${(val * 100).toFixed(1)}%` : `${val.toFixed(2)}×`;
        return (
          <td
            key={sym}
            className={`py-2.5 px-3 text-right tabular-nums ${
              isBest ? "text-emerald-600 font-semibold" : "text-gray-700"
            }`}
          >
            {formatted}
          </td>
        );
      })}
    </tr>
  );
}
