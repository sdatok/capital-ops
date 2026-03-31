"""
Deterministic analyst memo generator.

Builds a structured memo from real data — no LLM, no invented facts.
Every sentence references a number that was computed by the metrics service.
"""

from __future__ import annotations

from app.schemas.scenario import MemoRequest, MemoResponse, ScenarioAssumptions


def _pct(v: float, sign: bool = False) -> str:
    p = v * 100
    if sign:
        return f"{'+' if p >= 0 else ''}{p:.1f}%"
    return f"{p:.1f}%"


def _b(v: float) -> str:
    """Format millions as billions string."""
    return f"${v / 1000:.1f}B"


def generate_memo(
    request: MemoRequest,
    company_name: str,
    sector: str,
    industry: str,
    latest_period: str,
    latest_revenue: float,
    latest_op_margin: float | None,
    latest_fcf_margin: float | None,
    latest_rev_growth: float | None,
    projected_revenue: float,
    projected_oi: float,
    projected_fcf: float,
    assumptions: ScenarioAssumptions,
) -> MemoResponse:
    sym = request.company_symbol
    scenario = request.selected_scenario.lower()
    label = scenario.capitalize()

    # --- Revenue growth sentence ---
    rev_growth_sentence = (
        f"Revenue grew {_pct(latest_rev_growth, sign=True)} in FY{latest_period}."
        if latest_rev_growth is not None
        else f"Revenue for FY{latest_period} was {_b(latest_revenue)}."
    )

    # --- Margin assessment ---
    margin_lines = []
    if latest_op_margin is not None:
        margin_lines.append(f"operating margin of {_pct(latest_op_margin)}")
    if latest_fcf_margin is not None:
        margin_lines.append(f"FCF margin of {_pct(latest_fcf_margin)}")
    margin_sentence = (
        f"The business reported a {' and '.join(margin_lines)} in its most recent fiscal year."
        if margin_lines
        else ""
    )

    # --- Scenario framing ---
    scenario_context = {
        "bull": "In the bull case, the model assumes accelerating growth and margin expansion driven by favorable operating leverage.",
        "base": "In the base case, the model assumes a continuation of recent trends with modest improvement in operational efficiency.",
        "bear": "In the bear case, the model assumes slowing growth and margin compression driven by competitive pressure or higher costs.",
    }.get(scenario, "")

    # --- Projection sentence ---
    projection_sentence = (
        f"Applying a {_pct(assumptions.revenue_growth, sign=True)} revenue growth rate, "
        f"{_pct(assumptions.operating_margin)} operating margin, and "
        f"{_pct(assumptions.fcf_margin)} FCF margin to FY{latest_period} revenue of {_b(latest_revenue)}, "
        f"the model projects revenue of {_b(projected_revenue)}, "
        f"operating income of {_b(projected_oi)}, "
        f"and free cash flow of {_b(projected_fcf)} in the forward period."
    )

    # --- Capital allocation observation ---
    if latest_fcf_margin is not None and latest_op_margin is not None:
        spread = latest_fcf_margin - latest_op_margin
        if spread > 0.02:
            cap_alloc = "FCF margin exceeds operating margin, suggesting efficient working capital management and limited maintenance capex drag."
        elif spread < -0.05:
            cap_alloc = "FCF margin trails operating margin materially, indicating elevated capital expenditure or working capital consumption relative to reported earnings."
        else:
            cap_alloc = "FCF margin tracks closely with operating margin, reflecting consistent cash conversion."
    else:
        cap_alloc = ""

    # --- Assemble memo ---
    paragraphs = [
        f"{company_name} ({sym}) operates in the {industry} segment of the {sector} sector.",
        rev_growth_sentence + (" " + margin_sentence if margin_sentence else ""),
        cap_alloc,
        scenario_context,
        projection_sentence,
        "All projections are based on analyst-defined assumptions applied to reported financials. "
        "This memo is generated deterministically from in-app data and does not constitute investment advice.",
    ]

    memo_text = "\n\n".join(p for p in paragraphs if p.strip())

    return MemoResponse(
        memo_text=memo_text,
        company_symbol=sym,
        selected_scenario=scenario,
    )
