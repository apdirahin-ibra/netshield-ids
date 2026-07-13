"""Evaluate saved model on dataset CSV files."""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "dataset"
MODEL_DIR = ROOT / "backend" / "model"

LABEL_COL = "Label"
SAMPLE_ROWS = 20_000


def main():
    model_path = MODEL_DIR / "best_model.pkl"
    if not model_path.exists():
        model_path = MODEL_DIR / "random_forest.pkl"
    model = joblib.load(model_path)
    scaler = joblib.load(MODEL_DIR / "scaler.pkl")
    features = joblib.load(MODEL_DIR / "selected_features.pkl")

    files = list(DATASET_DIR.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSV in {DATASET_DIR}")

    df = pd.concat(
        [pd.read_csv(f, nrows=SAMPLE_ROWS // len(files)) for f in files],
        ignore_index=True,
    )
    df.columns = df.columns.str.strip()
    df[LABEL_COL] = df[LABEL_COL].astype(str).str.strip()

    X = pd.DataFrame({c: df[c] if c in df.columns else 0 for c in features})
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0).values
    X = scaler.transform(X)

    from sklearn.preprocessing import LabelEncoder

    le = LabelEncoder()
    y = le.fit_transform(df[LABEL_COL])
    y_pred = model.predict(X)

    print("Classification report:")
    print(classification_report(y, y_pred, target_names=le.classes_))
    print("Confusion matrix:")
    print(confusion_matrix(y, y_pred))


if __name__ == "__main__":
    main()
