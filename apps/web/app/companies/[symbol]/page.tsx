"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarginsChart from "@/components/MarginsChart";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import { getCompanyOverview } from "@/lib/apiClient";
import type { CompanyOverview } from "@/lib/types";

export default function CompanyOverviewPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const router = useRouter();

  const [data, setData] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCompanyOverview(symbol)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState symbol={symbol} message={error} />;
  if (!data) return null;

  const lastIdx = data.periods.length - 1;
  const prevIdx = lastIdx - 1;
  const lastPeriod = data.periods[lastIdx];
  const m = data.metrics;

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
      >
        ← All companies
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {data.name}{" "}
              <span className="text-gray-400 font-normal text-lg">({data.symbol})</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {data.sector} &middot; {data.industry} &middot; FY ends {data.fiscal_year_end_month}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              FY{lastPeriod} data
            </span>
            {data.is_live && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Live via Yahoo Finance
              </span>
            )}
            <button
              onClick={() => router.push(`/companies/${symbol}/peers`)}
              className="text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Compare peers →
            </button>
            <button
              onClick={() => router.push(`/companies/${symbol}/scenario`)}
              className="text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Scenarios →
            </button>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Key Metrics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Revenue Growth"
          value={m.revenue_growth[lastIdx]}
          priorValue={m.revenue_growth[prevIdx]}
          period={lastPeriod}
          variant="percent_signed"
          formulaHint="(Revenue_t − Revenue_{t−1}) / Revenue_{t−1}"
        />
        <MetricCard
          label="Gross Margin"
          value={m.gross_margin[lastIdx]}
          priorValue={m.gross_margin[prevIdx]}
          period={lastPeriod}
          variant="percent"
          formulaHint="Gross Profit / Revenue"
        />
        <MetricCard
          label="Operating Margin"
          value={m.operating_margin[lastIdx]}
          priorValue={m.operating_margin[prevIdx]}
          period={lastPeriod}
          variant="percent"
          formulaHint="Operating Income / Revenue"
        />
        <MetricCard
          label="FCF Margin"
          value={m.fcf_margin[lastIdx]}
          priorValue={m.fcf_margin[prevIdx]}
          period={lastPeriod}
          variant="percent"
          formulaHint="Free Cash Flow / Revenue"
        />
        <MetricCard
          label="Capex Intensity"
          value={m.capex_intensity[lastIdx]}
          priorValue={m.capex_intensity[prevIdx]}
          period={lastPeriod}
          variant="capex"
          formulaHint="Capital Expenditures / Revenue (lower = more asset-light)"
        />
        <MetricCard
          label="Cash Conversion"
          value={m.cash_conversion[lastIdx]}
          priorValue={m.cash_conversion[prevIdx]}
          period={lastPeriod}
          variant="multiple"
          formulaHint="Operating Cash Flow / Net Income (N/M when net income ≤ 0)"
        />
      </div>

      {/* Charts */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Historical Trends
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <RevenueChart periods={data.periods} revenue={data.raw.revenue} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <MarginsChart
            periods={data.periods}
            grossMargin={m.gross_margin}
            operatingMargin={m.operating_margin}
            fcfMargin={m.fcf_margin}
          />
        </div>
      </div>

      {/* Formula transparency note */}
      <p className="text-xs text-gray-400 mt-2">
        All metrics are computed deterministically from annual financial statement line items.
        Hover any metric card to see the formula. Values in millions USD; ratios displayed as percentages.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded mb-6" />
      <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-6">
        <div className="h-6 w-64 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl h-64" />
        <div className="bg-white border border-gray-200 rounded-xl h-64" />
      </div>
    </div>
  );
}

function ErrorState({ symbol, message }: { symbol: string; message: string }) {
  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
      >
        ← All companies
      </Link>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        <p className="font-semibold mb-1">Could not load {symbol}</p>
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
}
