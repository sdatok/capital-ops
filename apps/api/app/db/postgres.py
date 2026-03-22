from __future__ import annotations

from typing import Any, Iterator

import psycopg


def get_connection(database_url: str) -> Any:
    """
    Minimal Postgres connection helper.

    For MVP scaffolding we don't implement full persistence logic yet;
    this keeps the app structure ready for saved analyses later.
    """

    # Note: no pooling in scaffold to keep dependencies and behavior simple.
    return psycopg.connect(database_url, autocommit=True)


def connection_cursor(database_url: str) -> Iterator[Any]:
    conn = get_connection(database_url)
    try:
        with conn.cursor() as cur:
            yield cur
    finally:
        conn.close()

