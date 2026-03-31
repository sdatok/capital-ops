"""
quality_score.py
----------------
Computes the Capital Allocation Quality Score for any company.

Score: 0–100, broken into 5 components.  Every formula and benchmark is
explicit so the number is fully defensible in a presentation or interview.

Scoring philosophy
------------------
- Use absolute thresholds, not sector-relative ones, so the score works for
  any ticker (including live-fetched companies with no peers in our DB).
- Each component maps to a 0.0–1.0 sub-score using a piecewise-linear curve,
  then multiplied by its weight to produce points_earned (0–max_points).
- Trends matter: a company that is improving scores higher than one at the
  same absolute level but deteriorating.
"""

from __future__ import annotations

import statistics
from typing import Optional

from app.schemas.company import CompanyOverview
from app.schemas.quality import QualityScore, ScoreComponent


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def _safe_list(values: list[Optional[float]]) -> list[float]:
    return [v for v in values if v is not None]


def _trend(series: list[float], window: int = 3) -> float:
    """
    Returns +1 if the last `window` periods show an upward trend,
    -1 if downward, 0 if flat (< 2 pp or 0.02 absolute change).
    """
    if len(series) < 2:
        return 0.0
    recent = series[-window:] if len(series) >= window else series
    delta = recent[-1] - recent[0]
    if delta > 0.02:
        return 1.0
    if delta < -0.02:
        return -1.0
    return 0.0


# ---------------------------------------------------------------------------
# Component scorers — each returns (score: float 0–1, interpretation: str)
# ---------------------------------------------------------------------------

def _score_fcf_margin(values: list[float]) -> tuple[float, Optional[float], str]:
    if not values:
        return 0.0, None, "No FCF margin data available."
    latest = values[-1]
    # Linear curve: 0% = 0, 25%+ = full credit
    score = _clamp(latest / 0.25)
    pct = f"{latest * 100:.1f}%"
    if latest >= 0.25:
        interp = f"{pct} FCF margin — exceptional cash generation."
    elif latest >= 0.15:
        interp = f"{pct} FCF margin — strong. The business converts a high share of revenue to free cash."
    elif latest >= 0.08:
        interp = f"{pct} FCF margin — solid. Above median for most industries."
    elif latest >= 0.0:
        interp = f"{pct} FCF margin — thin. The business generates cash but margin is limited."
    else:
        interp = f"{pct} FCF margin — negative. The company is consuming more cash than it generates from operations."
    return score, latest, interp


def _score_cash_conversion(values: list[float]) -> tuple[float, Optional[float], str]:
    if not values:
        return 0.0, None, "No cash conversion data available."
    # Cap outliers: ratios > 5× are likely distorted by near-zero net income
    clipped = [min(v, 5.0) for v in values]
    avg = statistics.mean(clipped)
    # Linear curve: 0.5× = 0, 2.0×+ = full credit
    score = _clamp((avg - 0.5) / 1.5)
    label = f"{avg:.2f}×"
    if avg >= 1.5:
        interp = f"{label} average cash conversion — earnings translate to cash at a high rate, a quality indicator."
    elif avg >= 1.0:
        interp = f"{label} average cash conversion — roughly in line with reported earnings. Acceptable quality."
    elif avg >= 0.7:
        interp = f"{label} average cash conversion — earnings are partially supported by non-cash items. Watch for accruals."
    else:
        interp = f"{label} average cash conversion — earnings quality is low. Reported profit significantly exceeds operating cash flow."
    return score, avg, interp


def _score_capex_efficiency(values: list[float]) -> tuple[float, Optional[float], str]:
    if not values:
        return 0.0, None, "No capex intensity data available."
    avg = statistics.mean(values)
    # Lower is better. Linear curve: 0% = full credit, 25%+ = 0
    score = _clamp(1.0 - avg / 0.25)
    pct = f"{avg * 100:.1f}%"
    if avg <= 0.03:
        interp = f"{pct} average capex intensity — highly asset-light. Growth requires very little physical investment."
    elif avg <= 0.07:
        interp = f"{pct} average capex intensity — lean. Moderate infrastructure investment relative to revenue."
    elif avg <= 0.12:
        interp = f"{pct} average capex intensity — moderate capital requirements. Typical for hardware or logistics businesses."
    elif avg <= 0.20:
        interp = f"{pct} average capex intensity — capital-intensive. A significant share of revenue must be reinvested in assets."
    else:
        interp = f"{pct} average capex intensity — very heavy capital requirements. Limits free cash flow generation."
    return score, avg, interp


def _score_operating_margin(values: list[float]) -> tuple[float, Optional[float], str]:
    if not values:
        return 0.0, None, "No operating margin data available."
    latest = values[-1]
    t = _trend(values)
    # Level: 0% = 0, 30%+ = full credit
    level_score = _clamp(latest / 0.30)
    # Trend: +1 → 1.0, 0 → 0.5, -1 → 0.0
    trend_score = (t + 1.0) / 2.0
    # Weighted: 60% level, 40% trend
    score = 0.60 * level_score + 0.40 * trend_score
    pct = f"{latest * 100:.1f}%"
    trend_word = "improving" if t > 0 else ("stable" if t == 0 else "declining")
    if latest >= 0.20 and t >= 0:
        interp = f"{pct} operating margin and {trend_word} — high-quality, disciplined cost management."
    elif latest >= 0.10:
        interp = f"{pct} operating margin and {trend_word} — respectable efficiency with room to grow."
    elif latest >= 0.0:
        interp = f"{pct} operating margin and {trend_word} — thin margins. Vulnerable to cost shocks."
    else:
        interp = f"{pct} operating margin — the business is running at an operating loss."
    return score, latest, interp


