"""
dynamic_fetch.py
----------------
Live yfinance lookup for any publicly traded ticker.

Used as a fallback when a company is not in the DuckDB seed.
Results are cached in memory for the lifetime of the process so that
repeat visits to the same ticker don't re-hit Yahoo Finance.

The cache is intentionally unbounded and has no TTL — this is fine for
a portfolio-scale deployment where the worker process restarts regularly.
"""

from __future__ import annotations

import calendar
import threading
from typing import Optional

import yfinance as yf

from app.schemas.company import CompanyOverview, DerivedMetrics, RawFinancials
from app.services.metrics import (
    capex_intensity,
    cash_conversion,
    fcf_margin,
    gross_margin,
    operating_margin,
    revenue_growth,
)

_cache: dict[str, CompanyOverview] = {}
_lock = threading.Lock()

INCOME_FIELDS = {
    "revenue":          ["Total Revenue"],
    "gross_profit":     ["Gross Profit"],
    "operating_income": ["Operating Income", "EBIT"],
    "net_income":       ["Net Income", "Net Income Common Stockholders"],
}

CASHFLOW_FIELDS = {
    "operating_cash_flow":  ["Operating Cash Flow", "Cash From Operations"],
    "capital_expenditures": ["Capital Expenditure"],
    "free_cash_flow":       ["Free Cash Flow"],
}


def _get(series, candidates: list[str]) -> Optional[float]:
    for name in candidates:
        if name in series.index:
            val = series[name]
            try:
                if val is not None and str(val) not in ("nan", "None", "<NA>"):
                    return float(val)
            except (TypeError, ValueError):
                continue
    return None


def _to_millions(value: Optional[float]) -> Optional[float]:
    if value is None:
        return None
    return round(value / 1_000_000, 1)


def fetch_live(symbol: str, years: int = 5) -> Optional[CompanyOverview]:
    """
    Fetch financials from Yahoo Finance and return a CompanyOverview.
    Returns None if the ticker is invalid or yfinance returns no data.
    Results are cached in memory after the first successful fetch.
    """
    sym = symbol.upper()

    with _lock:
        if sym in _cache:
            return _cache[sym]

    # Fetch financial statements first — these are the critical path.
    # Separate try/except so that a flaky ticker.info call doesn't block
    # the entire fetch (ticker.info is known to fail intermittently in yfinance).
    try:
        ticker = yf.Ticker(sym)
        income = ticker.income_stmt
        cashflow = ticker.cash_flow
    except Exception:
        return None

    if income is None or income.empty:
        return None

    # Metadata is best-effort — fall back to safe defaults if unavailable.
    info: dict = {}
    try:
        raw_info = ticker.info
        if isinstance(raw_info, dict):
            info = raw_info
    except Exception:
        pass

    cols = list(income.columns)[:years]
    if not cols:
        return None

    rows = []
    for col in cols:
        try:
            rev = _to_millions(_get(income[col], INCOME_FIELDS["revenue"]))
            if rev is None:
                continue

            gp  = _to_millions(_get(income[col], INCOME_FIELDS["gross_profit"]))
            oi  = _to_millions(_get(income[col], INCOME_FIELDS["operating_income"]))
            ni  = _to_millions(_get(income[col], INCOME_FIELDS["net_income"]))

            cf_col = (
                cashflow[col]
                if (cashflow is not None and not cashflow.empty and col in cashflow.columns)
                else None
            )
            ocf       = _to_millions(_get(cf_col, CASHFLOW_FIELDS["operating_cash_flow"])) if cf_col is not None else None
            raw_capex = _get(cf_col, CASHFLOW_FIELDS["capital_expenditures"]) if cf_col is not None else None
            capex     = _to_millions(abs(raw_capex)) if raw_capex is not None else None
            fcf_val   = _to_millions(_get(cf_col, CASHFLOW_FIELDS["free_cash_flow"])) if cf_col is not None else None

            if fcf_val is None and ocf is not None and capex is not None:
                fcf_val = round(ocf - capex, 1)

            rows.append({
                "period":               str(col.year),
                "revenue":              rev      or 0,
                "gross_profit":         gp       or 0,
                "operating_income":     oi       or 0,
                "free_cash_flow":       fcf_val  or 0,
                "capital_expenditures": capex    or 0,
                "operating_cash_flow":  ocf      or 0,
                "net_income":           ni       or 0,
            })
        except Exception:
            continue

    if not rows:
        return None

    rows.sort(key=lambda r: r["period"])

    periods       = [r["period"]               for r in rows]
    revenues      = [r["revenue"]              for r in rows]
    gross_profits = [r["gross_profit"]         for r in rows]
    op_incomes    = [r["operating_income"]     for r in rows]
    fcfs          = [r["free_cash_flow"]       for r in rows]
    capexs        = [r["capital_expenditures"] for r in rows]
    ocfs          = [r["operating_cash_flow"]  for r in rows]
    net_incomes   = [r["net_income"]           for r in rows]

    rev_growth_series = [None] + [
        revenue_growth(revenues[i], revenues[i - 1]) for i in range(1, len(revenues))
    ]

    name     = info.get("longName") or info.get("shortName") or sym
    sector   = info.get("sector")   or "Unknown"
    industry = info.get("industry") or "Unknown"

    most_recent = list(income.columns)[0]
    fy_month = calendar.month_name[most_recent.month]

    overview = CompanyOverview(
        symbol=sym,
        name=name,
        sector=sector,
        industry=industry,
        fiscal_year_end_month=fy_month,
        periods=periods,
        is_live=True,
        raw=RawFinancials(
            revenue=revenues,
            gross_profit=gross_profits,
            operating_income=op_incomes,
            free_cash_flow=fcfs,
            capital_expenditures=capexs,
            operating_cash_flow=ocfs,
            net_income=net_incomes,
        ),
        metrics=DerivedMetrics(
            revenue_growth=rev_growth_series,
            gross_margin=[gross_margin(gp, rev) for gp, rev in zip(gross_profits, revenues)],
            operating_margin=[operating_margin(oi, rev) for oi, rev in zip(op_incomes, revenues)],
            fcf_margin=[fcf_margin(f, rev) for f, rev in zip(fcfs, revenues)],
            capex_intensity=[capex_intensity(cap, rev) for cap, rev in zip(capexs, revenues)],
            cash_conversion=[cash_conversion(ocf, ni) for ocf, ni in zip(ocfs, net_incomes)],
        ),
    )

    with _lock:
        _cache[sym] = overview

    return overview
