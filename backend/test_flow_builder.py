from scapy.all import sniff
from app.services.capture import packet_to_dict
from app.services.flow_builder import FlowBuilder

flow_builder = FlowBuilder()


def handle_packet(packet):
    packet_data = packet_to_dict(packet)

    if packet_data:
        flow = flow_builder.update_flow(packet_data)

        print("\nFLOW UPDATED")
        print("Flow Key:", flow["flow_key"])
        print("FWD Packets:", flow["total_fwd_packets"])
        print("BWD Packets:", flow["total_bwd_packets"])
        print("FWD Bytes:", flow["total_fwd_bytes"])
        print("BWD Bytes:", flow["total_bwd_bytes"])
        print("SYN:", flow["syn_count"], "ACK:", flow["ack_count"], "PSH:", flow["psh_count"])


print("Starting NetShield flow builder test...")

sniff(
    count=20,
    prn=handle_packet,
    store=False
)

print("\nCapture finished.")
print("Total flows created:", len(flow_builder.get_all_flows()))