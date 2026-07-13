def extract_features(flow):
    """
    Convert a network flow into the 12 selected ML features.
    Feature names must match selected_features.pkl.
    """

    flow_duration_seconds = flow["last_time"] - flow["start_time"]

    if flow_duration_seconds <= 0:
        flow_duration_seconds = 0.000001

    flow_duration_microseconds = flow_duration_seconds * 1_000_000

    total_fwd_packets = flow["total_fwd_packets"]
    total_bwd_packets = flow["total_bwd_packets"]

    total_fwd_bytes = flow["total_fwd_bytes"]
    total_bwd_bytes = flow["total_bwd_bytes"]

    total_packets = total_fwd_packets + total_bwd_packets
    total_bytes = total_fwd_bytes + total_bwd_bytes

    packet_lengths = flow["packet_lengths"]

    if total_packets > 0:
        packet_length_mean = sum(packet_lengths) / total_packets
        average_packet_size = total_bytes / total_packets
    else:
        packet_length_mean = 0
        average_packet_size = 0

    flow_bytes_per_second = total_bytes / flow_duration_seconds
    flow_packets_per_second = total_packets / flow_duration_seconds

    features = {
        "Flow Duration": flow_duration_microseconds,
        "Total Fwd Packets": total_fwd_packets,
        "Total Backward Packets": total_bwd_packets,
        "Total Length of Fwd Packets": total_fwd_bytes,
        "Total Length of Bwd Packets": total_bwd_bytes,
        "Flow Bytes/s": flow_bytes_per_second,
        "Flow Packets/s": flow_packets_per_second,
        "Packet Length Mean": packet_length_mean,
        "SYN Flag Count": flow["syn_count"],
        "ACK Flag Count": flow["ack_count"],
        "PSH Flag Count": flow["psh_count"],
        "Average Packet Size": average_packet_size,
    }

    return features