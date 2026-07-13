function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export default StatCard;