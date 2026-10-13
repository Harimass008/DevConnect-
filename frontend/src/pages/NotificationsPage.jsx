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

export default function NotificationsPage(props) {
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
          <div className="eyebrow">PREFERENCES</div>
          <h1>Email & SMS notifications</h1>
          <p>Choose which messages the backend should send to your account.</p>
        </div>
      </div>
      <form className="panel settings-panel" onSubmit={saveNotificationPrefs}>
        <h2>Delivery channels</h2>
        <label className="form-label">
          Phone number for SMS
          <input
            type="tel"
            value={notificationPrefs.phone || ""}
            onChange={(e) => {
              setNotificationPrefs({
                ...notificationPrefs,
                phone: e.target.value,
              });
              setPhoneVerified(false);
              setPhoneOtpSent(false);
            }}
            placeholder="+91 98765 43210"
          />
        </label>
        <div className="phone-verify-row">
          <Button
            type="button"
            secondary
            disabled={busy || !notificationPrefs.phone}
            onClick={sendPhoneOtp}
          >
            Send verification code
          </Button>
          {phoneOtpSent && (
            <>
              <input
                aria-label="SMS verification code"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <Button
                type="button"
                disabled={busy || !phoneOtp.trim()}
                onClick={verifyPhoneOtp}
              >
                Verify phone
              </Button>
            </>
          )}
          {phoneVerified && (
            <span className="verified-label">
              <CheckCircle2 size={13} /> Verified
            </span>
          )}
        </div>
        <label className="toggle-row">
          <span>
            <b>Email notifications</b>
            <small>
              Receive email messages from the backend notification service.
            </small>
          </span>
          <input
            type="checkbox"
            checked={Boolean(notificationPrefs.emailEnabled)}
            onChange={(e) =>
              setNotificationPrefs({
                ...notificationPrefs,
                emailEnabled: e.target.checked,
              })
            }
          />
        </label>
        <label className="toggle-row">
          <span>
            <b>SMS notifications</b>
            <small>
              Requires a verified phone number and configured SMS provider.
            </small>
          </span>
          <input
            type="checkbox"
            checked={Boolean(notificationPrefs.smsEnabled)}
            disabled={!phoneVerified}
            onChange={(e) =>
              setNotificationPrefs({
                ...notificationPrefs,
                smsEnabled: e.target.checked,
              })
            }
          />
        </label>
        <div className="notification-options">
          <h2>Notification types</h2>
          {[
            ["projectUpdates", "Project assignments and updates"],
            ["securityAlerts", "Password and account security alerts"],
            ["teamMessages", "Team messages and mentions"],
          ].map(([key, label]) => (
            <label className="toggle-row" key={key}>
              <span>
                <b>{label}</b>
              </span>
              <input
                type="checkbox"
                checked={Boolean(notificationPrefs[key])}
                onChange={(e) =>
                  setNotificationPrefs({
                    ...notificationPrefs,
                    [key]: e.target.checked,
                  })
                }
              />
            </label>
          ))}
        </div>
        <div className="form-actions">
          <Button disabled={busy}>
            <CheckCircle2 size={14} /> Save preferences
          </Button>
          <Button
            type="button"
            secondary
            onClick={() =>
              loadNotificationPrefs().catch((e) => setError(errText(e)))
            }
          >
            <RefreshCw size={14} /> Reload
          </Button>
        </div>
        <p className="muted">
          Settings are saved through the same backend API. Email/SMS delivery
          requires server-side providers and must never use frontend API keys.
        </p>
      </form>
    </>
  );
}
