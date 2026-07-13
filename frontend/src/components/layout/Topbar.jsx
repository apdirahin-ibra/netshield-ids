import { Bell, ChevronDown, Menu, Radio, Server, User, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../app/constants";
import { pageMeta } from "../../data/projectData";
import { getAlerts, getBackendHealth, getCaptureStatus } from "../../services/api";
import useAuth from "../../hooks/useAuth";
import StatusBadge from "../common/StatusBadge";

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [backend, setBackend] = useState("checking");
  const [capture, setCapture] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [title, description] = pageMeta[location.pathname] || ["NetShield IDS", "Threat Detection Platform"];

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const results = await Promise.allSettled([getBackendHealth(), getCaptureStatus(), getAlerts(100)]);
      if (!alive) return;
      setBackend(results[0].status === "fulfilled" ? "online" : "offline");
      if (results[1].status === "fulfilled") setCapture(Boolean(results[1].value?.data?.is_running));
      if (results[2].status === "fulfilled") setAlertCount(results[2].value?.data?.length || 0);
    };
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  return <header className="app-topbar">
    <div className="topbar-title"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div><h2>{title}</h2><p>{description}</p></div></div>
    <div className="topbar-actions">
      <StatusBadge tone={backend === "online" ? "success" : backend === "offline" ? "danger" : "warning"} dot><Server size={13} />Backend {backend}</StatusBadge>
      <StatusBadge tone={capture ? "success" : "neutral"} dot><Radio size={13} />Capture {capture ? "live" : "idle"}</StatusBadge>
      <button className="notification-button" onClick={() => navigate("/alerts-logs")} aria-label={`${alertCount} security alerts`}><Bell size={19} />{alertCount > 0 && <span>{alertCount > 99 ? "99+" : alertCount}</span>}</button>
      <div className="profile-menu" ref={menuRef}>
        <button className="profile-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
          <span className="avatar">{user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span className="profile-trigger-copy"><strong>{user?.name}</strong><small>{ROLE_LABELS[user?.role]}</small></span><ChevronDown size={15} />
        </button>
        {menuOpen && <div className="profile-dropdown"><button onClick={() => { navigate("/profile"); setMenuOpen(false); }}><User size={16} />View profile</button><button onClick={logout}><LogOut size={16} />Sign out</button></div>}
      </div>
    </div>
  </header>;
}
