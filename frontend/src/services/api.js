import axios from "axios";
import { authService } from "./authService";
import { API_BASE_URL } from "./apiConfig";

export { API_BASE_URL };

const api = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = authService.getSession()?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) window.dispatchEvent(new Event("netshield:auth:expired"));
    if (error.response?.status === 403) window.dispatchEvent(new Event("netshield:auth:forbidden"));
    return Promise.reject(error);
  },
);

export const getBackendHealth = async () => (await api.get("/")).data;
export const getLivePredictions = async (limit = 50) => (await api.get(`/api/monitor/live?limit=${limit}`)).data;
export const getStats = async () => (await api.get("/api/monitor/stats")).data;
export const getAlerts = async (limit = 50) => (await api.get(`/api/alerts/?limit=${limit}`)).data;
export const getModelInfo = async () => (await api.get("/api/model-info/")).data;
export const startCapture = async (networkInterface = "") => (await api.post(`/api/capture/start${networkInterface ? `?interface=${encodeURIComponent(networkInterface)}` : ""}`)).data;
export const stopCapture = async () => (await api.post("/api/capture/stop")).data;
export const getCaptureStatus = async () => (await api.get("/api/capture/status")).data;
export const clearDashboardData = async () => (await api.delete("/api/monitor/clear")).data;
export const replayBenign = async (count = 10) => (await api.post(`/api/replay/benign?count=${count}`)).data;
export const replayDdos = async (count = 10) => (await api.post(`/api/replay/ddos?count=${count}`)).data;
export const replayMixed = async (benignCount = 10, ddosCount = 10) => (await api.post(`/api/replay/mixed?benign_count=${benignCount}&ddos_count=${ddosCount}`)).data;
export const predictManualFlow = async (features) => (await api.post("/api/predict/flow", features)).data;
export const getManualPredictionHistory = async (limit = 200) => (await api.get(`/api/predict/history?limit=${limit}`)).data;
export const getRandomDatasetSample = async (trafficType = "MIXED") => (await api.get(`/api/replay/random-sample?traffic_type=${trafficType}`)).data;
export const getReportSummary = async () => (await api.get("/api/reports/summary")).data;
export const getUsers = async () => (await api.get("/api/users")).data;
export const createUser = async (payload) => (await api.post("/api/users", payload)).data;
export const updateUser = async (userId, payload) => (await api.put(`/api/users/${userId}`, payload)).data;
export const deleteUser = async (userId) => (await api.delete(`/api/users/${userId}`)).data;
export const changePassword = async (payload) => (await api.post("/api/auth/password", payload)).data;

export default api;
