from pathlib import Path
from datetime import datetime
import random
import pandas as pd

from app.services.predictor import get_predictor
from app.services.alert_manager import AlertManager
from app.services.logger import log_prediction, log_alert, log_system
from app.db.database import save_prediction, save_alert


class ReplayEngine:
    """
    Replays BENIGN or DDoS samples from CIC-IDS-2017 dataset.
    This is used for safe dashboard demonstration.
    """

    def __init__(self):
        backend_dir = Path(__file__).resolve().parents[2]
        project_dir = backend_dir.parent

        self.dataset_dir = project_dir / "dataset"

        self.predictor = get_predictor()
        self.alert_manager = AlertManager()

        self.selected_features = self.predictor.selected_features

    def _find_dataset_file(self, attack_type):
        csv_files = list(self.dataset_dir.glob("*.csv"))

        if attack_type == "BENIGN":
            for file in csv_files:
                if "Monday" in file.name:
                    return file

        if attack_type == "DDoS":
            for file in csv_files:
                if "DDoS" in file.name or "DDos" in file.name or "DDOS" in file.name:
                    return file

        # The deployment-safe fixture contains both labels and is committed to Git.
        demo_file = self.dataset_dir / "sample.csv"
        if demo_file.exists():
            return demo_file

        raise FileNotFoundError(f"No dataset file found for {attack_type}")

    def _load_samples(self, attack_type, count):
        file_path = self._find_dataset_file(attack_type)

        collected = []

        for chunk in pd.read_csv(file_path, chunksize=5000, low_memory=False):
            chunk.columns = chunk.columns.str.strip()

            if "Label" not in chunk.columns:
                continue

            chunk = chunk[chunk["Label"].astype(str).str.strip() == attack_type]

            if chunk.empty:
                continue

            available_features = [col for col in self.selected_features if col in chunk.columns]
            chunk = chunk[available_features + ["Label"]].copy()

            chunk.replace([float("inf"), float("-inf")], 0, inplace=True)
            chunk.fillna(0, inplace=True)

            collected.append(chunk)

            total_rows = sum(len(df) for df in collected)

            if total_rows >= count:
                break

        if not collected:
            raise ValueError(f"No {attack_type} samples found in dataset")

        samples = pd.concat(collected, ignore_index=True)

        if len(samples) > count:
            samples = samples.sample(n=count, random_state=42)

        return samples

    def replay(self, attack_type="BENIGN", count=20):
        """
        Replay dataset samples and save predictions/alerts into the database.
        """

        attack_type = attack_type.upper()

        if attack_type not in ["BENIGN", "DDOS"]:
            raise ValueError("attack_type must be BENIGN or DDOS")

        dataset_label = "DDoS" if attack_type == "DDOS" else "BENIGN"

        samples = self._load_samples(dataset_label, count)

        saved_predictions = 0
        saved_alerts = 0

        for index, row in samples.iterrows():
            features = {}

            for feature in self.selected_features:
                features[feature] = row.get(feature, 0)

            result = self.predictor.predict(features)

            packets = int(
                features.get("Total Fwd Packets", 0)
                + features.get("Total Backward Packets", 0)
            )

            if packets <= 0:
                packets = random.randint(3, 30)

            src_ip, dst_ip, src_port, dst_port = self._generate_demo_addresses(dataset_label, index)

            flow_key = str((src_ip, src_port, dst_ip, dst_port, "TCP"))

            prediction_log = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
                "flow_key": flow_key,
                "packets": packets,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": "TCP",
                "prediction": result["label"],
                "confidence": result["confidence"]
            }

            log_prediction(prediction_log)
            save_prediction(prediction_log)
            saved_predictions += 1

            fake_flow = {
                "flow_key": flow_key,
                "forward_ip": src_ip,
                "forward_port": src_port,
                "backward_ip": dst_ip,
                "backward_port": dst_port,
                "total_fwd_packets": int(features.get("Total Fwd Packets", packets)),
                "total_bwd_packets": int(features.get("Total Backward Packets", 0)),
                "total_fwd_bytes": int(features.get("Total Length of Fwd Packets", 0)),
                "total_bwd_bytes": int(features.get("Total Length of Bwd Packets", 0)),
            }

            alert = self.alert_manager.evaluate(fake_flow, result)

            if alert:
                log_alert(alert)
                save_alert(alert)
                saved_alerts += 1

        log_system(f"Replay completed: {dataset_label}, predictions={saved_predictions}, alerts={saved_alerts}")

        return {
            "status": "success",
            "replay_type": dataset_label,
            "saved_predictions": saved_predictions,
            "saved_alerts": saved_alerts
        }

    def get_random_sample(self, traffic_type="MIXED"):
        """
        Return one random BENIGN or DDoS dataset sample for manual prediction form.
        """

        traffic_type = traffic_type.upper()

        if traffic_type == "MIXED":
            dataset_label = random.choice(["BENIGN", "DDoS"])
        elif traffic_type == "BENIGN":
            dataset_label = "BENIGN"
        elif traffic_type in ["DDOS", "DDoS"]:
            dataset_label = "DDoS"
        else:
            raise ValueError("traffic_type must be BENIGN, DDOS, or MIXED")

        samples = self._load_samples(dataset_label, 500)

        sample = samples.sample(n=1).iloc[0]

        features = {}

        for feature in self.selected_features:
            features[feature] = float(sample.get(feature, 0))

        prediction_result = self.predictor.predict(features)

        return {
            "status": "success",
            "sample_label": dataset_label,
            "model_prediction": prediction_result["label"],
            "confidence": prediction_result["confidence"],
            "features": features
        }

    def _generate_demo_addresses(self, label, index):
        if label == "DDoS":
            src_ip = f"203.0.113.{random.randint(10, 250)}"
            dst_ip = "192.168.100.200"
            src_port = random.randint(10000, 65000)
            dst_port = 80
        else:
            src_ip = "192.168.100.200"
            dst_ip = f"104.18.{random.randint(1, 250)}.{random.randint(1, 250)}"
            src_port = random.randint(10000, 65000)
            dst_port = 443

        return src_ip, dst_ip, src_port, dst_port


replay_engine = ReplayEngine()
