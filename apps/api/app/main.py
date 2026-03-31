from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.companies import router as companies_router
from app.api.routes.health import router as health_router
from app.api.routes.peers import router as peers_router
from app.api.routes.scenario import router as scenario_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Warm up DuckDB and load seed data before the first request.
    from app.duckdb.db import get_conn
    get_conn()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Capital Ops API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, tags=["health"])
    app.include_router(companies_router)
    app.include_router(peers_router)
    app.include_router(scenario_router)

    return app


app = create_app()
