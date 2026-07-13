import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { hasPermission as checkPermission } from "../utils/permissions";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const navigate = useNavigate();

  const login = useCallback(async (email, password, remember) => {
    const next = await authService.login(email, password, remember);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const expired = () => logout();
    const forbidden = () => navigate("/unauthorized");
    window.addEventListener("netshield:auth:expired", expired);
    window.addEventListener("netshield:auth:forbidden", forbidden);
    return () => {
      window.removeEventListener("netshield:auth:expired", expired);
      window.removeEventListener("netshield:auth:forbidden", forbidden);
    };
  }, [logout, navigate]);

  const value = useMemo(() => ({
    user: session?.user || null,
    role: session?.user?.role || null,
    accessToken: session?.access_token || null,
    sessionStartedAt: session?.created_at || null,
    isAuthenticated: Boolean(session?.access_token),
    login,
    logout,
    hasRole: (...roles) => roles.includes(session?.user?.role),
    hasPermission: (permission) => checkPermission(session?.user?.role, permission),
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
