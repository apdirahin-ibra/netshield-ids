import {
  Clock3,
  KeyRound,
  LogOut,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import MetricCard from "../../components/common/MetricCard";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { ROLE_LABELS } from "../../app/constants";
import { useToast } from "../../contexts/ToastContext";
import useAuth from "../../hooks/useAuth";
import { changePassword } from "../../services/api";

const apiError = (error, fallback) => error.response?.data?.detail || fallback;

export default function ProfilePage() {
  const { user, sessionStartedAt, logout } = useAuth();
  const { push } = useToast();
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const setPassword = (name, value) => {
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (!passwords.current || passwords.next.length < 8 || passwords.next !== passwords.confirm) {
      push("Check the current password and ensure the new passwords match.", "error");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        current_password: passwords.current,
        new_password: passwords.next,
        confirm_password: passwords.confirm,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      push("Password updated. Other sessions were signed out.");
    } catch (requestError) {
      push(apiError(requestError, "Unable to update the password."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Account security"
        title="Profile & session"
        description="Review your identity, access role, and current authentication session."
      />
      <section className="profile-hero">
        <span className="profile-avatar-large">
          {user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}
        </span>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div>
            <StatusBadge tone={user?.role === "ADMIN" ? "primary" : "info"}>
              {ROLE_LABELS[user?.role]}
            </StatusBadge>
            <StatusBadge tone="success" dot>{user?.status || "Active"}</StatusBadge>
          </div>
        </div>
        <button className="button button-ghost" onClick={logout}>
          <LogOut size={16} />Sign out
        </button>
      </section>
      <section className="metrics-grid">
        <MetricCard
          icon={UserRound}
          label="Account status"
          value={user?.status || "Active"}
          detail="Backend user directory"
          tone="success"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Access role"
          value={ROLE_LABELS[user?.role]}
          detail="Enforced by routes and API"
          tone="primary"
        />
        <MetricCard
          icon={Clock3}
          label="Session started"
          value={sessionStartedAt ? new Date(sessionStartedAt).toLocaleTimeString() : "—"}
          detail={sessionStartedAt ? new Date(sessionStartedAt).toLocaleDateString() : "Current session"}
          tone="info"
        />
        <MetricCard
          icon={MonitorSmartphone}
          label="Session device"
          value="This browser"
          detail="Revocable server session"
          tone="neutral"
        />
      </section>
      <div className="profile-grid">
        <section className="data-panel">
          <div className="panel-heading">
            <div>
              <h2>Account information</h2>
              <p>Identity supplied by the active authentication service</p>
            </div>
          </div>
          <div className="profile-details">
            <div><UserRound size={17} /><span>Name</span><strong>{user?.name}</strong></div>
            <div><Mail size={17} /><span>Email</span><strong>{user?.email}</strong></div>
            <div><ShieldCheck size={17} /><span>Role</span><strong>{ROLE_LABELS[user?.role]}</strong></div>
            <div>
              <Clock3 size={17} />
              <span>Last login</span>
              <strong>{user?.last_login ? new Date(user.last_login).toLocaleString() : "Current session"}</strong>
            </div>
          </div>
        </section>
        <section className="data-panel">
          <div className="panel-heading">
            <div>
              <h2>Change password</h2>
              <p>Update this account and revoke its other active sessions</p>
            </div>
            <StatusBadge tone="success">Protected</StatusBadge>
          </div>
          <form className="password-form" onSubmit={updatePassword}>
            <label>
              Current password
              <input
                type="password"
                value={passwords.current}
                onChange={(event) => setPassword("current", event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                minLength="8"
                value={passwords.next}
                onChange={(event) => setPassword("next", event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                minLength="8"
                value={passwords.confirm}
                onChange={(event) => setPassword("confirm", event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <button className="button button-primary" disabled={saving}>
              <KeyRound size={16} />{saving ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
