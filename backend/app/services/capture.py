from scapy.all import sniff, IP, TCP, UDP
from datetime import datetime


def packet_to_dict(packet):
    """
    Convert a captured packet into a clean dictionary.
    Only IP packets are processed.
    """

    if IP not in packet:
        return None

    protocol = "OTHER"
    src_port = None
    dst_port = None
    tcp_flags = ""

    if TCP in packet:
        protocol = "TCP"
        src_port = packet[TCP].sport
        dst_port = packet[TCP].dport
        tcp_flags = str(packet[TCP].flags)

    elif UDP in packet:
        protocol = "UDP"
        src_port = packet[UDP].sport
        dst_port = packet[UDP].dport

    timestamp_epoch = float(packet.time)

    packet_data = {
        "timestamp": datetime.fromtimestamp(timestamp_epoch).strftime("%Y-%m-%d %H:%M:%S.%f"),
        "timestamp_epoch": timestamp_epoch,
        "src_ip": packet[IP].src,
        "dst_ip": packet[IP].dst,
        "src_port": src_port,
        "dst_port": dst_port,
        "protocol": protocol,
        "packet_length": len(packet),
        "tcp_flags": tcp_flags,
    }

    return packet_data


def process_packet(packet):
    packet_data = packet_to_dict(packet)

    if packet_data:
        print(packet_data)


def start_capture(interface=None, count=10):
    """
    Start live packet capture.
    If interface is None, Scapy uses the default active interface.
    """

    print("Starting NetShield packet capture...")

    sniff(
        iface=interface,
        count=count,
        prn=process_packet,
        store=False
    )

    print("Packet capture finished.")