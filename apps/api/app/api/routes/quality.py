from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.duckdb.db import get_conn
from app.schemas.company import CompanyOverview, DerivedMetrics, RawFinancials
from app.schemas.quality import QualityScore
from app.services.dynamic_fetch import fetch_live
from app.services.metrics import (
    capex_intensity,
    cash_conversion,
    fcf_margin,
    gross_margin,
    operating_margin,
    revenue_growth,
)
from app.services.quality_score import compute_quality_score

router = APIRouter(prefix="/api/quality", tags=["quality"])


def _overview_from_db(sym: str) -> CompanyOverview | None:
    conn = get_conn()
    company_row = conn.execute(
        "SELECT symbol, name, sector, industry, fiscal_year_end_month FROM companies WHERE symbol = ?",
        [sym],
    ).fetchone()
    if not company_row:
        return None

    fin_rows = conn.execute(
        """
        SELECT period, revenue, gross_profit, operating_income, free_cash_flow,
               capital_expenditures, operating_cash_flow, net_income
        FROM financials_annual
        WHERE symbol = ?
        ORDER BY period
        """,
        [sym],
    ).fetchall()
    if not fin_rows:
        return None

    periods       = [r[0] for r in fin_rows]
    revenues      = [r[1] for r in fin_rows]
    gross_profits = [r[2] for r in fin_rows]
    op_incomes    = [r[3] for r in fin_rows]
    fcfs          = [r[4] for r in fin_rows]
    capexs        = [r[5] for r in fin_rows]
    ocfs          = [r[6] for r in fin_rows]
    net_incomes   = [r[7] for r in fin_rows]

    rev_growth = [None] + [
        revenue_growth(revenues[i], revenues[i - 1]) for i in range(1, len(revenues))
    ]

    return CompanyOverview(
        symbol=company_row[0],
        name=company_row[1],
        sector=company_row[2],
        industry=company_row[3],
        fiscal_year_end_month=company_row[4],
        periods=periods,
        is_live=False,
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
            revenue_growth=rev_growth,
            gross_margin=[gross_margin(gp, rev) for gp, rev in zip(gross_profits, revenues)],
            operating_margin=[operating_margin(oi, rev) for oi, rev in zip(op_incomes, revenues)],
            fcf_margin=[fcf_margin(f, rev) for f, rev in zip(fcfs, revenues)],
            capex_intensity=[capex_intensity(cap, rev) for cap, rev in zip(capexs, revenues)],
            cash_conversion=[cash_conversion(ocf, ni) for ocf, ni in zip(ocfs, net_incomes)],
        ),
    )


@router.get("/{symbol}", response_model=QualityScore)
def get_quality_score(symbol: str) -> QualityScore:
    sym = symbol.upper()
    overview = _overview_from_db(sym) or fetch_live(sym)
    if not overview:
        raise HTTPException(status_code=404, detail=f"Company '{sym}' not found")
    return compute_quality_score(overview)
