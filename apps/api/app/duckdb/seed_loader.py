from __future__ import annotations

from pathlib import Path


def seed_data_placeholders_only(seed_dir: str | Path) -> dict[str, str]:
    """
    Placeholder for future DuckDB seeding.

    MVP scaffolding requirement: provide seed-data placeholders without building
    product features yet.
    """

    seed_dir = Path(seed_dir)
    return {
        "companies_seed": str(seed_dir / "companies_seed.json"),
        "financials_annual_seed": str(seed_dir / "financials_annual_seed.json"),
    }

