"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricComparison } from "@/lib/types";

// Distinct colors for up to 6 companies.
const LINE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface PeerChartProps {
  comparison: MetricComparison;
  isPercent?: boolean;
}

export default function PeerChart({ comparison, isPercent = true }: PeerChartProps) {
  // Build a unified period list from all series.
  const allPeriods = Array.from(
    new Set(comparison.series.flatMap((s) => s.periods))
  ).sort();

  const data = allPeriods.map((period) => {
    const row: Record<string, string | number | null> = { period };
    for (const s of comparison.series) {
      const idx = s.periods.indexOf(period);
      const val = idx >= 0 ? s.values[idx] : null;
      row[s.symbol] = val !== null ? +(isPercent ? (val * 100).toFixed(1) : val.toFixed(2)) : null;
    }
    return row;
  });

  const fmt = isPercent ? (v: number) => `${v}%` : (v: number) => `${v}×`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">{comparison.metric_label}</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
            width={44}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [isPercent ? `${value}%` : `${value}×`, name]}
            contentStyle={{ border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          {comparison.series.map((s, i) => (
            <Line
              key={s.symbol}
              type="monotone"
              dataKey={s.symbol}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2.5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
