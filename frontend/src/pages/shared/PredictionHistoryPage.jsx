import { Eye, FileClock, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import ErrorBanner from "../../components/common/ErrorBanner";
import LoadingState from "../../components/common/LoadingState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { FEATURE_NAMES } from "../../app/constants";
import { getManualPredictionHistory } from "../../services/api";
import { formatConfidence, formatDateTime, formatNumber } from "../../utils/formatters";

const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function flowSummary(features) {
  const forward = formatNumber(features?.["Total Fwd Packets"]);
  const backward = formatNumber(features?.["Total Backward Packets"]);
  const bytes = formatNumber(
    Number(features?.["Total Length of Fwd Packets"] || 0)
      + Number(features?.["Total Length of Bwd Packets"] || 0),
  );
  return `${forward} forward / ${backward} backward packets · ${bytes} bytes`;
}

export default function PredictionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [prediction, setPrediction] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getManualPredictionHistory();
      setHistory(response.data || []);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load manual prediction history."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return history
      .filter((item) => prediction === "ALL" || item.prediction === prediction)
      .filter((item) => !normalizedQuery
        || `${item.user_name} ${item.user_email} ${item.reason} ${item.prediction}`
          .toLowerCase()
          .includes(normalizedQuery));
  }, [history, prediction, query]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Explainable inference"
        title="Manual prediction history"
        description="Review every manually submitted flow, its classification, confidence, and feature values."
      />
      {error && <ErrorBanner message={error} onRetry={loadHistory} />}
      <section className="data-panel">
        <div className="panel-heading">
          <div>
            <h2>Saved predictions</h2>
            <p>{history.length} manual prediction{history.length === 1 ? "" : "s"} stored</p>
          </div>
          <div className="table-tools">
            <label className="search-field">
              <Search size={16} />
              <input
                aria-label="Search prediction history"
                placeholder="Search history"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              aria-label="Filter by prediction"
              value={prediction}
              onChange={(event) => setPrediction(event.target.value)}
            >
              <option value="ALL">All traffic</option>
              <option value="BENIGN">BENIGN</option>
              <option value="DDoS">DDoS</option>
            </select>
          </div>
        </div>
        {loading ? (
          <LoadingState label="Loading prediction history" />
        ) : filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date & time</th>
                  <th>Result</th>
                  <th>Confidence</th>
                  <th>Flow summary</th>
                  <th>Submitted by</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.created_at)}</td>
                    <td>
                      <StatusBadge tone={item.prediction === "DDoS" ? "danger" : "success"} dot>
                        {item.prediction}
                      </StatusBadge>
                    </td>
                    <td>{formatConfidence(item.confidence)}</td>
                    <td>{flowSummary(item.features_used)}</td>
                    <td>
                      <div className="history-user">
                        <strong>{item.user_name}</strong>
                        <small>{item.user_email}</small>
                      </div>
                    </td>
                    <td>
                      <button
                        className="button button-ghost button-compact"
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={15} />View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={history.length ? "No matching predictions" : "No manual predictions yet"}
            message={history.length
              ? "Try changing the search or traffic filter."
              : "Run a manual flow prediction and it will be saved here automatically."}
          />
        )}
      </section>

      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <aside
            className="drawer prediction-history-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close icon-button"
              onClick={() => setSelected(null)}
              aria-label="Close prediction details"
            >
              <X size={18} />
            </button>
            <span className="history-detail-icon"><FileClock size={21} /></span>
            <span className="eyebrow">Prediction #{selected.id}</span>
            <h2 id="history-detail-title">Manual flow details</h2>
            <div className="history-detail-summary">
              <div>
                <span>Classification</span>
                <StatusBadge tone={selected.prediction === "DDoS" ? "danger" : "success"} dot>
                  {selected.prediction}
                </StatusBadge>
              </div>
              <div><span>Confidence</span><strong>{formatConfidence(selected.confidence)}</strong></div>
              <div><span>Submitted</span><strong>{formatDateTime(selected.created_at)}</strong></div>
              <div><span>Submitted by</span><strong>{selected.user_name}</strong></div>
            </div>
            <section className="history-reason">
              <h3>Human-readable reason</h3>
              <p>{selected.reason}</p>
            </section>
            <section className="history-features">
              <h3>Feature values</h3>
              {FEATURE_NAMES.map((name) => (
                <div key={name}>
                  <span>{name}</span>
                  <strong>{formatNumber(selected.features_used?.[name], 3)}</strong>
                </div>
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
