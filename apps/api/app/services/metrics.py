"""
Deterministic metric calculations for Capital Ops.

Every function maps directly to a formula in docs/METRIC_DEFINITIONS.md.
No derived logic lives anywhere else — all callers import from here.
"""

from __future__ import annotations

from typing import Optional


def revenue_growth(current: float, prior: float) -> Optional[float]:
    """(current - prior) / prior"""
    if prior == 0:
        return None
    return (current - prior) / prior


def gross_margin(gross_profit: float, revenue: float) -> Optional[float]:
    """gross_profit / revenue"""
    if revenue == 0:
        return None
    return gross_profit / revenue


def operating_margin(operating_income: float, revenue: float) -> Optional[float]:
    """operating_income / revenue"""
    if revenue == 0:
        return None
    return operating_income / revenue


def fcf_margin(free_cash_flow: float, revenue: float) -> Optional[float]:
    """free_cash_flow / revenue"""
    if revenue == 0:
        return None
    return free_cash_flow / revenue


def capex_intensity(capital_expenditures: float, revenue: float) -> Optional[float]:
    """capital_expenditures / revenue"""
    if revenue == 0:
        return None
    return capital_expenditures / revenue


def cash_conversion(operating_cash_flow: float, net_income: float) -> Optional[float]:
    """
    operating_cash_flow / net_income

    Returns None when net_income <= 0 — the ratio is not meaningful
    when the denominator is negative or zero.
    """
    if net_income <= 0:
        return None
    return operating_cash_flow / net_income


def revenue_cagr(ending: float, beginning: float, years: int) -> Optional[float]:
    """(ending / beginning) ^ (1 / years) - 1"""
    if beginning <= 0 or years <= 0:
        return None
    return (ending / beginning) ** (1 / years) - 1


def margin_change(current_margin: Optional[float], prior_margin: Optional[float]) -> Optional[float]:
    """current_margin - prior_margin (in percentage points)"""
    if current_margin is None or prior_margin is None:
        return None
    return current_margin - prior_margin
