import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const STORAGE_KEY = "netshield.auth";
const SESSION_KEY = "netshield.auth.session";
const authApi = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function getStoredSessionEntry() {
  const persistent = localStorage.getItem(STORAGE_KEY);
  if (persistent) return { value: persistent, persistent: true };
  const temporary = sessionStorage.getItem(SESSION_KEY);
  return temporary ? { value: temporary, persistent: false } : null;
}

function storeSession(session, persistent) {
  clearStoredSession();
  (persistent ? localStorage : sessionStorage).setItem(
    persistent ? STORAGE_KEY : SESSION_KEY,
    JSON.stringify(session),
  );
}

function errorMessage(error, fallback) {
  return error.response?.data?.detail || fallback;
}

export const authService = {
  async login(email, password, remember = false) {
    try {
      const { data } = await authApi.post("/api/auth/login", {
        email: email.trim(),
        password,
        remember,
      });
      storeSession(data, remember);
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Unable to sign in. Confirm the backend is online."));
    }
  },
  async logout() {
    const session = this.getSession();
    try {
      if (session?.access_token) {
        await authApi.post(
          "/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
      }
    } finally {
      clearStoredSession();
    }
  },
  getSession() {
    const entry = getStoredSessionEntry();
    if (!entry) return null;
    try {
      return JSON.parse(entry.value);
    } catch {
      clearStoredSession();
      return null;
    }
  },
  async validateSession() {
    const entry = getStoredSessionEntry();
    if (!entry) return null;
    try {
      const session = JSON.parse(entry.value);
      const { data } = await authApi.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const refreshed = { ...session, user: data.user };
      storeSession(refreshed, entry.persistent);
      return refreshed;
    } catch {
      clearStoredSession();
      return null;
    }
  },
};
