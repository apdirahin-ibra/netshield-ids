export default function Navbar({ monitorStatus }) {
  const running = monitorStatus?.running;

  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), #0066ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.75rem",
            color: "var(--bg)",
          }}
        >
          NS
        </span>
        <span style={{ fontWeight: 600 }}>NetShield IDS</span>
      </div>
      <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        {running ? (
          <>
            <span className="status-dot live" />
            Monitoring ({monitorStatus?.mode})
          </>
        ) : (
          "Monitor idle"
        )}
      </div>
    </header>
  );
}
