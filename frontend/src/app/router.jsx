import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";
import RoleRoute from "../components/auth/RoleRoute";
import AppLayout from "../components/layout/AppLayout";
import LoadingState from "../components/common/LoadingState";

const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const LoginPage = lazy(() => import("../pages/public/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/public/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../pages/public/UnauthorizedPage"));
const AlertsLogsPage = lazy(() => import("../pages/shared/AlertsLogsPage"));
const DashboardPage = lazy(() => import("../pages/shared/DashboardPage"));
const DatasetOverviewPage = lazy(() => import("../pages/shared/DatasetOverviewPage"));
const LiveCapturePage = lazy(() => import("../pages/shared/LiveCapturePage"));
const ManualPredictionPage = lazy(() => import("../pages/shared/ManualPredictionPage"));
const ModelsPage = lazy(() => import("../pages/shared/ModelsPage"));
const ProfilePage = lazy(() => import("../pages/shared/ProfilePage"));

export default function AppRouter() {
  return <Suspense fallback={<LoadingState label="Preparing secure workspace" />}><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route element={<PublicRoute />}><Route path="/login" element={<LoginPage />} /></Route>
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/not-found" element={<NotFoundPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/live-capture" element={<LiveCapturePage />} />
      <Route path="/manual-prediction" element={<ManualPredictionPage />} />
      <Route path="/models" element={<ModelsPage />} />
      <Route path="/dataset-overview" element={<DatasetOverviewPage />} />
      <Route path="/alerts-logs" element={<AlertsLogsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route element={<RoleRoute roles={["ADMIN"]} />}>
        <Route path="/admin/users" element={<UserManagementPage />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/not-found" replace />} />
  </Routes></Suspense>;
}
