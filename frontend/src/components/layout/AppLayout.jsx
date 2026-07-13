import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("netshield.sidebar.collapsed") === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => localStorage.setItem("netshield.sidebar.collapsed", String(collapsed)), [collapsed]);
  return <div className="app-shell">
    <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggle={() => setCollapsed((value) => !value)} onMobileClose={() => setMobileOpen(false)} />
    <div className="app-workspace"><Topbar onMenu={() => setMobileOpen(true)} /><main className="app-content"><Outlet /></main></div>
  </div>;
}
