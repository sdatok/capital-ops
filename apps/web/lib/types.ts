export interface CompanySearchResult {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
}

export interface RawFinancials {
  revenue: number[];
  gross_profit: number[];
  operating_income: number[];
  free_cash_flow: number[];
  capital_expenditures: number[];
  operating_cash_flow: number[];
  net_income: number[];
}

export interface DerivedMetrics {
  revenue_growth: (number | null)[];
  gross_margin: (number | null)[];
  operating_margin: (number | null)[];
  fcf_margin: (number | null)[];
  capex_intensity: (number | null)[];
  cash_conversion: (number | null)[];
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  fiscal_year_end_month: string;
  periods: string[];
  raw: RawFinancials;
  metrics: DerivedMetrics;
}

export type MetricKey = keyof DerivedMetrics;
