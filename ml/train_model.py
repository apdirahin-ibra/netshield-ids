"""
Train Random Forest on CIC-IDS2017 CSV exports.
Place dataset CSV files in ../dataset/ then run:
  python train_model.py
"""

from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "dataset"
MODEL_DIR = ROOT / "backend" / "model"

SELECTED_FEATURES = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Fwd Packet Length Max",
    "Fwd Packet Length Min",
    "Fwd Packet Length Mean",
    "Bwd Packet Length Max",
    "Bwd Packet Length Min",
    "Bwd Packet Length Mean",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Fwd Packets/s",
    "Bwd Packets/s",
    "Packet Length Mean",
    "Packet Length Std",
    "Packet Length Variance",
    "FIN Flag Count",
    "SYN Flag Count",
    "RST Flag Count",
    "PSH Flag Count",
    "ACK Flag Count",
    "URG Flag Count",
    "Down/Up Ratio",
    "Average Packet Size",
    "Avg Fwd Segment Size",
    "Avg Bwd Segment Size",
    "Subflow Fwd Packets",
    "Subflow Bwd Packets",
]

LABEL_COL = "Label"
SAMPLE_ROWS = 80_000


def load_datasets() -> pd.DataFrame:
    files = list(DATASET_DIR.glob("*.csv"))
    if not files:
        raise FileNotFoundError(
            f"No CSV files in {DATASET_DIR}. Add CIC-IDS2017 CSV exports."
        )
    frames = []
    for path in files:
        print(f"Loading {path.name} ...")
        df = pd.read_csv(path, nrows=SAMPLE_ROWS // len(files))
        df.columns = df.columns.str.strip()
        frames.append(df)
    return pd.concat(frames, ignore_index=True)


def prepare_data(df: pd.DataFrame):
    if LABEL_COL not in df.columns:
        raise ValueError(f"Expected column '{LABEL_COL}' in dataset")

    df[LABEL_COL] = df[LABEL_COL].astype(str).str.strip()
    available = [c for c in SELECTED_FEATURES if c in df.columns]
    missing = set(SELECTED_FEATURES) - set(available)
    if missing:
        print(f"Warning: missing features (filled with 0): {missing}")

    X = pd.DataFrame({c: df[c] if c in df.columns else 0 for c in SELECTED_FEATURES})
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

    y_raw = df[LABEL_COL]
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    return X.values, y, le, available


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    df = load_datasets()
    X, y, label_encoder, _ = prepare_data(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        n_jobs=-1,
        random_state=42,
        class_weight="balanced",
    )
    print("Training Random Forest ...")
    clf.fit(X_train_s, y_train)

    y_pred = clf.predict(X_test_s)
    target_names = list(label_encoder.classes_)
    print(classification_report(y_test, y_pred, target_names=target_names))

    joblib.dump(clf, MODEL_DIR / "best_model.pkl")
    joblib.dump(clf, MODEL_DIR / "random_forest.pkl")
    joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
    joblib.dump(SELECTED_FEATURES, MODEL_DIR / "selected_features.pkl")

    meta = f"{datetime.utcnow().isoformat()}Z | classes={target_names}"
    (MODEL_DIR / "training_meta.txt").write_text(meta, encoding="utf-8")
    print(f"Saved model artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    main()
