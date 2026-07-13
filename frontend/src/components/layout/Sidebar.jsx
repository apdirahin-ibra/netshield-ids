import { ChevronLeft, ChevronRight, LogOut, Shield, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { APP_NAME, APP_SUBTITLE, ROLE_LABELS } from "../../app/constants";
import { navigationGroups } from "../../data/projectData";
import useAuth from "../../hooks/useAuth";
import StatusBadge from "../common/StatusBadge";

export default function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }) {
  const { user, hasPermission, logout } = useAuth();
  return <>
    <button className={`mobile-overlay ${mobileOpen ? "visible" : ""}`} aria-label="Close navigation" onClick={onMobileClose} />
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><Shield size={22} /></div>
        {!collapsed && <div><strong>{APP_NAME}</strong><span>{APP_SUBTITLE}</span></div>}
        <button className="sidebar-mobile-close icon-button" onClick={onMobileClose} aria-label="Close menu"><X size={19} /></button>
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigationGroups.map((group) => {
          const visible = group.items.filter((item) => hasPermission(item.permission));
          if (!visible.length) return null;
          return <div className="nav-group" key={group.label}>
            {!collapsed && <span className="nav-group-label">{group.label}</span>}
            {visible.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} title={collapsed ? label : undefined} onClick={onMobileClose} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>)}
          </div>;
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <span className="avatar">{user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          {!collapsed && <div><strong>{user?.name}</strong><StatusBadge tone={user?.role === "ADMIN" ? "primary" : "info"}>{ROLE_LABELS[user?.role]}</StatusBadge></div>}
        </div>
        <button className="nav-link logout-link" onClick={logout} title={collapsed ? "Sign out" : undefined}><LogOut size={19} /><span>Sign out</span></button>
        <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse sidebar</span></>}</button>
      </div>
    </aside>
  </>;
}
