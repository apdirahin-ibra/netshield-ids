import { useEffect, useState } from "react";
import TrafficTable from "../components/TrafficTable";
import { api } from "../services/api";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [attacks, setAttacks] = useState([]);
  const [hours, setHours] = useState(24);

  useEffect(() => {
    api.getReportSummary(hours).then(setSummary).catch(() => {});
    api.getFlows(50, true).then(setAttacks).catch(() => {});
  }, [hours]);

  return (
    <div className="page">
      <h1>Reports</h1>
      <p className="subtitle">Historical flow and attack analysis</p>

      <div className="toolbar">
        <label style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Period:{" "}
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{
              marginLeft: 8,
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "0.35rem 0.5rem",
            }}
          >
            <option value={1}>1 hour</option>
            <option value={24}>24 hours</option>
            <option value={168}>7 days</option>
          </select>
        </label>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="panel" style={{ marginBottom: 0 }}>
            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
              TOTAL FLOWS
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              {summary.total_flows}
            </div>
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
              ATTACKS
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger)" }}>
              {summary.total_attacks}
            </div>
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
              ALERTS
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              {summary.alert_count}
            </div>
          </div>
        </div>
      )}

      {summary?.attack_breakdown && (
        <div className="panel">
          <h2>Attack breakdown</h2>
          <ul style={{ listStyle: "none", fontFamily: "var(--mono)", fontSize: "0.875rem" }}>
            {Object.entries(summary.attack_breakdown).map(([k, v]) => (
              <li key={k} style={{ padding: "0.35rem 0", borderBottom: "1px solid var(--border)" }}>
                {k}: <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel">
        <h2>Attack flows</h2>
        <TrafficTable flows={attacks} emptyMessage="No attack flows in period" />
      </div>
    </div>
  );
}
