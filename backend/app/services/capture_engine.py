from datetime import datetime
from scapy.all import AsyncSniffer

from app.services.capture import packet_to_dict
from app.services.flow_builder import FlowBuilder
from app.services.feature_extractor import extract_features
from app.services.predictor import get_predictor
from app.services.alert_manager import AlertManager
from app.services.logger import log_prediction, log_alert, log_system
from app.db.database import save_prediction, save_alert


class LiveCaptureEngine:
    def __init__(self):
        self.flow_builder = FlowBuilder()
        self.predictor = get_predictor()
        self.alert_manager = AlertManager()

        self.sniffer = None
        self.is_running = False
        self.started_at = None

        self.packet_count = 0
        self.prediction_count = 0
        self.alert_count = 0

        # Prevent saving too many repeated predictions
        self.last_saved_packet_count = {}

    def start(self, interface=None):
        if self.is_running:
            return {
                "status": "already_running",
                "message": "Live capture is already running"
            }

        self.sniffer = AsyncSniffer(
            iface=interface,
            prn=self._handle_packet,
            store=False
        )

        self.sniffer.start()

        self.is_running = True
        self.started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        log_system("Live capture started")

        return {
            "status": "started",
            "message": "Live capture started successfully",
            "interface": interface or "default"
        }

    def stop(self):
        if not self.is_running:
            return {
                "status": "not_running",
                "message": "Live capture is not running"
            }

        try:
            self.sniffer.stop()
        except Exception as error:
            return {
                "status": "error",
                "message": str(error)
            }

        self.is_running = False
        log_system("Live capture stopped")

        return {
            "status": "stopped",
            "message": "Live capture stopped successfully"
        }

    def get_status(self):
        return {
            "is_running": self.is_running,
            "started_at": self.started_at,
            "packet_count": self.packet_count,
            "prediction_count": self.prediction_count,
            "alert_count": self.alert_count,
            "total_flows": len(self.flow_builder.get_all_flows())
        }

    def _should_save_prediction(self, flow_key, total_packets, label):
        """
        Save fewer repeated rows.
        Save first prediction, every 5 packets, and always save DDoS.
        """

        if label == "DDoS":
            return True

        if flow_key not in self.last_saved_packet_count:
            self.last_saved_packet_count[flow_key] = total_packets
            return True

        last_saved = self.last_saved_packet_count[flow_key]

        if total_packets - last_saved >= 5:
            self.last_saved_packet_count[flow_key] = total_packets
            return True

        return False

    def _handle_packet(self, packet):
        packet_data = packet_to_dict(packet)

        if not packet_data:
            return

        self.packet_count += 1

        flow = self.flow_builder.update_flow(packet_data)

        total_packets = flow["total_fwd_packets"] + flow["total_bwd_packets"]

        # Avoid predicting too early on tiny unfinished flows
        if total_packets < 3:
            return

        features = extract_features(flow)
        result = self.predictor.predict(features)

        flow_key = str(flow["flow_key"])
        label = result["label"]

        if not self._should_save_prediction(flow_key, total_packets, label):
            return

        prediction_log = {
            "timestamp": packet_data["timestamp"],
            "flow_key": flow_key,
            "packets": total_packets,
            "src_ip": packet_data["src_ip"],
            "dst_ip": packet_data["dst_ip"],
            "protocol": packet_data["protocol"],
            "prediction": label,
            "confidence": result["confidence"]
        }

        log_prediction(prediction_log)
        save_prediction(prediction_log)

        self.prediction_count += 1

        alert = self.alert_manager.evaluate(flow, result)

        if alert:
            log_alert(alert)
            save_alert(alert)
            self.alert_count += 1


capture_engine = LiveCaptureEngine()
