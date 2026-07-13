from fastapi import APIRouter
from app.db.database import get_recent_alerts


router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/")
def alerts(limit: int = 20):
    return {
        "status": "success",
        "data": get_recent_alerts(limit)
    }