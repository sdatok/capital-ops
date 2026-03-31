from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class ScoreComponent(BaseModel):
    key: str
    name: str
    weight: float            # e.g. 0.25 = 25% of total score
    raw_value: Optional[float]  # the underlying metric value (e.g. 0.21 for 21% FCF margin)
    component_score: float   # 0.0 → 1.0 (how the raw value maps to full credit)
    points_earned: float     # component_score × weight × 100
    points_max: float        # weight × 100
    interpretation: str      # plain-English: what the raw value says about this company
    formula: str             # the metric formula used
    benchmark: str           # how the scoring curve works, visible to users


class QualityScore(BaseModel):
    symbol: str
    name: str
    total_score: float       # 0–100
    grade: str               # A+ / A / B / C / D / F
    grade_label: str         # "Elite allocator" etc.
    grade_color: str         # Tailwind color token for the frontend
    components: list[ScoreComponent]
    periods_analyzed: int
    summary: str             # 1–2 sentence plain-English verdict
