import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import TrafficTable from "../components/TrafficTable";
import AlertsTable from "../components/AlertsTable";
import {
  getLivePredictions,
  getStats,
  getAlerts,
  getCaptureStatus,
  startCapture,
  stopCapture,
  replayDdos,
  clearDashboardData,
} from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [captureStatus, setCaptureStatus] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const statsResponse = await getStats();
      const liveResponse = await getLivePredictions();
      const alertsResponse = await getAlerts();
      const captureResponse = await getCaptureStatus();

      setStats(statsResponse.data);
      setPredictions(liveResponse.data);
      setAlerts(alertsResponse.data);
      setCaptureStatus(captureResponse.data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed. Make sure FastAPI is running.");
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStartCapture = async () => {
    try {
      const response = await startCapture();
      setMessage(response.message);
      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to start capture.");
    }
  };

  const handleStopCapture = async () => {
    try {
      const response = await stopCapture();
      setMessage(response.message);
      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to stop capture.");
    }
  };

  const handleReplayDdos = async () => {
    try {
      const response = await replayDdos(10);
      setMessage(`DDoS replay completed: ${response.saved_predictions} predictions and ${response.saved_alerts} alerts saved.`);
      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to replay DDoS traffic.");
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "Clear all live traffic predictions and security alerts from the database?"
    );

    if (!confirmed) return;

    try {
      const response = await clearDashboardData();
      setPredictions([]);
      setAlerts([]);
      setStats({
        total_predictions: 0,
        benign_count: 0,
        ddos_count: 0,
        alert_count: 0,
        average_confidence: 0,
      });
      await loadData();
      setMessage(response.message);
    } catch (error) {
      console.error(error);
      setMessage("Failed to clear dashboard data.");
    }
  };

  return (
    <div className="dashboard">
      <div className="topbar">
        <div>
          <h1>NetShield IDS Dashboard</h1>
          <p>Real-time network traffic anomaly detection system</p>
        </div>

        <div className="actions">
          <button className="start-btn" onClick={handleStartCapture}>
            Start Capture
          </button>

          <button className="stop-btn" onClick={handleStopCapture}>
            Stop Capture
          </button>

          <button className="demo-ddos-btn" onClick={handleReplayDdos}>
            Replay DDoS
          </button>

          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="status-box">
        <strong>Capture Status:</strong>{" "}
        {captureStatus?.is_running ? (
          <span className="running">Running</span>
        ) : (
          <span className="stopped">Stopped</span>
        )}

        <span> Packets: {captureStatus?.packet_count || 0}</span>
        <span> Predictions: {captureStatus?.prediction_count || 0}</span>
        <span> Alerts: {captureStatus?.alert_count || 0}</span>
        <span> Flows: {captureStatus?.total_flows || 0}</span>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Predictions"
          value={stats?.total_predictions || 0}
          subtitle="All analyzed flows"
        />

        <StatCard
          title="BENIGN Traffic"
          value={stats?.benign_count || 0}
          subtitle="Normal traffic"
        />

        <StatCard
          title="DDoS Traffic"
          value={stats?.ddos_count || 0}
          subtitle="Detected attacks"
        />

        <StatCard
          title="Alerts"
          value={stats?.alert_count || 0}
          subtitle="Security warnings"
        />

        <StatCard
          title="Average Confidence"
          value={stats?.average_confidence || 0}
          subtitle="Model confidence"
        />
      </div>

      <TrafficTable predictions={predictions} />

      <AlertsTable alerts={alerts} />
    </div>
  );
}

export default Dashboard;
