import type {
  CompanyOverview,
  CompanySearchResult,
  MemoResponse,
  PeerCompareResponse,
  QualityScore,
  SaveAnalysisResponse,
  ScenarioInputs,
  ScenarioResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function searchCompanies(q: string = ""): Promise<CompanySearchResult[]> {
  const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiFetch<CompanySearchResult[]>(`/api/companies/search${qs}`);
}

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview> {
  return apiFetch<CompanyOverview>(`/api/companies/${symbol.toUpperCase()}/overview`);
}

export async function projectScenarios(
  companySymbol: string,
  inputs: ScenarioInputs
): Promise<ScenarioResponse> {
  const res = await fetch(`${API_BASE}/api/scenario/project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_symbol: companySymbol, inputs }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function generateMemo(
  companySymbol: string,
  selectedScenario: string,
  scenarioInputs: ScenarioInputs
): Promise<MemoResponse> {
  const res = await fetch(`${API_BASE}/api/scenario/memo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_symbol: companySymbol,
      selected_scenario: selectedScenario,
      scenario_inputs: scenarioInputs,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function saveAnalysis(payload: {
  company_symbol: string;
  peer_symbols: string[];
  scenario_inputs: ScenarioInputs;
  selected_scenario: string;
  memo_text: string;
}): Promise<SaveAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/scenario/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getQualityScore(symbol: string): Promise<QualityScore> {
  return apiFetch<QualityScore>(`/api/quality/${symbol.toUpperCase()}`);
}

export async function comparePeers(
  companySymbol: string,
  peerSymbols: string[]
): Promise<PeerCompareResponse> {
  const res = await fetch(`${API_BASE}/api/peers/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_symbol: companySymbol,
      peer_symbols: peerSymbols,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
