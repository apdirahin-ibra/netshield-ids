from fastapi import APIRouter, HTTPException, status
from app.config import DEMO_MODE
from app.db.database import (
    clear_dashboard_data,
    get_dashboard_stats,
    get_recent_predictions,
)


router = APIRouter(prefix="/api/monitor", tags=["Monitor"])


@router.get("/live")
def live_monitor(limit: int = 20):
    return {
        "status": "success",
        "data": get_recent_predictions(limit)
    }


@router.get("/stats")
def monitor_stats():
    return {
        "status": "success",
        "data": get_dashboard_stats()
    }


@router.delete("/clear")
def clear_monitor_data():
    if DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clearing shared data is disabled in the public demo.",
        )
    deleted = clear_dashboard_data()
    return {
        "status": "success",
        "message": "All predictions and security alerts were cleared.",
        "data": deleted,
    }
