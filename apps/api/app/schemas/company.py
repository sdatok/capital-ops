from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class CompanySearchResult(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: str


class RawFinancials(BaseModel):
    """Annual source values (in $M). Kept separate from derived metrics."""

    revenue: list[float]
    gross_profit: list[float]
    operating_income: list[float]
    free_cash_flow: list[float]
    capital_expenditures: list[float]
    operating_cash_flow: list[float]
    net_income: list[float]


class DerivedMetrics(BaseModel):
    """
    Derived metrics as time-series arrays aligned with CompanyOverview.periods.
    None means the metric cannot be computed for that period (missing input or
    denominator is zero / not meaningful).
    """

    revenue_growth: list[Optional[float]]
    gross_margin: list[Optional[float]]
    operating_margin: list[Optional[float]]
    fcf_margin: list[Optional[float]]
    capex_intensity: list[Optional[float]]
    cash_conversion: list[Optional[float]]


class CompanyOverview(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: str
    fiscal_year_end_month: str
    periods: list[str]
    raw: RawFinancials
    metrics: DerivedMetrics
