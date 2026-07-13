from scapy.all import sniff
from app.services.capture import packet_to_dict
from app.services.flow_builder import FlowBuilder
from app.services.feature_extractor import extract_features
from app.services.predictor import NetShieldPredictor
from app.services.alert_manager import AlertManager
from app.services.logger import log_prediction, log_alert, log_system
from app.db.database import init_db, save_prediction, save_alert


flow_builder = FlowBuilder()
predictor = NetShieldPredictor()
alert_manager = AlertManager()

init_db()


def handle_packet(packet):
    packet_data = packet_to_dict(packet)

    if not packet_data:
        return

    flow = flow_builder.update_flow(packet_data)

    total_packets = flow["total_fwd_packets"] + flow["total_bwd_packets"]

    # Avoid predicting too early on tiny unfinished flows
    if total_packets < 3:
        return

    features = extract_features(flow)
    result = predictor.predict(features)

    prediction_log = {
        "timestamp": packet_data["timestamp"],
        "flow_key": str(flow["flow_key"]),
        "packets": total_packets,
        "src_ip": packet_data["src_ip"],
        "dst_ip": packet_data["dst_ip"],
        "protocol": packet_data["protocol"],
        "prediction": result["label"],
        "confidence": result["confidence"]
    }

    # Save to file log
    log_prediction(prediction_log)

    # Save to SQLite database
    save_prediction(prediction_log)

    alert = alert_manager.evaluate(flow, result)

    print("\nNETSHIELD PREDICTION")
    print("Flow:", flow["flow_key"])
    print("Packets:", total_packets)
    print("Result:", result["label"])
    print("Confidence:", result["confidence"])

    if alert:
        log_alert(alert)
        save_alert(alert)

        print("🚨 ALERT:", alert["alert_type"])
        print("Severity:", alert["severity"])


print("Starting NetShield live prediction + DB logging test...")
log_system("NetShield live prediction + DB logging test started")

sniff(
    count=30,
    prn=handle_packet,
    store=False
)

log_system("NetShield live prediction + DB logging test finished")

print("\nLive prediction test finished.")
print("Total flows created:", len(flow_builder.get_all_flows()))
print("Predictions saved to backend/data/netshield.db")
print("Predictions also saved to backend/logs/predictions.log")