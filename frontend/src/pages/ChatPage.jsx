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

export default function ChatPage(props) {
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
          <div className="eyebrow">COLLABORATION</div>
          <h1>Team Chat</h1>
          <p>Choose a project to load its messages from the same backend.</p>
        </div>
      </div>
      <div className="panel chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-head">
            <b>Project channel</b>
          </div>
          <label className="form-label">
            Select project
            <select
              value={chatProjectId}
              onChange={(e) => setChatProjectId(e.target.value)}
            >
              <option value="">Choose a project…</option>
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            secondary
            disabled={!chatProjectId}
            onClick={() =>
              loadMessages(chatProjectId).catch((e) => setError(errText(e)))
            }
          >
            <RefreshCw size={13} /> Refresh messages
          </Button>
        </aside>
        <div className="chat-conversation">
          <div className="conversation-head">
            <b>
              {projects.find((p) => String(p.id || p._id) === chatProjectId)
                ?.name || "Project conversation"}
            </b>
            <small>Messages provided by your backend</small>
          </div>
          <div className="message-list">
            {messages.map((m, i) => (
              <div className="message" key={m.id || m._id || i}>
                <span className="avatar avatar-small">
                  {initials(m.user?.name || m.author?.name || m.name || "U")}
                </span>
                <div className="message-content">
                  <div className="message-meta">
                    <b>
                      {m.user?.name ||
                        m.author?.name ||
                        m.name ||
                        "Team member"}
                    </b>
                    <span>
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p>{m.text || m.message || ""}</p>
                </div>
              </div>
            ))}
            {chatProjectId && !messages.length && (
              <div className="empty-state">
                <MessageSquare size={24} />
                <p>No messages returned for this project yet.</p>
              </div>
            )}
            {!chatProjectId && (
              <div className="empty-state">
                <MessageSquare size={24} />
                <p>Select a project to view messages.</p>
              </div>
            )}
          </div>
          {can("chat.send") && (
            <form className="message-composer" onSubmit={sendMessage}>
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={!chatProjectId}
                placeholder="Write a message…"
              />
              <div>
                <span>Be kind and constructive</span>
                <button
                  className="send-button"
                  disabled={busy || !chatProjectId || !messageText.trim()}
                  aria-label="Send message"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
