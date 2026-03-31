from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class PeerMetricSeries(BaseModel):
    symbol: str
    name: str
    periods: list[str]
    values: list[Optional[float]]


class MetricComparison(BaseModel):
    metric_key: str
    metric_label: str
    series: list[PeerMetricSeries]
    latest_ranking: list[str]  # symbols ordered best → worst for this metric


class PeerCompareRequest(BaseModel):
    company_symbol: str
    peer_symbols: list[str]
    metric_keys: list[str] = [
        "gross_margin",
        "operating_margin",
        "fcf_margin",
        "capex_intensity",
        "cash_conversion",
        "revenue_growth",
    ]


class PeerCompareResponse(BaseModel):
    comparisons: list[MetricComparison]
