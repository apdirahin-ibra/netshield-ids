import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/monitor", label: "Live Monitor" },
  { to: "/alerts", label: "Alerts" },
  { to: "/reports", label: "Reports" },
  { to: "/model", label: "Model Info" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "1rem 0",
        flexShrink: 0,
      }}
    >
      <nav>
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "block",
              padding: "0.65rem 1.25rem",
              color: isActive ? "var(--accent)" : "var(--muted)",
              textDecoration: "none",
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive
                ? "3px solid var(--accent)"
                : "3px solid transparent",
              background: isActive ? "var(--surface-2)" : "transparent",
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
