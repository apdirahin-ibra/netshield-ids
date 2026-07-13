from datetime import datetime
import uuid


class AlertManager:
    """
    Creates security alerts when DDoS traffic is detected.
    """

    def __init__(self, confidence_threshold=0.80):
        self.confidence_threshold = confidence_threshold

    def evaluate(self, flow, prediction_result):
        """
        Check prediction result and create an alert if needed.
        """

        label = prediction_result.get("label")
        confidence = prediction_result.get("confidence")

        if label != "DDoS":
            return None

        if confidence is not None and confidence < self.confidence_threshold:
            return None

        total_packets = flow["total_fwd_packets"] + flow["total_bwd_packets"]
        total_bytes = flow["total_fwd_bytes"] + flow["total_bwd_bytes"]

        alert = {
            "alert_id": str(uuid.uuid4()),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "alert_type": "DDoS Attack Detected",
            "severity": self._get_severity(confidence, total_packets),
            "flow_key": str(flow["flow_key"]),
            "source": f"{flow['forward_ip']}:{flow['forward_port']}",
            "destination": f"{flow['backward_ip']}:{flow['backward_port']}",
            "total_packets": total_packets,
            "total_bytes": total_bytes,
            "prediction": label,
            "confidence": confidence
        }

        return alert

    def _get_severity(self, confidence, total_packets):
        """
        Decide alert severity.
        """

        if confidence is not None and confidence >= 0.95 and total_packets >= 10:
            return "HIGH"

        if confidence is not None and confidence >= 0.85:
            return "MEDIUM"

        return "LOW"