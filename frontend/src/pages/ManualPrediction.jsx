import { useState } from "react";
import { predictManualFlow, getRandomDatasetSample } from "../services/api";

const featureNames = [
  "Flow Duration",
  "Total Fwd Packets",
  "Total Backward Packets",
  "Total Length of Fwd Packets",
  "Total Length of Bwd Packets",
  "Flow Bytes/s",
  "Flow Packets/s",
  "Packet Length Mean",
  "SYN Flag Count",
  "ACK Flag Count",
  "PSH Flag Count",
  "Average Packet Size",
];

const defaultValues = {
  "Flow Duration": "",
  "Total Fwd Packets": "",
  "Total Backward Packets": "",
  "Total Length of Fwd Packets": "",
  "Total Length of Bwd Packets": "",
  "Flow Bytes/s": "",
  "Flow Packets/s": "",
  "Packet Length Mean": "",
  "SYN Flag Count": "",
  "ACK Flag Count": "",
  "PSH Flag Count": "",
  "Average Packet Size": "",
};

function ManualPrediction() {
  const [features, setFeatures] = useState(defaultValues);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (name, value) => {
    setFeatures({
      ...features,
      [name]: value,
    });
  };

  const handlePredict = async () => {
    try {
      setMessage("");
      setResult(null);

      const preparedFeatures = {};

      featureNames.forEach((name) => {
        preparedFeatures[name] = Number(features[name] || 0);
      });

      const response = await predictManualFlow(preparedFeatures);
      setResult(response);
    } catch (error) {
      console.error(error);
      setMessage("Prediction failed. Make sure FastAPI backend is running.");
    }
  };

  const handleClear = () => {
    setFeatures(defaultValues);
    setResult(null);
    setMessage("");
  };

  const handleRandomFill = async () => {
    try {
      setMessage("");
      setResult(null);

      const response = await getRandomDatasetSample("MIXED");

      const newFeatures = {};

      featureNames.forEach((name) => {
        newFeatures[name] = response.features[name] ?? 0;
      });

      setFeatures(newFeatures);

      setMessage(
        `Random ${response.sample_label} dataset sample loaded. Model predicts: ${response.model_prediction}`
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to load random dataset sample.");
    }
  };

  return (
    <div className="manual-page">
      <div className="manual-header">
        <div>
          <h2>Manual Flow Prediction</h2>
          <p>
            Enter the 12 selected network traffic features used by the machine
            learning model.
          </p>
        </div>

        <div className="manual-actions">
          <button className="random-fill-btn" onClick={handleRandomFill}>
            Random Dataset Fill
          </button>

          <button className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="manual-grid">
        {featureNames.map((name) => (
          <div className="input-group" key={name}>
            <label>{name}</label>
            <input
              type="number"
              value={features[name]}
              onChange={(event) => handleChange(name, event.target.value)}
              placeholder={`Enter ${name}`}
            />
          </div>
        ))}
      </div>

      <button className="predict-btn" onClick={handlePredict}>
        Predict Traffic
      </button>

      {result && (
        <div
          className={
            result.prediction === "DDoS"
              ? "result-card danger-result"
              : "result-card benign-result"
          }
        >
          <h3>Prediction Result</h3>

          <h1>{result.prediction}</h1>

          <p>
            <strong>Confidence:</strong> {result.confidence}
          </p>

          <p>
            <strong>Status:</strong> {result.status}
          </p>

          <p className="result-reason">
            <strong>Reason:</strong> {result.reason}
          </p>
        </div>
      )}
    </div>
  );
}

export default ManualPrediction;
