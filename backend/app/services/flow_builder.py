class FlowBuilder:
    """
    Builds network flows from captured packets.
    A flow groups packets between two endpoints.
    """

    def __init__(self):
        self.flows = {}

    def _get_flow_key(self, packet):
        """
        Create a bidirectional flow key.
        This makes forward and backward packets belong to the same flow.
        """

        endpoint_1 = (packet["src_ip"], packet["src_port"])
        endpoint_2 = (packet["dst_ip"], packet["dst_port"])

        if endpoint_1 <= endpoint_2:
            ordered = (endpoint_1, endpoint_2)
        else:
            ordered = (endpoint_2, endpoint_1)

        return (
            ordered[0][0],
            ordered[0][1],
            ordered[1][0],
            ordered[1][1],
            packet["protocol"]
        )

    def update_flow(self, packet):
        """
        Add packet information to its related flow.
        """

        flow_key = self._get_flow_key(packet)
        timestamp = packet["timestamp_epoch"]
        packet_length = packet["packet_length"]

        if flow_key not in self.flows:
            self.flows[flow_key] = {
                "flow_key": flow_key,
                "start_time": timestamp,
                "last_time": timestamp,

                "forward_ip": packet["src_ip"],
                "forward_port": packet["src_port"],
                "backward_ip": packet["dst_ip"],
                "backward_port": packet["dst_port"],

                "total_fwd_packets": 0,
                "total_bwd_packets": 0,
                "total_fwd_bytes": 0,
                "total_bwd_bytes": 0,

                "packet_lengths": [],

                "syn_count": 0,
                "ack_count": 0,
                "psh_count": 0,
            }

        flow = self.flows[flow_key]
        flow["last_time"] = timestamp
        flow["packet_lengths"].append(packet_length)

        is_forward = (
            packet["src_ip"] == flow["forward_ip"]
            and packet["src_port"] == flow["forward_port"]
        )

        if is_forward:
            flow["total_fwd_packets"] += 1
            flow["total_fwd_bytes"] += packet_length
        else:
            flow["total_bwd_packets"] += 1
            flow["total_bwd_bytes"] += packet_length

        flags = packet.get("tcp_flags", "")

        if "S" in flags:
            flow["syn_count"] += 1

        if "A" in flags:
            flow["ack_count"] += 1

        if "P" in flags:
            flow["psh_count"] += 1

        return flow

    def get_all_flows(self):
        return list(self.flows.values())