from __future__ import annotations

from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    """
    Central configuration for the API.

    Uses the repo-level `.env` so the developer can run either app from the repo root.
    """

    environment: str = Field(default="development")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    database_url: str = Field(default="postgresql://capital_ops:capital_ops@localhost:5432/capital_ops")

    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    duckdb_seed_dir: str = Field(default=str(REPO_ROOT / "apps/api/data/seed"))

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()

