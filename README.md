# NetShield IDS

Network Intrusion Detection System with ML-based flow classification, real-time monitoring, alerts, and a React dashboard.

## Project structure

```
netshield-ids/
├── backend/          # FastAPI API, capture, prediction, SQLite
├── frontend/         # React + Vite dashboard
├── ml/               # Train / evaluate / test scripts
├── dataset/          # CIC-IDS2017 CSV exports (not included)
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) [Npcap](https://nmap.org/npcap/) on Windows for live packet capture with Scapy

## Quick start

### 1. Dataset (for training)

Download CIC-IDS2017 CSV files and place them in `dataset/`:

- `Monday-WorkingHours.pcap_ISCX.csv`
- `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv`

### 2. Train the model

```bash
cd ml
pip install pandas scikit-learn joblib numpy
python train_model.py
```

Artifacts are saved to `backend/model/`:

- `best_model.pkl` (deployment classifier)
- `random_forest.pkl` (training copy)
- `scaler.pkl`
- `selected_features.pkl`

SQLite database `backend/data/netshield.db` is created automatically on first API start.

Without training, the API uses heuristic fallback predictions.

### 3. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run from the `backend` directory so `app` imports resolve.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Demo monitoring

1. Open **Live Monitor**
2. Click **Start (simulate)** — generates synthetic benign and attack flows
3. View alerts on **Alerts** and stats on **Dashboard**

For live capture (requires admin + Npcap on Windows), use **Start (live / scapy)**.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/monitor/status` | Capture service status |
| POST | `/api/monitor/start?simulate=true` | Start monitoring |
| POST | `/api/monitor/stop` | Stop monitoring |
| GET | `/api/monitor/live` | Recent classified flows |
| GET | `/api/alerts` | List alerts |
| GET | `/api/reports/dashboard` | Dashboard statistics |
| GET | `/api/reports/flows` | Stored flow records |
| GET | `/api/model/info` | ML model metadata |

## ML scripts

```bash
python ml/train_model.py      # Train on dataset CSVs
python ml/evaluate_model.py   # Metrics on hold-out sample
python ml/test_saved_model.py # Smoke test artifacts
```

## Demo deployment

The repository includes Vercel and Render configuration for a safe replay-only cloud demo. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the exact deployment sequence and limitations.

## License

Educational / demonstration use. Ensure you have permission before capturing network traffic on any network.
