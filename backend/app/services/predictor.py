from pathlib import Path
from functools import lru_cache
import numpy as np
import pandas as pd
import joblib


class NetShieldPredictor:
    def __init__(self):
        # backend/app/services/predictor.py → backend/
        backend_dir = Path(__file__).resolve().parents[2]
        model_dir = backend_dir / "model"

        self.model_path = model_dir / "best_model.pkl"
        self.fallback_model_path = model_dir / "random_forest.pkl"
        self.scaler_path = model_dir / "scaler.pkl"
        self.features_path = model_dir / "selected_features.pkl"

        # Load model
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)
            print("Loaded model: best_model.pkl")
        else:
            self.model = joblib.load(self.fallback_model_path)
            print("Loaded model: random_forest.pkl")

        # Load scaler and selected features
        self.scaler = joblib.load(self.scaler_path)
        self.selected_features = joblib.load(self.features_path)

    def predict(self, features_dict):
        """
        Predict whether a flow is BENIGN or DDoS.
        """

        # Arrange features in the same order used during training
        input_data = {}

        for feature in self.selected_features:
            input_data[feature] = features_dict.get(feature, 0)

        # Convert to DataFrame with feature names
        df = pd.DataFrame([input_data], columns=self.selected_features)

        # Clean invalid values
        df.replace([np.inf, -np.inf], 0, inplace=True)
        df.fillna(0, inplace=True)

        # Scale features
        scaled_data = self.scaler.transform(df)

        # Convert scaled data back to DataFrame to keep feature names
        scaled_df = pd.DataFrame(
            scaled_data,
            columns=self.selected_features
        )

        # Predict
        prediction = self.model.predict(scaled_df)[0]

        # Confidence score
        if hasattr(self.model, "predict_proba"):
            probability = self.model.predict_proba(scaled_df)[0]
            confidence = float(max(probability))
        else:
            confidence = None

        label = "DDoS" if int(prediction) == 1 else "BENIGN"

        return {
            "prediction": int(prediction),
            "label": label,
            "confidence": confidence,
            "features": input_data
        }


@lru_cache(maxsize=1)
def get_predictor() -> NetShieldPredictor:
    """Share one loaded model across capture, replay, and manual prediction."""
    return NetShieldPredictor()
