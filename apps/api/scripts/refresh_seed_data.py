"""
refresh_seed_data.py
--------------------
Fetches real annual financial data from Yahoo Finance via yfinance and overwrites
the seed JSON files used by the Capital Ops API.

Usage (from apps/api, with venv active):
    python -m scripts.refresh_seed_data

The app itself reads from seed files at runtime — this script only updates those
files. Re-run it whenever you want fresh data, then commit and redeploy.

Data sourced from Yahoo Finance via the unofficial yfinance library.
Values are stored in millions USD to keep numbers readable.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

import yfinance as yf

SEED_DIR = Path(__file__).resolve().parents[1] / "data" / "seed"

# Canonical company metadata — yfinance doesn't reliably return clean sector/industry strings.
COMPANIES = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "industry": "Consumer Electronics", "fiscal_year_end_month": "September"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology", "industry": "Software Infrastructure", "fiscal_year_end_month": "June"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology", "industry": "Internet Content & Information", "fiscal_year_end_month": "December"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Technology", "industry": "Internet Content & Information", "fiscal_year_end_month": "December"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology", "industry": "Semiconductors", "fiscal_year_end_month": "January"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "industry": "Internet Retail & Cloud", "fiscal_year_end_month": "December"},
    {"symbol": "COST", "name": "Costco Wholesale Corporation", "sector": "Consumer Staples", "industry": "Discount Stores", "fiscal_year_end_month": "August"},
    {"symbol": "WMT", "name": "Walmart Inc.", "sector": "Consumer Staples", "industry": "Discount Stores", "fiscal_year_end_month": "January"},
    {"symbol": "NFLX", "name": "Netflix Inc.", "sector": "Communication Services", "industry": "Entertainment", "fiscal_year_end_month": "December"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary", "industry": "Auto Manufacturers", "fiscal_year_end_month": "December"},
]

# yfinance field names can vary between versions — try each candidate in order.
INCOME_FIELDS = {
    "revenue":           ["Total Revenue"],
    "gross_profit":      ["Gross Profit"],
    "operating_income":  ["Operating Income", "EBIT"],
    "net_income":        ["Net Income", "Net Income Common Stockholders"],
}

CASHFLOW_FIELDS = {
    "operating_cash_flow": ["Operating Cash Flow", "Cash From Operations"],
    "capital_expenditures": ["Capital Expenditure"],
    "free_cash_flow":       ["Free Cash Flow"],
}


def _get(series, candidates: list[str]) -> Optional[float]:
    """Return the first matching non-null value from a pandas Series, or None."""
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
    """Convert from raw dollars (yfinance) to millions."""
    if value is None:
        return None
    return round(value / 1_000_000, 1)


def fetch_financials(symbol: str, years: int = 5) -> list[dict]:
    print(f"  Fetching {symbol}…", end=" ", flush=True)
    ticker = yf.Ticker(symbol)

    try:
        income = ticker.income_stmt
        cashflow = ticker.cash_flow
    except Exception as e:
        print(f"ERROR: {e}")
        return []

    if income is None or income.empty:
        print("no income data")
        return []

    rows = []
    # Columns are datetime objects, most recent first.
    cols = list(income.columns)[:years]

    for col in cols:
        period = str(col.year)

        rev = _to_millions(_get(income[col], INCOME_FIELDS["revenue"]))
        gp  = _to_millions(_get(income[col], INCOME_FIELDS["gross_profit"]))
        oi  = _to_millions(_get(income[col], INCOME_FIELDS["operating_income"]))
        ni  = _to_millions(_get(income[col], INCOME_FIELDS["net_income"]))

        cf_col = cashflow[col] if col in cashflow.columns else None

        ocf   = _to_millions(_get(cf_col, CASHFLOW_FIELDS["operating_cash_flow"])) if cf_col is not None else None
        raw_capex = _get(cf_col, CASHFLOW_FIELDS["capital_expenditures"]) if cf_col is not None else None
        capex = _to_millions(abs(raw_capex)) if raw_capex is not None else None  # yfinance stores as negative
        fcf   = _to_millions(_get(cf_col, CASHFLOW_FIELDS["free_cash_flow"])) if cf_col is not None else None

        # Derive FCF from OCF - capex if not directly available.
        if fcf is None and ocf is not None and capex is not None:
            fcf = round(ocf - capex, 1)

        # Skip periods where we have no revenue — not useful.
        if rev is None:
            continue

        rows.append({
            "symbol": symbol,
            "period": period,
            "revenue": rev or 0,
            "gross_profit": gp or 0,
            "operating_income": oi or 0,
            "free_cash_flow": fcf or 0,
            "capital_expenditures": capex or 0,
            "operating_cash_flow": ocf or 0,
            "net_income": ni or 0,
        })

    rows.sort(key=lambda r: r["period"])
    print(f"got {len(rows)} periods: {[r['period'] for r in rows]}")
    return rows


def run(years: int = 5) -> None:
    print(f"\nCapital Ops — seed data refresh ({years} years per company)")
    print(f"Writing to: {SEED_DIR}\n")

    SEED_DIR.mkdir(parents=True, exist_ok=True)

    all_financials: list[dict] = []
    failed: list[str] = []

    for company in COMPANIES:
        sym = company["symbol"]
        rows = fetch_financials(sym, years=years)
        if rows:
            all_financials.extend(rows)
        else:
            failed.append(sym)

    # Write companies seed (metadata never changes so always write canonical list).
    companies_path = SEED_DIR / "companies_seed.json"
    companies_path.write_text(json.dumps(COMPANIES, indent=2))
    print(f"\nWrote {companies_path}")

    # Write financials seed.
    financials_path = SEED_DIR / "financials_annual_seed.json"
    financials_path.write_text(json.dumps(all_financials, indent=2))
    print(f"Wrote {financials_path}")
    print(f"\nTotal records: {len(all_financials)}")

    if failed:
        print(f"\nFailed to fetch: {failed}")
        print("The existing seed data for these companies was NOT updated.")
        sys.exit(1)
    else:
        print("\nAll companies refreshed successfully.")
        print("Commit the updated seed files and redeploy to publish the new data.")


if __name__ == "__main__":
    run()
