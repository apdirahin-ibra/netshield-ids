from fastapi import APIRouter, HTTPException, status

from app.config import DEMO_MODE, LIVE_CAPTURE_ENABLED
from app.services.capture_engine import capture_engine


router = APIRouter(prefix="/api/capture", tags=["Live Capture"])


def require_live_capture() -> None:
    if not LIVE_CAPTURE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Live packet capture is disabled in this cloud demo. Use the replay controls instead.",
        )


@router.post("/start")
def start_capture(interface: str | None = None):
    require_live_capture()
    return capture_engine.start(interface=interface)


@router.post("/stop")
def stop_capture():
    require_live_capture()
    return capture_engine.stop()


@router.get("/status")
def capture_status():
    capture_data = capture_engine.get_status()
    capture_data.update(
        {
            "capture_enabled": LIVE_CAPTURE_ENABLED,
            "demo_mode": DEMO_MODE,
        }
    )
    return {
        "status": "success",
        "data": capture_data,
    }
