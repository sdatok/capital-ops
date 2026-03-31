from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.duckdb.db import get_conn
from app.services.dynamic_fetch import fetch_live
from app.schemas.scenario import (
    MemoRequest,
    MemoResponse,
    SaveAnalysisRequest,
    SaveAnalysisResponse,
    SavedAnalysis,
    ScenarioProjection,
    ScenarioRequest,
    ScenarioResponse,
)
from app.services.memo import generate_memo
from app.services.metrics import fcf_margin, operating_margin, revenue_growth

router = APIRouter(prefix="/api/scenario", tags=["scenario"])

# In-memory store for saved analyses — no Postgres dependency for MVP.
# Analyses survive as long as the process is running.
_saved_analyses: dict[str, dict[str, Any]] = {}


def _get_company_latest(conn, symbol: str) -> dict | None:
    company = conn.execute(
        "SELECT symbol, name, sector, industry FROM companies WHERE symbol = ?", [symbol]
    ).fetchone()

    if company:
        rows = conn.execute(
            """
            SELECT period, revenue, gross_profit, operating_income, free_cash_flow,
                   capital_expenditures, operating_cash_flow, net_income
            FROM financials_annual WHERE symbol = ? ORDER BY period DESC LIMIT 2
            """,
            [symbol],
        ).fetchall()
        if rows:
            latest = rows[0]
            prior = rows[1] if len(rows) > 1 else None
            rev = latest[1]
            return {
                "symbol": company[0],
                "name": company[1],
                "sector": company[2],
                "industry": company[3],
                "latest_period": latest[0],
                "latest_revenue": rev,
                "latest_op_margin": operating_margin(latest[3], rev),
                "latest_fcf_margin": fcf_margin(latest[4], rev),
                "latest_rev_growth": revenue_growth(rev, prior[1]) if prior else None,
            }

    overview = fetch_live(symbol)
    if not overview or not overview.periods:
        return None

    revenues   = overview.raw.revenue
    op_incomes = overview.raw.operating_income
    fcfs       = overview.raw.free_cash_flow

    latest_rev  = revenues[-1]
    prior_rev   = revenues[-2] if len(revenues) > 1 else None

    return {
        "symbol":            overview.symbol,
        "name":              overview.name,
        "sector":            overview.sector,
        "industry":          overview.industry,
        "latest_period":     overview.periods[-1],
        "latest_revenue":    latest_rev,
        "latest_op_margin":  operating_margin(op_incomes[-1], latest_rev),
        "latest_fcf_margin": fcf_margin(fcfs[-1], latest_rev),
        "latest_rev_growth": revenue_growth(latest_rev, prior_rev) if prior_rev else None,
    }


@router.post("/project", response_model=ScenarioResponse)
def project_scenarios(body: ScenarioRequest) -> ScenarioResponse:
    conn = get_conn()
    sym = body.company_symbol.upper()

    data = _get_company_latest(conn, sym)
    if not data:
        raise HTTPException(status_code=404, detail=f"Company '{sym}' not found")

    base_rev = data["latest_revenue"]

    projections: list[ScenarioProjection] = []
    for label, assumptions in [
        ("Bull", body.inputs.bull),
        ("Base", body.inputs.base),
        ("Bear", body.inputs.bear),
    ]:
        proj_rev = base_rev * (1 + assumptions.revenue_growth)
        proj_oi = proj_rev * assumptions.operating_margin
        proj_fcf = proj_rev * assumptions.fcf_margin
        projections.append(ScenarioProjection(
            label=label,
            assumptions=assumptions,
            projected_revenue=round(proj_rev, 1),
            projected_operating_income=round(proj_oi, 1),
            projected_fcf=round(proj_fcf, 1),
        ))

    return ScenarioResponse(
        company_symbol=sym,
        base_period=data["latest_period"],
        base_revenue=base_rev,
        projections=projections,
    )


@router.post("/memo", response_model=MemoResponse)
def generate_memo_endpoint(body: MemoRequest) -> MemoResponse:
    conn = get_conn()
    sym = body.company_symbol.upper()

    data = _get_company_latest(conn, sym)
    if not data:
        raise HTTPException(status_code=404, detail=f"Company '{sym}' not found")

    scenario = body.selected_scenario.lower()
    assumptions_map = {
        "bull": body.scenario_inputs.bull,
        "base": body.scenario_inputs.base,
        "bear": body.scenario_inputs.bear,
    }
    if scenario not in assumptions_map:
        raise HTTPException(status_code=400, detail="selected_scenario must be 'bull', 'base', or 'bear'")

    assumptions = assumptions_map[scenario]
    base_rev = data["latest_revenue"]
    proj_rev = base_rev * (1 + assumptions.revenue_growth)
    proj_oi = proj_rev * assumptions.operating_margin
    proj_fcf = proj_rev * assumptions.fcf_margin

    return generate_memo(
        request=body,
        company_name=data["name"],
        sector=data["sector"],
        industry=data["industry"],
        latest_period=data["latest_period"],
        latest_revenue=base_rev,
        latest_op_margin=data["latest_op_margin"],
        latest_fcf_margin=data["latest_fcf_margin"],
        latest_rev_growth=data["latest_rev_growth"],
        projected_revenue=proj_rev,
        projected_oi=proj_oi,
        projected_fcf=proj_fcf,
        assumptions=assumptions,
    )


@router.post("/save", response_model=SaveAnalysisResponse)
def save_analysis(body: SaveAnalysisRequest) -> SaveAnalysisResponse:
    analysis_id = str(uuid.uuid4())[:8]
    _saved_analyses[analysis_id] = body.model_dump()
    return SaveAnalysisResponse(id=analysis_id)


@router.get("/saved/{analysis_id}", response_model=SavedAnalysis)
def get_saved_analysis(analysis_id: str) -> SavedAnalysis:
    data = _saved_analyses.get(analysis_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis '{analysis_id}' not found. Note: saved analyses are stored in memory and reset on server restart.",
        )
    return SavedAnalysis(id=analysis_id, **data)
