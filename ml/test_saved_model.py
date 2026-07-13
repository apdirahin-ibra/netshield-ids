"""Quick smoke test for saved model artifacts."""

from pathlib import Path

import joblib
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "backend" / "model"


def main():
    model_path = MODEL_DIR / "best_model.pkl"
    if not model_path.exists():
        model_path = MODEL_DIR / "random_forest.pkl"
    scaler_path = MODEL_DIR / "scaler.pkl"
    features_path = MODEL_DIR / "selected_features.pkl"

    for p in (model_path, scaler_path, features_path):
        assert p.exists(), f"Missing {p}"

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    features = joblib.load(features_path)

    sample = np.zeros((1, len(features)))
    sample_scaled = scaler.transform(sample)
    pred = model.predict(sample_scaled)
    proba = model.predict_proba(sample_scaled)

    print("Features:", len(features))
    print("Classes:", list(model.classes_))
    print("Sample prediction:", pred[0])
    print("Sample probabilities:", proba[0])
    print("OK — model loads and predicts.")


if __name__ == "__main__":
    main()
