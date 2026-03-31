import type { CompanyOverview, CompanySearchResult } from "./types";

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
