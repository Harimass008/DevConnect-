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
import { useState } from "react";

export default function SettingsPage(props) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordBusy, setPasswordBusy] = useState(false);
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
    changePassword,
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
  async function submitPasswordChange(e) {
    e.preventDefault();
    setPasswordBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await changePassword(passwordForm);
      setSuccess(result?.message || "Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err?.message || "Could not update password.");
    } finally {
      setPasswordBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR ACCOUNT</div>
          <h1>My Profile</h1>
          <p>
            Update your profile details and manage your password in one place.
          </p>
        </div>
      </div>
      <form className="panel settings-panel" onSubmit={saveProfile}>
        <h2>Profile details</h2>
        <label className="form-label">
          Name
          <input
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </label>
        <label className="form-label">
          Email
          <input
            required
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </label>
        <label className="form-label">
          Assigned role
          <input readOnly value={ROLE_LABELS[role] || role} />
        </label>
        <div className="form-actions">
          <Button disabled={busy}>Save profile</Button>
        </div>
        <p className="muted">
          Role changes are managed through the admin endpoint and must be
          verified by the backend.
        </p>
      </form>
      <form
        className="panel settings-panel"
        onSubmit={submitPasswordChange}
        style={{ marginTop: 20 }}
      >
        <h2>Change password</h2>
        <p className="muted">
          Enter your current password, then enter and confirm the new password.
        </p>
        <label className="form-label">
          Current password
          <input
            required
            autoComplete="current-password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
          />
        </label>
        <label className="form-label">
          New password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
          />
        </label>
        <label className="form-label">
          Confirm new password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
          />
        </label>
        <div className="form-actions">
          <Button disabled={passwordBusy}>
            {passwordBusy ? "Updating…" : "Update password"}
          </Button>
        </div>
        <p className="muted">
          If email is configured, a security notification is sent after a
          successful password change.
        </p>
      </form>
    </>
  );
}
