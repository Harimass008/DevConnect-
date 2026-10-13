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

import { API_BASE_URL } from "../services/api.js";
export default function OverviewPage(props) {
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
          <div className="eyebrow">WORKSPACE OVERVIEW</div>
          <h1>
            Good to see you, {String(user.name || "there").split(" ")[0]} 👋
          </h1>
          <p>Here’s what’s happening in your development workspace.</p>
        </div>
        <div className="heading-action">
          <Button secondary onClick={refreshData}>
            <RefreshCw size={14} /> Refresh
          </Button>
          {can("projects.create") && (
            <Button
              onClick={() => {
                goTo("projects");
                setShowCreate(true);
              }}
            >
              <Plus size={15} /> New project
            </Button>
          )}
        </div>
      </div>
      <div className="welcome-banner">
        <div className="banner-content">
          <div className="banner-kicker">
            <Activity size={14} /> YOUR WORKSPACE, IN ONE PLACE
          </div>
          <h2>
            Build better software.
            <br />
            <span>Secure it from day one.</span>
          </h2>
          <p>
            Collaborate on projects, review code, and keep work moving with
            permissions assigned by your administrator.
          </p>
          <Button onClick={() => goTo("projects")}>
            Explore projects <ChevronRight size={14} />
          </Button>
        </div>
        <div className="banner-art">
          <div className="code-window">
            <div className="window-top">
              <i />
              <i />
              <i />
              <span>access-control.js</span>
            </div>
            <div className="code-lines">
              <div>
                <span style={{ color: "#b6a5ff" }}>const</span> role ={" "}
                <span style={{ color: "#91d8b5" }}>user.role</span>;
              </div>
              <div>
                <span style={{ color: "#b6a5ff" }}>if</span> (can(role, action)){" "}
                {"{"}
              </div>
              <div>
                　<span style={{ color: "#91d8b5" }}>allow()</span>;
              </div>
              <div>
                {"}"} <span style={{ color: "#8b96b0" }}>else</span> deny();
              </div>
              <div className="code-success">
                <CheckCircle2 size={12} /> permissions checked
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="stats-grid">
        <Stat
          icon={FolderKanban}
          label="Total projects"
          value={projects.length}
          hint="Loaded from your backend"
        />
        <Stat
          icon={ShieldCheck}
          label="Your role"
          value={ROLE_LABELS[role] || ROLE_LABELS.viewer}
          hint="Assigned by backend"
        />
        <Stat
          icon={Users}
          label="User directory"
          value={can("users.read") ? users.length : "Restricted"}
          hint={
            can("users.read") ? "Visible to your role" : "Admin / manager only"
          }
        />
        <Stat
          icon={Activity}
          label="API endpoint"
          value="Connected"
          hint={API_BASE_URL}
        />
      </div>
      <div className="panel projects-panel">
        <div className="section-title">
          <h2>Recent projects</h2>
          <button onClick={() => goTo("projects")}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <ProjectRows
          projects={projects.slice(0, 5)}
          onOpen={(id) => {
            setChatProjectId(String(id));
            goTo("chat");
          }}
        />
      </div>
    </>
  );
}
