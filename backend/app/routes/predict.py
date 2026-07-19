from typing import Any, Dict

from fastapi import APIRouter, Depends, Query

from app.auth import get_current_user
from app.db.database import get_manual_prediction_history, save_manual_prediction
from app.services.predictor import get_predictor


router = APIRouter(prefix="/api/predict", tags=["Manual Prediction"])

predictor = get_predictor()


def generate_reason(features: Dict[str, Any], prediction_label: str) -> str:
    """Describe visible traffic patterns without claiming model attribution."""

    def value(name: str) -> float:
        try:
            return float(features.get(name, 0) or 0)
        except (TypeError, ValueError):
            return 0.0

    fwd_packets = value("Total Fwd Packets")
    bwd_packets = value("Total Backward Packets")
    fwd_length = value("Total Length of Fwd Packets")
    bwd_length = value("Total Length of Bwd Packets")
    bytes_per_second = value("Flow Bytes/s")
    packets_per_second = value("Flow Packets/s")
    packet_length_mean = value("Packet Length Mean")
    average_packet_size = value("Average Packet Size")
    syn_count = value("SYN Flag Count")
    ack_count = value("ACK Flag Count")
    psh_count = value("PSH Flag Count")

    patterns = []

    if prediction_label == "DDoS":
        if fwd_packets > 0 and bwd_packets == 0:
            patterns.append("one-way traffic with forward packets but no return packets")
        if fwd_length > 0 and bwd_length == 0:
            patterns.append("forward data with no response data from the destination")
        if bwd_length > 0 and (fwd_length == 0 or bwd_length >= fwd_length * 2):
            patterns.append("asymmetric data size between the forward and backward directions")
        if average_packet_size >= 1000 or packet_length_mean >= 1000:
            patterns.append("a large packet-size pattern")
        if bytes_per_second >= 10000:
            patterns.append("a high byte transfer rate")
        if packets_per_second >= 100:
            patterns.append("a high packet rate")
        if fwd_packets + bwd_packets >= 20:
            patterns.append("increased packet activity")
        if syn_count >= 5:
            patterns.append("an elevated SYN flag count consistent with possible SYN flood behavior")
        if psh_count > 0:
            patterns.append("immediate data push behavior indicated by PSH flags")
        if fwd_packets + bwd_packets > 0 and ack_count == 0:
            patterns.append("packets without acknowledgement flags")

        if not patterns:
            return (
                "This flow was classified as DDoS because the combined packet, byte, flag, "
                "and packet-size values form a visible pattern closer to the attack traffic "
                "learned by the model."
            )

        selected_patterns = patterns[:3]
        if len(selected_patterns) == 1:
            visible_patterns = selected_patterns[0]
        elif len(selected_patterns) == 2:
            visible_patterns = " and ".join(selected_patterns)
        else:
            visible_patterns = ", ".join(selected_patterns[:-1]) + f", and {selected_patterns[-1]}"

        return (
            f"This flow was classified as DDoS because it shows {visible_patterns}. "
            "This explanation is based on visible feature patterns associated with attack traffic."
        )

    if fwd_packets + bwd_packets <= 20:
        patterns.append("low traffic activity with few packets")
    if syn_count <= 1:
        patterns.append("no strong SYN flood pattern")
    if bytes_per_second < 100000 and packets_per_second < 1000:
        patterns.append("a moderate traffic rate")
    if packet_length_mean <= 1500 and average_packet_size <= 1500:
        patterns.append("no unusually large packet-size pattern")

    if not patterns:
        return (
            "This flow was classified as BENIGN because its overall visible feature "
            "pattern is closer to the normal traffic learned by the model."
        )

    return "This flow was classified as BENIGN because it shows " + "; ".join(patterns) + "."


@router.post("/flow")
def predict_flow(features: Dict[str, Any], current_user=Depends(get_current_user)):
    """
    Manual prediction endpoint.
    Receives the 12 selected features and returns BENIGN or DDoS.
    """

    result = predictor.predict(features)
    prediction_label = result["label"]

    response = {
        "status": "Attack Detected" if prediction_label == "DDoS" else "Normal Traffic",
        "prediction": prediction_label,
        "confidence": result["confidence"],
        "reason": generate_reason(result["features"], prediction_label),
        "class_id": result["prediction"],
        "features_used": result["features"],
    }
    response["history_id"] = save_manual_prediction(current_user, response)
    return response


@router.get("/history")
def prediction_history(
    limit: int = Query(default=200, ge=1, le=500),
    _current_user=Depends(get_current_user),
):
    return {
        "status": "success",
        "data": get_manual_prediction_history(limit),
    }
