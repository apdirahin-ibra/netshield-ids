import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#00d4aa", "#ff4757", "#ffa502", "#3498db", "#9b59b6"];

export default function ChartsPanel({ attackBreakdown = [], benignRatio = 1 }) {
  const pieData = [
    { name: "Benign", value: Math.round(benignRatio * 100) },
    { name: "Attack", value: Math.round((1 - benignRatio) * 100) },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
      }}
    >
      <div className="panel" style={{ marginBottom: 0 }}>
        <h2>Traffic mix</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <h2>Attack types</h2>
        {attackBreakdown.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attackBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3544" />
              <XAxis dataKey="type" tick={{ fill: "#8b9cb3", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8b9cb3", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#121820",
                  border: "1px solid #2a3544",
                }}
              />
              <Bar dataKey="count" fill="#00d4aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty">No attack data yet</div>
        )}
      </div>
    </div>
  );
}
