import {
  Activity,
  ShieldCheck,
  Code2,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  RefreshCw,
  LockKeyhole,
  MessageSquare,
  ScanSearch,
  LayoutDashboard,
  ChevronRight,
  UserCog,
  CircleAlert,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { ROLE_LABELS } from "../config/roles.js";
import Button from "../components/Button.jsx";
import Stat from "../components/Stat.jsx";
import ProjectRows from "../components/ProjectRows.jsx";
import { initials, errText } from "../utils.js";

export default function UsersPage(props) {
  const {
    user,
    role,
    can,
    projects,
    users,
    search,
    setSearch,
    filteredProjects,
    showCreate,
    setShowCreate,
    projectForm,
    setProjectForm,
    busy,
    createProject,
    refreshData,
    goTo,
    setChatProjectId,
    chatProjectId,
    messages,
    messageText,
    setMessageText,
    sendMessage,
    loadMessages,
    code,
    setCode,
    language,
    setLanguage,
    runReview,
    reviewResult,
    loadUsers,
    changeRole,
    notificationPrefs,
    setNotificationPrefs,
    phoneOtp,
    setPhoneOtp,
    phoneOtpSent,
    phoneVerified,
    sendPhoneOtp,
    verifyPhoneOtp,
    saveNotificationPrefs,
    loadNotificationPrefs,
    profile,
    setProfile,
    saveProfile,
    error,
    success,
    setError,
    setSuccess,
    mobileOpen,
    setMobileOpen,
    logout,
    page,
    pageTitle,
    visibleNav,
    setPage,
    setBusy,
  } = props;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION</div>
          <h1>User & Role Management</h1>
          <p>
            Review registered accounts. Only administrators can change roles;
            the backend must validate every change.
          </p>
        </div>
        <div className="heading-action">
          <Button
            secondary
            onClick={() => loadUsers().catch((e) => setError(errText(e)))}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>
      <div className="panel projects-panel">
        <div className="section-title">
          <h2>Registered users</h2>
          <span className="badge neutral">{users.length} accounts</span>
        </div>
        <div className="user-table">
          {users.map((u, i) => (
            <div className="user-row" key={u.id || u._id || u.email || i}>
              <span className="avatar">{initials(u.name || u.email)}</span>
              <span className="user-details">
                <b>{u.name || "Unnamed user"}</b>
                <small>{u.email}</small>
              </span>
              {can("users.manage") ? (
                <select
                  aria-label={`Role for ${u.email}`}
                  disabled={
                    busy ||
                    String(u.id || u._id) === String(user.id || user._id)
                  }
                  value={String(u.role || "viewer")
                    .toLowerCase()
                    .replace(/[ -]/g, "_")}
                  onChange={(e) => changeRole(u.id || u._id, e.target.value)}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="badge info">
                  {ROLE_LABELS[u.role] || u.role || "Viewer"}
                </span>
              )}
            </div>
          ))}
          {!users.length && (
            <div className="empty-state">
              <Users size={25} />
              <h3>No users returned</h3>
              <p>Make sure GET /admin/users is implemented for your backend.</p>
            </div>
          )}
        </div>
      </div>
      <div className="panel projects-panel" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Available roles</h2>
          <UserCog size={17} />
        </div>
        <div className="role-grid">
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <div className="role-card" key={key}>
              <b>{label}</b>
              <span>
                {key === "admin"
                  ? "Manage users, roles, settings, projects and all workspace tools."
                  : key === "project_manager"
                    ? "View projects, create projects, read messages and view users."
                    : key === "developer"
                      ? "View/create projects, run code reviews and send chat messages."
                      : key === "security_analyst"
                        ? "View projects, run code reviews and collaborate in chat."
                        : "Read dashboard, projects and chat messages."}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
