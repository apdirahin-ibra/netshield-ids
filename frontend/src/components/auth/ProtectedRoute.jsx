import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingState from "../common/LoadingState";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!authReady) return <LoadingState label="Checking secure session" />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
