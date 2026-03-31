from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.duckdb.db import get_conn
from app.schemas.peers import MetricComparison, PeerCompareRequest, PeerCompareResponse, PeerMetricSeries
from app.services.dynamic_fetch import fetch_live
from app.services.metrics import (
    capex_intensity,
    cash_conversion,
    fcf_margin,
    gross_margin,
    operating_margin,
    revenue_growth,
)

router = APIRouter(prefix="/api/peers", tags=["peers"])

METRIC_LABELS: dict[str, str] = {
    "gross_margin": "Gross Margin",
    "operating_margin": "Operating Margin",
    "fcf_margin": "FCF Margin",
    "capex_intensity": "Capex Intensity",
    "cash_conversion": "Cash Conversion",
    "revenue_growth": "Revenue Growth",
}

# For ranking: True = higher is better, False = lower is better.
HIGHER_IS_BETTER: dict[str, bool] = {
    "gross_margin": True,
    "operating_margin": True,
    "fcf_margin": True,
    "capex_intensity": False,
    "cash_conversion": True,
    "revenue_growth": True,
}


def _compute_metric_series(
    symbol: str,
    metric_key: str,
    revenues: list[float],
    gross_profits: list[float],
    op_incomes: list[float],
    fcfs: list[float],
    capexs: list[float],
    ocfs: list[float],
    net_incomes: list[float],
) -> list[float | None]:
    n = len(revenues)
    match metric_key:
        case "gross_margin":
            return [gross_margin(gp, rev) for gp, rev in zip(gross_profits, revenues)]
        case "operating_margin":
            return [operating_margin(oi, rev) for oi, rev in zip(op_incomes, revenues)]
        case "fcf_margin":
            return [fcf_margin(fcf, rev) for fcf, rev in zip(fcfs, revenues)]
        case "capex_intensity":
            return [capex_intensity(cap, rev) for cap, rev in zip(capexs, revenues)]
        case "cash_conversion":
            return [cash_conversion(ocf, ni) for ocf, ni in zip(ocfs, net_incomes)]
        case "revenue_growth":
            return [None] + [
                revenue_growth(revenues[i], revenues[i - 1]) for i in range(1, n)
            ]
        case _:
            return [None] * n


def _fetch_company_financials(conn, symbol: str) -> dict | None:
    company = conn.execute(
        "SELECT symbol, name FROM companies WHERE symbol = ?", [symbol]
    ).fetchone()

    if company:
        rows = conn.execute(
            """
            SELECT period, revenue, gross_profit, operating_income, free_cash_flow,
                   capital_expenditures, operating_cash_flow, net_income
            FROM financials_annual WHERE symbol = ? ORDER BY period
            """,
            [symbol],
        ).fetchall()
        if rows:
            return {
                "symbol":               company[0],
                "name":                 company[1],
                "periods":              [r[0] for r in rows],
                "revenue":              [r[1] for r in rows],
                "gross_profit":         [r[2] for r in rows],
                "operating_income":     [r[3] for r in rows],
                "free_cash_flow":       [r[4] for r in rows],
                "capital_expenditures": [r[5] for r in rows],
                "operating_cash_flow":  [r[6] for r in rows],
                "net_income":           [r[7] for r in rows],
            }

    overview = fetch_live(symbol)
    if not overview:
        return None

    return {
        "symbol":               overview.symbol,
        "name":                 overview.name,
        "periods":              overview.periods,
        "revenue":              overview.raw.revenue,
        "gross_profit":         overview.raw.gross_profit,
        "operating_income":     overview.raw.operating_income,
        "free_cash_flow":       overview.raw.free_cash_flow,
        "capital_expenditures": overview.raw.capital_expenditures,
        "operating_cash_flow":  overview.raw.operating_cash_flow,
        "net_income":           overview.raw.net_income,
    }


@router.post("/compare", response_model=PeerCompareResponse)
def compare_peers(body: PeerCompareRequest) -> PeerCompareResponse:
    conn = get_conn()

    all_symbols = [body.company_symbol.upper()] + [s.upper() for s in body.peer_symbols]
    all_symbols = list(dict.fromkeys(all_symbols))  # deduplicate, preserve order

    companies_data = {}
    for sym in all_symbols:
        data = _fetch_company_financials(conn, sym)
        if data is None:
            raise HTTPException(status_code=404, detail=f"Company '{sym}' not found or has no financials")
        companies_data[sym] = data

    comparisons: list[MetricComparison] = []

    for metric_key in body.metric_keys:
        if metric_key not in METRIC_LABELS:
            continue

        series_list: list[PeerMetricSeries] = []

        for sym, data in companies_data.items():
            values = _compute_metric_series(
                sym,
                metric_key,
                data["revenue"],
                data["gross_profit"],
                data["operating_income"],
                data["free_cash_flow"],
                data["capital_expenditures"],
                data["operating_cash_flow"],
                data["net_income"],
            )
            series_list.append(PeerMetricSeries(
                symbol=sym,
                name=data["name"],
                periods=data["periods"],
                values=values,
            ))

        # Rank by latest non-null value.
        def latest_value(s: PeerMetricSeries) -> float:
            for v in reversed(s.values):
                if v is not None:
                    return v
            return float("-inf")

        higher_better = HIGHER_IS_BETTER.get(metric_key, True)
        ranked = sorted(series_list, key=latest_value, reverse=higher_better)
        ranking = [s.symbol for s in ranked]

        comparisons.append(MetricComparison(
            metric_key=metric_key,
            metric_label=METRIC_LABELS[metric_key],
            series=series_list,
            latest_ranking=ranking,
        ))

    return PeerCompareResponse(comparisons=comparisons)
