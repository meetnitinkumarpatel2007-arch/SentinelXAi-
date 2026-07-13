"""Health and readiness endpoints."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Liveness probe for the API gateway."""
    return {"status": "ok", "service": "sentinelx-api"}
