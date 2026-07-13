export default function StatusBadge({ children, tone = "neutral", dot = false }) {
  return <span className={`status-badge badge-${tone}`}>{dot && <span className="badge-dot" />}{children}</span>;
}
