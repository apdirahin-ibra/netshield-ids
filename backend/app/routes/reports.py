from fastapi import APIRouter
from app.db.database import get_dashboard_stats, get_recent_predictions, get_recent_alerts


router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/summary")
def report_summary():
    return {
        "status": "success",
        "summary": get_dashboard_stats(),
        "recent_predictions": get_recent_predictions(10),
        "recent_alerts": get_recent_alerts(10)
    }