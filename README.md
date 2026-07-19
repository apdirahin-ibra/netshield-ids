<div align="center">

# NetShield IDS

**Machine-learning network intrusion detection with live monitoring, explainable predictions, alerts, and protected administration.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.125-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=0B1220)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

<img src="docs/images/netshield-cybersecurity.jpg" alt="Cybersecurity system visualization" width="100%" />

</div>

NetShield IDS classifies network-flow activity as **BENIGN** or **DDoS** using a deployed Random Forest model trained around CIC-IDS2017 features. It combines a FastAPI and SQLite backend with a responsive React operations dashboard.

## Highlights

- Live packet capture for supported local environments
- Safe BENIGN and DDoS traffic replay for cloud demonstrations
- Random Forest inference using 12 selected network-flow features
- Explainable manual predictions with persistent history
- Security alerts, traffic logs, metrics, and CSV export
- Backend-enforced roles, hashed passwords, and revocable sessions
- Persistent administrator user management
- Vercel frontend and Render backend deployment configuration

## Architecture

```text
netshield-ids/
├── backend/          FastAPI API, authentication, capture, prediction, SQLite
├── frontend/         React and Vite security operations dashboard
├── ml/               Training, evaluation, and saved-model utilities
├── dataset/          CIC-IDS2017 sources and the small demo replay sample
├── docs/images/      README artwork
├── DEPLOYMENT.md     Vercel and Render deployment guide
└── render.yaml       Render Blueprint configuration
```

## Prerequisites

- Python 3.12
- Node.js 18 or newer
- Optional: [Npcap](https://nmap.org/npcap/) on Windows for live packet capture with Scapy

## Quick start

### 1. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API and interactive documentation are available at:

- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

### 2. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 3. Sign in locally

The initial accounts are created when the SQLite user table is empty:

| Role | Email | Local default password |
|---|---|---|
| Administrator | `admin@netshield.local` | `Admin123!` |
| Security Analyst | `analyst@netshield.local` | `Analyst123!` |

Set `NETSHIELD_ADMIN_PASSWORD` and `NETSHIELD_ANALYST_PASSWORD` before the first backend start to replace these local defaults. Deployment passwords must be configured as private Render environment variables.

## Detection workflow

1. Capture or replay network traffic.
2. Build bidirectional network-flow snapshots.
3. Extract the 12 model features.
4. Classify the flow as BENIGN or DDoS.
5. Save predictions and generate security alerts.
6. Review activity from the dashboard, logs, or manual prediction history.

## Core API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and create a server session |
| `GET` | `/api/auth/me` | Validate the current session |
| `POST` | `/api/auth/password` | Change the current account password |
| `GET/POST` | `/api/users` | List or create platform users |
| `PUT/DELETE` | `/api/users/{user_id}` | Update or remove a platform user |
| `GET` | `/api/monitor/stats` | Dashboard detection statistics |
| `GET` | `/api/monitor/live` | Recent classified network flows |
| `GET` | `/api/alerts/` | Stored security alerts |
| `POST` | `/api/predict/flow` | Run and save a manual flow prediction |
| `GET` | `/api/predict/history` | Manual prediction history |
| `POST` | `/api/replay/benign` | Replay BENIGN demo traffic |
| `POST` | `/api/replay/ddos` | Replay DDoS demo traffic |

## Model development

Place the required CIC-IDS2017 CSV exports in `dataset/`, then run:

```powershell
python ml\train_model.py
python ml\evaluate_model.py
python ml\test_saved_model.py
```

Deployment artifacts are stored in `backend/model/`. The repository also includes a small `dataset/sample.csv` fixture for replay-only demonstrations.

## Demo deployment

The repository is prepared for:

- React/Vite on Vercel
- FastAPI on Render
- Replay-only demo traffic in cloud environments

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the environment variables, deployment sequence, verification steps, and persistence limitations.

## Responsible use

NetShield IDS is an educational and demonstration project. Capture traffic only on networks where you have explicit permission. Do not upload private traffic, credentials, or sensitive datasets to a public demo.

<sub>Header photo by <a href="https://unsplash.com/@fantasyflip">Philipp Katzenberger</a> on <a href="https://unsplash.com/photos/turned-on-black-and-grey-laptop-computer-iIJrUoeRoCQ">Unsplash</a>.</sub>
