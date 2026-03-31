"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { searchCompanies } from "@/lib/apiClient";
import type { CompanySearchResult } from "@/lib/types";

const SECTOR_COLORS: Record<string, string> = {
  Technology: "bg-blue-50 text-blue-700",
  "Consumer Discretionary": "bg-orange-50 text-orange-700",
  "Consumer Staples": "bg-green-50 text-green-700",
  "Communication Services": "bg-purple-50 text-purple-700",
};

function sectorBadge(sector: string): string {
  return SECTOR_COLORS[sector] ?? "bg-gray-100 text-gray-600";
}

export default function HomePage() {
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      searchCompanies(query)
        .then(setCompanies)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }, 180); // debounce

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Select a company to analyze</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Review operating efficiency, capital allocation quality, and historical trends.
        </p>
      </div>

      <div className="mb-6 max-w-sm">
        <input
          type="text"
          placeholder="Search by name or ticker…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          Could not load companies — make sure the API is running on{" "}
          <code className="font-mono">{process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}</code>
        </div>
      )}

      {loading && !error ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {companies.map((c) => (
            <Link
              key={c.symbol}
              href={`/companies/${c.symbol}`}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {c.symbol}
                </span>
                <span className="text-gray-300 text-xs">→</span>
              </div>
              <p className="text-xs text-gray-600 font-medium leading-snug">{c.name}</p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mt-auto ${sectorBadge(c.sector)}`}
              >
                {c.sector}
              </span>
            </Link>
          ))}
          {!loading && companies.length === 0 && !error && (
            <p className="col-span-full text-sm text-gray-400">No companies match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
