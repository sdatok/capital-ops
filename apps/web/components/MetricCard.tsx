import { fmtMultiple, fmtPct, fmtPctSigned } from "@/lib/format";

export type MetricCardVariant =
  | "percent"
  | "percent_signed"
  | "multiple"
  | "capex";

interface MetricCardProps {
  label: string;
  value: number | null;
  priorValue?: number | null;
  period: string;
  variant: MetricCardVariant;
  formulaHint: string;
}

function formatValue(value: number | null, variant: MetricCardVariant): string {
  if (value === null) return "—";
  switch (variant) {
    case "percent":
      return fmtPct(value);
    case "percent_signed":
      return fmtPctSigned(value);
    case "capex":
      return fmtPct(value);
    case "multiple":
      return fmtMultiple(value);
  }
}

function getDeltaLabel(
  current: number | null,
  prior: number | null,
  variant: MetricCardVariant
): { text: string; positive: boolean } | null {
  if (current === null || prior === null) return null;
  const delta = current - prior;
  if (Math.abs(delta) < 0.00001) return null;
  const positive = delta > 0;

  let text: string;
  if (variant === "multiple") {
    text = `${positive ? "+" : ""}${delta.toFixed(2)}× vs prior`;
  } else {
    // pp change for all percentage-based metrics
    text = `${positive ? "+" : ""}${(delta * 100).toFixed(1)}pp vs prior`;
  }
  return { text, positive };
}

// For capex intensity, lower is better — invert the color signal.
const invertPositive = new Set<MetricCardVariant>(["capex"]);

export default function MetricCard({
  label,
  value,
  priorValue,
  period,
  variant,
  formulaHint,
}: MetricCardProps) {
  const delta = getDeltaLabel(value, priorValue ?? null, variant);
  const invert = invertPositive.has(variant);

  const deltaColor =
    delta === null
      ? ""
      : (delta.positive && !invert) || (!delta.positive && invert)
      ? "text-emerald-600"
      : "text-red-500";

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1 hover:border-gray-300 transition-colors"
      title={`Formula: ${formulaHint}`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
        {formatValue(value, variant)}
      </p>
      <p className="text-xs text-gray-400">FY{period}</p>
      {delta && (
        <p className={`text-xs font-medium mt-1 ${deltaColor}`}>{delta.text}</p>
      )}
    </div>
  );
}
