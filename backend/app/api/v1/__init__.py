from fastapi import APIRouter
from . import auth, health, detector


router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(health.router, prefix="/health", tags=["Health"])
router.include_router(detector.router, prefix="/detector", tags=["Detector"])