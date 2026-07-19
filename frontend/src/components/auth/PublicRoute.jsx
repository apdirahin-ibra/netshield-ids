import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../common/LoadingState";
import useAuth from "../../hooks/useAuth";

export default function PublicRoute() {
  const { authReady, isAuthenticated } = useAuth();
  if (!authReady) return <LoadingState label="Checking secure session" />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
