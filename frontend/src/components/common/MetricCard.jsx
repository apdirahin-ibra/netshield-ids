import { ArrowUpRight } from "lucide-react";

export default function MetricCard({ icon: Icon, label, value, detail, tone = "primary", trend }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-top"><span className="metric-icon"><Icon size={19} /></span>{trend && <span className="metric-trend"><ArrowUpRight size={13} />{trend}</span>}</div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-label">{label}</span>
      <small>{detail}</small>
    </article>
  );
}
