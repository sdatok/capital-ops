from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health() -> dict:
    # Simple readiness check so the frontend can verify the backend is running.
    return {"status": "ok"}

