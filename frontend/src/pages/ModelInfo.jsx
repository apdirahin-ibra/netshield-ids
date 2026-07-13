import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ModelInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.getModelInfo().then(setInfo).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>Model Info</h1>
      <p className="subtitle">ML classifier used for flow prediction</p>

      {info ? (
        <>
          <div className="stats-grid">
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                MODEL TYPE
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {info.model_type}
              </div>
            </div>
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                FEATURES
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {info.feature_count}
              </div>
            </div>
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                MODEL LOADED
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {info.model_loaded ? "Yes" : "No (heuristic)"}
              </div>
            </div>
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                SCALER
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {info.scaler_loaded ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {info.last_trained && (
            <div className="panel">
              <h2>Training metadata</h2>
              <p className="mono" style={{ fontSize: "0.875rem" }}>
                {info.last_trained}
              </p>
            </div>
          )}

          <div className="panel">
            <h2>Selected features</h2>
            <ul
              style={{
                columns: 2,
                fontFamily: "var(--mono)",
                fontSize: "0.8rem",
                color: "var(--muted)",
                paddingLeft: "1.25rem",
              }}
            >
              {info.features.map((f) => (
                <li key={f} style={{ marginBottom: 4 }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="empty">Loading model info…</div>
      )}
    </div>
  );
}
