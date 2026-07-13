# NetShield IDS demo deployment

This setup deploys the React/Vite dashboard to Vercel and the FastAPI API to a free Render web service.

## Demo boundaries

- Authentication and roles are frontend demonstrations, not backend security controls.
- Live packet capture is disabled on Render. Use the BENIGN and DDoS replay controls.
- The API is public. Do not use real traffic, credentials, private datasets, or sensitive network information.
- Render's free filesystem is ephemeral, so predictions and alerts reset after restarts or redeployments.
- The API runs as a single process because its demo state and SQLite database are local to the instance.

## Files already prepared

- `frontend/vercel.json` enables direct visits and refreshes on React Router pages.
- `render.yaml` defines the free FastAPI service and turns on safe demo mode.
- `frontend/.env.example` documents the public frontend API setting.
- `backend/.env.example` documents local backend configuration.
- `dataset/sample.csv` is the small replay fixture used in deployment.
- `.gitignore` excludes full training datasets, generated data, logs, and unused model artifacts.

## 1. Push the prepared project to GitHub

Create an empty GitHub repository named `netshield-ids`, then run from the project root:

```powershell
git init
git add .
git commit -m "Prepare NetShield IDS demo deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/netshield-ids.git
git push -u origin main
```

Before pushing, verify that `git status` does not list the full CIC-IDS CSV files, `knn.pkl`, a database file, logs, or `.env` files.

## 2. Create the Vercel frontend first

Creating the frontend first reserves its final origin for Render's CORS setting.

1. In Vercel, select **Add New > Project** and import the GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Confirm **Framework Preset** is Vite.
4. Use build command `npm run build` and output directory `dist`.
5. Deploy once without `VITE_API_URL`. The interface will show the backend as offline for this first deployment.
6. Copy the production URL, for example `https://netshield-ids.vercel.app`.

## 3. Create the Render backend

1. In Render, select **New > Blueprint** and connect the same GitHub repository.
2. Render reads `render.yaml` and creates `netshield-ids-api`.
3. When prompted for `CORS_ORIGINS`, enter the exact Vercel production origin with no trailing slash.
4. Wait for the health check to pass.
5. Open `https://YOUR_RENDER_SERVICE.onrender.com/health` and confirm the response reports `status: online`, `mode: demo`, and `live_capture_enabled: false`.

The Blueprint deliberately installs `backend/requirements.txt`; do not replace it with the unrelated root requirements file.

## 4. Connect Vercel to Render

1. Open the Vercel project and go to **Settings > Environment Variables**.
2. Add `VITE_API_URL` for Production and Preview.
3. Set its value to the Render origin, for example `https://netshield-ids-api.onrender.com`, with no trailing slash.
4. Redeploy the latest Vercel deployment so Vite includes the new value in the browser bundle.

`VITE_*` values are public browser configuration. Never store a password, token, or secret in them.

## 5. Verify the demo

1. Open the Vercel production URL.
2. Sign in with `admin@netshield.local` and `Admin123!`.
3. Confirm the header shows **Backend online**.
4. Confirm **Start capture** is disabled and the page identifies itself as a replay demo.
5. Run **Replay BENIGN** and **Replay DDoS** and confirm the dashboard, predictions, and alerts update.
6. Refresh `/dashboard` directly to verify the Vercel SPA rewrite.

If the browser reports a CORS error, update `CORS_ORIGINS` in Render to the exact Vercel origin and redeploy the Render service.

## Optional persistence later

For a longer-lived demo, upgrade the Render service, attach a persistent disk, and set `NETSHIELD_DATA_DIR` to the disk mount path. A production IDS also needs real backend authentication and a separate sensor running inside the network being monitored.
