from scapy.arch.windows import get_windows_if_list

print("Available Windows network interfaces:\n")

for i, iface in enumerate(get_windows_if_list(), start=1):
    print(f"Interface {i}")
    print("Name:", iface.get("name"))
    print("Description:", iface.get("description"))
    print("GUID:", iface.get("guid"))
    print("MAC:", iface.get("mac"))
    print("IPs:", iface.get("ips"))
    print("-" * 70)