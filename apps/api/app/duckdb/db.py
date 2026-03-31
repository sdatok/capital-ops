from __future__ import annotations

from pathlib import Path

import duckdb

from app.core.config import settings

_conn: duckdb.DuckDBPyConnection | None = None


def get_conn() -> duckdb.DuckDBPyConnection:
    """
    Returns the singleton in-memory DuckDB connection.
    Seed data is loaded once on first access and stays in memory for the process lifetime.
    Each worker process gets its own connection (read-only data so this is fine).
    """
    global _conn
    if _conn is None:
        _conn = _init_conn()
    return _conn


def _init_conn() -> duckdb.DuckDBPyConnection:
    conn = duckdb.connect(":memory:")
    seed_dir = Path(settings.duckdb_seed_dir)

    companies_path = seed_dir / "companies_seed.json"
    conn.execute(
        "CREATE TABLE companies AS SELECT * FROM read_json_auto(?)",
        [str(companies_path)],
    )

    extended_path = seed_dir / "companies_extended.json"
    if extended_path.exists():
        conn.execute(
            """
            INSERT INTO companies
            SELECT * FROM read_json_auto(?)
            WHERE symbol NOT IN (SELECT symbol FROM companies)
            """,
            [str(extended_path)],
        )

    financials_path = seed_dir / "financials_annual_seed.json"
    conn.execute(
        "CREATE TABLE financials_annual AS SELECT * FROM read_json_auto(?)",
        [str(financials_path)],
    )

    return conn
