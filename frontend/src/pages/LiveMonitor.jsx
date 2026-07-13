import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import TrafficTable from "../components/TrafficTable";
import { api } from "../services/api";

export default function LiveMonitor() {
  const [status, setStatus] = useState(null);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const [s, f] = await Promise.all([
      api.getMonitorStatus(),
      api.getLiveFlows(50),
    ]);
    setStatus(s);
    setFlows(f);
  };

  useEffect(() => {
    refresh().catch(() => {});
    const id = setInterval(() => refresh().catch(() => {}), 2000);
    return () => clearInterval(id);
  }, []);

  const start = async (simulate = true) => {
    setLoading(true);
    try {
      await api.startMonitor(simulate);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const stop = async () => {
    setLoading(true);
    try {
      await api.stopMonitor();
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Live Monitor</h1>
      <p className="subtitle">
        Capture packets, build flows, and classify in real time
      </p>

      <div className="toolbar">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || status?.running}
          onClick={() => start(true)}
        >
          Start (simulate)
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loading || status?.running}
          onClick={() => start(false)}
        >
          Start (live / scapy)
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={loading || !status?.running}
          onClick={stop}
        >
          Stop
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Mode" value={status?.mode ?? "—"} />
        <StatCard title="Packets" value={status?.packets_captured ?? 0} />
        <StatCard title="Flows" value={status?.flows_processed ?? 0} />
        <StatCard title="Attacks" value={status?.attacks_detected ?? 0} />
      </div>

      <div className="panel">
        <h2>Live flow feed</h2>
        <TrafficTable
          flows={flows}
          emptyMessage={
            status?.running
              ? "Waiting for completed flows…"
              : "Start monitoring to see live traffic"
          }
        />
      </div>
    </div>
  );
}
