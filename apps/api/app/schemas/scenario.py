from __future__ import annotations

from pydantic import BaseModel, Field


class ScenarioAssumptions(BaseModel):
    revenue_growth: float = Field(description="Annual revenue growth rate as a decimal, e.g. 0.08 for 8%")
    operating_margin: float = Field(description="Operating margin as a decimal, e.g. 0.25 for 25%")
    fcf_margin: float = Field(description="FCF margin as a decimal, e.g. 0.20 for 20%")


class ScenarioInputs(BaseModel):
    bull: ScenarioAssumptions
    base: ScenarioAssumptions
    bear: ScenarioAssumptions


class ScenarioProjection(BaseModel):
    label: str           # "Bull", "Base", "Bear"
    assumptions: ScenarioAssumptions
    projected_revenue: float
    projected_operating_income: float
    projected_fcf: float


class ScenarioRequest(BaseModel):
    company_symbol: str
    inputs: ScenarioInputs


class ScenarioResponse(BaseModel):
    company_symbol: str
    base_period: str
    base_revenue: float
    projections: list[ScenarioProjection]


class MemoRequest(BaseModel):
    company_symbol: str
    selected_scenario: str = Field(description="'bull', 'base', or 'bear'")
    scenario_inputs: ScenarioInputs


class MemoResponse(BaseModel):
    memo_text: str
    company_symbol: str
    selected_scenario: str


class SaveAnalysisRequest(BaseModel):
    company_symbol: str
    peer_symbols: list[str] = []
    scenario_inputs: ScenarioInputs
    selected_scenario: str
    memo_text: str


class SaveAnalysisResponse(BaseModel):
    id: str


class SavedAnalysis(BaseModel):
    id: str
    company_symbol: str
    peer_symbols: list[str]
    scenario_inputs: ScenarioInputs
    selected_scenario: str
    memo_text: str
