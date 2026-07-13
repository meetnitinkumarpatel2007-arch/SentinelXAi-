from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from contextlib import asynccontextmanager

# આપણા મોડ્યુલ્સ
from app.database import init_pool, close_pool
from app.ml.model import detector  # તમારું AI મોડલ
from app.api.v1.detector import router as detector_router
from app.api.v1.auth import router as auth_router

# .env ફાઈલ લોડ કરો
load_dotenv()

# લોગિંગ સેટઅપ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    સર્વર શરૂ થાય ત્યારે ડેટાબેઝ કનેક્ટ કરો અને AI મોડલ ટ્રેન કરો.
    """
    # ૧. ડેટાબેઝ કનેક્શન
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL is missing in environment variables!")
    else:
        logger.info("Initializing database pool...")
        await init_pool(db_url)
    
    # ૨. AI મોડલ ટ્રેનિંગ
    logger.info("Starting AI model training...")
    try:
        detector.train()
        logger.info("AI model trained successfully!")
    except Exception as e:
        logger.error(f"Error during AI model training: {e}")
    
    yield  # અહીં એપ્લિકેશન રન થશે
    
    # સર્વર બંધ થાય ત્યારે
    try:
        await close_pool()
        logger.info("Shutdown complete.")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# FastAPI એપ ઇનિશિયલાઈઝેશન
app = FastAPI(title="SentinelXAi API", lifespan=lifespan)

# 🛡️ 5. GLOBAL ANTI-LEAKAGE ERROR HANDLER
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error server-side for debugging, do not expose to user
    logger.error(f"Critical System Error at {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. The incident has been logged."},
    )

# 🛡️ 3. SECURE CORS સેટિંગ્સ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Restrict to frontend only, no "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# રાઉટર્સ રજીસ્ટર કરો
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(detector_router, prefix="/api/v1/detector", tags=["Detector"])

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "API is healthy!"}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "SentinelXAi Backend is running with AI Detection",
        "model_status": "trained" if hasattr(detector, 'is_trained') and detector.is_trained else "idle"
    }