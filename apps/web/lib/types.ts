export interface CompanySearchResult {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  has_data: boolean;
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
  is_live: boolean;
  raw: RawFinancials;
  metrics: DerivedMetrics;
}

export type MetricKey = keyof DerivedMetrics;

// Scenario
export interface ScenarioAssumptions {
  revenue_growth: number;
  operating_margin: number;
  fcf_margin: number;
}

export interface ScenarioInputs {
  bull: ScenarioAssumptions;
  base: ScenarioAssumptions;
  bear: ScenarioAssumptions;
}

export interface ScenarioProjection {
  label: string;
  assumptions: ScenarioAssumptions;
  projected_revenue: number;
  projected_operating_income: number;
  projected_fcf: number;
}

export interface ScenarioResponse {
  company_symbol: string;
  base_period: string;
  base_revenue: number;
  projections: ScenarioProjection[];
}

export interface MemoResponse {
  memo_text: string;
  company_symbol: string;
  selected_scenario: string;
}

export interface SaveAnalysisResponse {
  id: string;
}

// Quality Score
export interface ScoreComponent {
  key: string;
  name: string;
  weight: number;
  raw_value: number | null;
  component_score: number;
  points_earned: number;
  points_max: number;
  interpretation: string;
  formula: string;
  benchmark: string;
}

export interface QualityScore {
  symbol: string;
  name: string;
  total_score: number;
  grade: string;
  grade_label: string;
  grade_color: string;
  components: ScoreComponent[];
  periods_analyzed: number;
  summary: string;
}

// Peer comparison
export interface PeerMetricSeries {
  symbol: string;
  name: string;
  periods: string[];
  values: (number | null)[];
}

export interface MetricComparison {
  metric_key: string;
  metric_label: string;
  series: PeerMetricSeries[];
  latest_ranking: string[];
}

export interface PeerCompareResponse {
  comparisons: MetricComparison[];
}
