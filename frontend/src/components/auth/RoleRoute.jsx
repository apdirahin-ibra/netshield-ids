import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function RoleRoute({ roles = [], permission }) {
  const { role, hasPermission } = useAuth();
  const allowed = roles.length ? roles.includes(role) : hasPermission(permission);
  return allowed ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
