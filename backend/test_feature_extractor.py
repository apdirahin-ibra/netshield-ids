from scapy.all import sniff
from app.services.capture import packet_to_dict
from app.services.flow_builder import FlowBuilder
from app.services.feature_extractor import extract_features

flow_builder = FlowBuilder()


def handle_packet(packet):
    packet_data = packet_to_dict(packet)

    if packet_data:
        flow = flow_builder.update_flow(packet_data)
        features = extract_features(flow)

        print("\nFEATURES EXTRACTED")
        for key, value in features.items():
            print(f"{key}: {value}")


print("Starting NetShield feature extraction test...")

sniff(
    count=20,
    prn=handle_packet,
    store=False
)

print("\nFeature extraction test finished.")
print("Total flows created:", len(flow_builder.get_all_flows()))