from __future__ import annotations

from pathlib import Path

from pydantic import Field, field_validator
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

    database_url: str = Field(
        default="postgresql://capital_ops:capital_ops@localhost:5432/capital_ops"
    )

    # Accepts a comma-separated string in .env, e.g. CORS_ORIGINS=http://localhost:3000
    cors_origins: str = Field(default="http://localhost:3000")

    duckdb_seed_dir: str = Field(default=str(REPO_ROOT / "apps/api/data/seed"))

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
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

