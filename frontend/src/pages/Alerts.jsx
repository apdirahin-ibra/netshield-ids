import { useEffect, useState } from "react";
import AlertsTable from "../components/AlertsTable";
import { api } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const load = () => api.getAlerts(100).then(setAlerts).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const handleAck = async (id) => {
    await api.ackAlert(id);
    load();
  };

  const handleDelete = async (id) => {
    await api.deleteAlert(id);
    load();
  };

  return (
    <div className="page">
      <h1>Alerts</h1>
      <p className="subtitle">Detected intrusions and anomalies</p>

      <div className="panel">
        <AlertsTable
          alerts={alerts}
          onAck={handleAck}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
