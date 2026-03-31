/** Format a decimal ratio as a percentage string. e.g. 0.3412 → "34.1%" */
export function fmtPct(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format a decimal ratio as a signed percentage. e.g. 0.0512 → "+5.1%" */
export function fmtPctSigned(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(decimals)}%`;
}

/** Format millions as billions with 1 decimal. e.g. 394328 → "$394.3B" */
export function fmtBillions(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const b = value / 1000;
  if (Math.abs(b) >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${b.toFixed(1)}B`;
}

/** Format a cash conversion ratio. e.g. 1.234 → "1.23×" */
export function fmtMultiple(value: number | null): string {
  if (value === null || value === undefined) return "N/M";
  return `${value.toFixed(2)}×`;
}
