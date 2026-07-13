from fastapi import APIRouter
from pathlib import Path
import joblib


router = APIRouter(prefix="/api/model-info", tags=["Model Info"])


@router.get("/")
def model_info():
    backend_dir = Path(__file__).resolve().parents[2]
    model_dir = backend_dir / "model"

    features_path = model_dir / "selected_features.pkl"
    selected_features = joblib.load(features_path)

    return {
        "status": "success",
        "model_name": "Random Forest",
        "deployment_file": "best_model.pkl",
        "task": "Network Traffic Anomaly Detection",
        "classes": ["BENIGN", "DDoS"],
        "feature_count": len(selected_features),
        "selected_features": selected_features
    }