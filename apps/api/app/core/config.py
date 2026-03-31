from __future__ import annotations

from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# config.py lives at apps/api/app/core/config.py
# parents[2] → apps/api/          (API root, works in Railway where container root = apps/api)
# parents[3] → capital-ops/       (repo root, used only for local .env lookup)
_API_ROOT = Path(__file__).resolve().parents[2]
_REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    """
    Central configuration for the API.

    Uses the repo-level `.env` for local dev. In production (Railway) env vars
    are injected directly and the missing .env file is silently ignored.
    """

    environment: str = Field(default="development")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    database_url: str = Field(
        default="postgresql://capital_ops:capital_ops@localhost:5432/capital_ops"
    )

    # Accepts a comma-separated string in .env, e.g. CORS_ORIGINS=http://localhost:3000
    cors_origins: str = Field(default="http://localhost:3000")

    # Resolves to apps/api/data/seed in both local dev and Railway container.
    duckdb_seed_dir: str = Field(default=str(_API_ROOT / "data" / "seed"))

    model_config = SettingsConfigDict(
        env_file=str(_REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: object) -> str:
        if isinstance(v, list):
            return ",".join(str(i) for i in v)
        return str(v)


settings = Settings()

