from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import DEMO_MODE, LIVE_CAPTURE_ENABLED, get_cors_origins
from app.db.database import init_db
from app.routes.alerts import router as alerts_router
from app.routes.capture import router as capture_router
from app.routes.model import router as model_router
from app.routes.monitor import router as monitor_router
from app.routes.predict import router as predict_router
from app.routes.replay import router as replay_router
from app.routes.reports import router as reports_router


app = FastAPI(
    title="NetShield IDS API",
    description="Real-time network traffic anomaly detection backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


def service_status() -> dict:
    return {
        "message": "NetShield IDS API is running",
        "status": "online",
        "mode": "demo" if DEMO_MODE else "standard",
        "live_capture_enabled": LIVE_CAPTURE_ENABLED,
    }


@app.get("/")
def root():
    return service_status()


@app.get("/health", include_in_schema=False)
def health():
    return service_status()


app.include_router(monitor_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(model_router)
app.include_router(capture_router)
app.include_router(replay_router)
app.include_router(predict_router)