def _score_growth_quality(
    growth_values: list[float],
    op_margin_values: list[float],
) -> tuple[float, Optional[float], str]:
    if not growth_values:
        return 0.0, None, "No revenue growth data available."
    avg_growth = statistics.mean(growth_values)
    margin_trend = _trend(op_margin_values) if op_margin_values else 0.0
    # Growth score: 0% = 0, 20%+ = full credit
    growth_score = _clamp(avg_growth / 0.20)
    # Quality multiplier: growing with improving/stable margins = 1.0, declining = 0.65
    quality_mult = 1.0 if margin_trend >= 0 else 0.65
    score = growth_score * quality_mult
    pct = f"{avg_growth * 100:.1f}%"
    margin_word = "expanding" if margin_trend > 0 else ("stable" if margin_trend == 0 else "compressing")
    if avg_growth >= 0.15 and margin_trend >= 0:
        interp = f"{pct} average revenue growth with {margin_word} margins — high-quality, profitable growth."
    elif avg_growth >= 0.08:
        interp = f"{pct} average revenue growth with {margin_word} margins — solid top-line momentum."
    elif avg_growth >= 0.02:
        interp = f"{pct} average revenue growth — modest expansion. Quality depends on margin sustainability."
    elif avg_growth >= 0:
        interp = f"{pct} average revenue growth — flat top-line performance."
    else:
        interp = f"{pct} average revenue growth — the business is shrinking."
    return score, avg_growth, interp


# ---------------------------------------------------------------------------
# Grade assignment
# ---------------------------------------------------------------------------

def _grade(score: float) -> tuple[str, str, str]:
    """Returns (grade, label, tailwind_color)."""
    if score >= 85:
        return "A+", "Elite allocator", "emerald"
    if score >= 72:
        return "A",  "Strong allocator", "emerald"
    if score >= 58:
        return "B",  "Above average",    "indigo"
    if score >= 44:
        return "C",  "Average",          "amber"
    if score >= 30:
        return "D",  "Below average",    "orange"
    return "F", "Poor allocation", "red"


# ---------------------------------------------------------------------------
# Summary generator
# ---------------------------------------------------------------------------

def _summary(components: list[ScoreComponent], grade: str) -> str:
    best  = max(components, key=lambda c: c.component_score)
    worst = min(components, key=lambda c: c.component_score)
    if best.key == worst.key:
        return f"Grade {grade}. Scores are relatively balanced across all five dimensions."
    return (
        f"Grade {grade}. Strongest dimension is {best.name.lower()} "
        f"({best.points_earned:.0f}/{best.points_max:.0f} pts); "
        f"most room to improve is {worst.name.lower()} "
        f"({worst.points_earned:.0f}/{worst.points_max:.0f} pts)."
    )


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

COMPONENTS_META = [
    {
        "key":       "fcf_margin",
        "name":      "FCF Margin",
        "weight":    0.25,
        "formula":   "Free Cash Flow / Revenue (latest period)",
        "benchmark": "0% FCF margin = 0 pts · 25%+ FCF margin = 25 pts (linear scale).",
    },
    {
        "key":       "cash_conversion",
        "name":      "Cash Conversion",
        "weight":    0.20,
        "formula":   "Operating Cash Flow / Net Income (5-year average, capped at 5×)",
        "benchmark": "0.5× = 0 pts · 2.0×+ = 20 pts (linear scale).",
    },
    {
        "key":       "capex_efficiency",
        "name":      "Capex Efficiency",
        "weight":    0.20,
        "formula":   "1 − (avg Capex Intensity) — lower capex = higher score",
        "benchmark": "0% capex intensity = 20 pts · 25%+ = 0 pts (inverted linear scale).",
    },
    {
        "key":       "operating_margin",
        "name":      "Operating Margin",
        "weight":    0.20,
        "formula":   "Operating Income / Revenue — 60% level, 40% trend direction",
        "benchmark": "0% margin = 0 pts level · 30%+ = 12 pts level; improving trend = +8 pts.",
    },
    {
        "key":       "growth_quality",
        "name":      "Growth Quality",
        "weight":    0.15,
        "formula":   "Avg Revenue Growth × quality multiplier (1.0 if margins stable/expanding, 0.65 if compressing)",
        "benchmark": "0% growth = 0 pts · 20%+ with stable margins = 15 pts.",
    },
]


def compute_quality_score(overview: CompanyOverview) -> QualityScore:
    m = overview.metrics

    fcf_vals  = _safe_list(m.fcf_margin)
    cc_vals   = _safe_list(m.cash_conversion)
    cap_vals  = _safe_list(m.capex_intensity)
    op_vals   = _safe_list(m.operating_margin)
    grw_vals  = _safe_list(m.revenue_growth)

    scorers = [
        _score_fcf_margin(fcf_vals),
        _score_cash_conversion(cc_vals),
        _score_capex_efficiency(cap_vals),
        _score_operating_margin(op_vals),
        _score_growth_quality(grw_vals, op_vals),
    ]

    components: list[ScoreComponent] = []
    for meta, (score, raw_val, interp) in zip(COMPONENTS_META, scorers):
        w = meta["weight"]
        components.append(ScoreComponent(
            key=meta["key"],
            name=meta["name"],
            weight=w,
            raw_value=raw_val,
            component_score=score,
            points_earned=round(score * w * 100, 1),
            points_max=round(w * 100, 1),
            interpretation=interp,
            formula=meta["formula"],
            benchmark=meta["benchmark"],
        ))

    total = sum(c.points_earned for c in components)
    grade, label, color = _grade(total)

    return QualityScore(
        symbol=overview.symbol,
        name=overview.name,
        total_score=round(total, 1),
        grade=grade,
        grade_label=label,
        grade_color=color,
        components=components,
        periods_analyzed=len(overview.periods),
        summary=_summary(components, grade),
    )
