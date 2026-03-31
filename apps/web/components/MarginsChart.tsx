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

interface MarginsChartProps {
  periods: string[];
  grossMargin: (number | null)[];
  operatingMargin: (number | null)[];
  fcfMargin: (number | null)[];
}

export default function MarginsChart({
  periods,
  grossMargin,
  operatingMargin,
  fcfMargin,
}: MarginsChartProps) {
  const data = periods.map((p, i) => ({
    period: p,
    "Gross Margin": grossMargin[i] !== null ? +(grossMargin[i]! * 100).toFixed(1) : null,
    "Operating Margin":
      operatingMargin[i] !== null ? +(operatingMargin[i]! * 100).toFixed(1) : null,
    "FCF Margin": fcfMargin[i] !== null ? +(fcfMargin[i]! * 100).toFixed(1) : null,
  }));

  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
        Margin Trends
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [`${value ?? "—"}%`, name]}
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Line
            type="monotone"
            dataKey="Gross Margin"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Operating Margin"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="FCF Margin"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
