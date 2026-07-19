import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ErrorBanner from "../../components/common/ErrorBanner";
import LoadingState from "../../components/common/LoadingState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { ROLE_LABELS } from "../../app/constants";
import { useToast } from "../../contexts/ToastContext";
import useAuth from "../../hooks/useAuth";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/api";
import { formatDateTime } from "../../utils/formatters";

const emptyUser = () => ({
  name: "",
  email: "",
  role: "SECURITY_ANALYST",
  status: "Active",
  password: "",
  confirm_password: "",
});

const apiError = (error, fallback) => error.response?.data?.detail || fallback;

export default function UserManagementPage() {
  const { push } = useToast();
  const { user: currentUser, refreshSession } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load the user directory."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(
    () => users
      .filter((user) => role === "ALL" || user.role === role)
      .filter((user) => status === "ALL" || user.status === status)
      .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())),
    [users, query, role, status],
  );

  const openForm = (user = null) => {
    setError("");
    setEditing(user || { id: null });
    setForm(user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          password: "",
          confirm_password: "",
        }
      : emptyUser());
  };

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Enter a valid name and email address.");
      return;
    }
    if ((!editing.id || form.password || form.confirm_password) && form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Password and confirmation do not match.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = editing.id
        ? await updateUser(editing.id, form)
        : await createUser(form);
      const saved = response.data;
      setUsers((items) => editing.id
        ? items.map((item) => (item.id === editing.id ? saved : item))
        : [...items, saved]);
      if (editing.id === currentUser?.id) await refreshSession();
      setEditing(null);
      push(`User ${editing.id ? "updated" : "created"} successfully.`);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to save this user."));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (user) => {
    setBusy(true);
    setError("");
    const nextStatus = user.status === "Active" ? "Disabled" : "Active";
    try {
      const response = await updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        status: nextStatus,
        password: null,
        confirm_password: null,
      });
      setUsers((items) => items.map((item) => (item.id === user.id ? response.data : item)));
      push(`${user.name} ${nextStatus === "Active" ? "enabled" : "disabled"}.`);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to update account status."));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await deleteUser(deleting.id);
      setUsers((items) => items.filter((item) => item.id !== deleting.id));
      push("User deleted successfully.");
      setDeleting(null);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to delete this user."));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const editingSelf = editing?.id === currentUser?.id;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administration"
        title="User management"
        description="Manage persistent accounts, access roles, passwords, and account status."
        actions={(
          <button className="button button-primary" onClick={() => openForm()} disabled={busy}>
            <Plus size={16} />Add user
          </button>
        )}
      />
      {error && <ErrorBanner message={error} />}
      <div className="source-note directory-banner">
        <ShieldCheck size={17} />
        <div>
          <strong>Protected user directory</strong>
          <p>Accounts are stored by the API with hashed passwords and revocable sessions.</p>
        </div>
        <StatusBadge tone="success">Persistent</StatusBadge>
      </div>
      <section className="data-panel">
        <div className="panel-heading">
          <div>
            <h2>Platform users</h2>
            <p>{users.filter((user) => user.status === "Active").length} active of {users.length} accounts</p>
          </div>
          <div className="table-tools">
            <label className="search-field">
              <Search size={16} />
              <input
                aria-label="Search users"
                placeholder="Search users"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select aria-label="Filter by role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="ALL">All roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="SECURITY_ANALYST">Security Analyst</option>
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">All statuses</option>
              <option>Active</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
        {loading ? (
          <LoadingState label="Loading user directory" />
        ) : filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Status</th><th>Last login</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <span className="avatar">
                            {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </span>
                          <div>
                            <strong>{user.name}{isCurrentUser ? " (You)" : ""}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge tone={user.role === "ADMIN" ? "primary" : "info"}>{ROLE_LABELS[user.role]}</StatusBadge></td>
                      <td><StatusBadge tone={user.status === "Active" ? "success" : "neutral"} dot>{user.status}</StatusBadge></td>
                      <td>{user.last_login ? formatDateTime(user.last_login) : "Never"}</td>
                      <td>{formatDateTime(user.created_at)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => openForm(user)} aria-label={`Edit ${user.name}`}>
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            disabled={busy || isCurrentUser}
                            onClick={() => toggle(user)}
                            aria-label={user.status === "Active" ? `Disable ${user.name}` : `Enable ${user.name}`}
                            title={isCurrentUser ? "You cannot disable your current account" : ""}
                          >
                            {user.status === "Active" ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            className="icon-button danger"
                            disabled={busy || isCurrentUser}
                            onClick={() => setDeleting(user)}
                            aria-label={`Delete ${user.name}`}
                            title={isCurrentUser ? "You cannot delete your current account" : ""}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No users found" message="Try changing the search or account filters." />
        )}
      </section>

      {editing && (
        <div className="modal-backdrop" onMouseDown={() => !busy && setEditing(null)}>
          <section
            className="dialog user-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close icon-button"
              onClick={() => setEditing(null)}
              disabled={busy}
              aria-label="Close user form"
            >
              <X size={18} />
            </button>
            <span className="eyebrow">{editing.id ? "Edit user" : "New user"}</span>
            <h2 id="user-dialog-title">{editing.id ? "Update user access" : "Add a user"}</h2>
            <form className="admin-form" onSubmit={save}>
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="User name"
                  required
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  placeholder="name@netshield.local"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(event) => setField("role", event.target.value)}
                  disabled={editingSelf}
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="SECURITY_ANALYST">Security Analyst</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => setField("status", event.target.value)}
                  disabled={editingSelf}
                >
                  <option>Active</option>
                  <option>Disabled</option>
                </select>
              </label>
              <label>
                {editing.id ? "New password (optional)" : "Password"}
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required={!editing.id}
                  placeholder={editing.id ? "Leave blank to keep current password" : "At least 8 characters"}
                />
              </label>
              <label>
                {editing.id ? "Confirm new password" : "Confirm password"}
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(event) => setField("confirm_password", event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required={!editing.id || Boolean(form.password)}
                  placeholder="Repeat the password"
                />
              </label>
              <div className="dialog-actions">
                <button type="button" className="button button-ghost" onClick={() => setEditing(null)} disabled={busy}>
                  Cancel
                </button>
                <button className="button button-primary" disabled={busy}>
                  {busy ? "Saving..." : editing.id ? "Save changes" : "Add user"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user?"
        message={`${deleting?.name || "This user"} will lose access and all active sessions will be removed.`}
        confirmLabel="Delete user"
        onCancel={() => !busy && setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
