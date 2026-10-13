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

export default function ProjectsPage(props) {
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
          <div className="eyebrow">WORKSPACE</div>
          <h1>Projects</h1>
          <p>Browse projects available to your account.</p>
        </div>
        <div className="heading-action">
          {can("projects.create") && (
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus size={15} /> New project
            </Button>
          )}
        </div>
      </div>
      <div className="projects-toolbar">
        <div className="inline-search">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
          />
        </div>
        <span className="muted">{filteredProjects.length} project(s)</span>
      </div>
      {showCreate && can("projects.create") && (
        <form className="panel create-form" onSubmit={createProject}>
          <h2>Create project</h2>
          <label className="form-label">
            Project name
            <input
              required
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({ ...projectForm, name: e.target.value })
              }
              placeholder="e.g. Secure API"
            />
          </label>
          <label className="form-label">
            Description
            <textarea
              required
              rows={3}
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              placeholder="What are you building?"
            />
          </label>
          <label className="form-label">
            Primary language
            <select
              value={projectForm.language}
              onChange={(e) =>
                setProjectForm({ ...projectForm, language: e.target.value })
              }
            >
              {[
                "JavaScript",
                "TypeScript",
                "Python",
                "Java",
                "Go",
                "C#",
                "Other",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <Button
              type="button"
              secondary
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button disabled={busy}>
              <Plus size={14} /> Create project
            </Button>
          </div>
        </form>
      )}
      <div className="project-cards">
        {filteredProjects.map((p, i) => (
          <article className="project-card" key={p.id || p._id || p.name}>
            <div className="project-card-top">
              <span
                className={`project-logo ${["", "blue", "green", "orange"][i % 4]}`}
              >
                <Code2 size={18} />
              </span>
              <span className="badge neutral">{p.status || "Active"}</span>
            </div>
            <h3>{p.name || "Untitled project"}</h3>
            <p>{p.description || "No description provided."}</p>
            <div className="card-meta">
              <span>
                <Code2 size={12} />
                {p.language || "Not specified"}
              </span>
              <span>
                {p.updatedAt
                  ? new Date(p.updatedAt).toLocaleDateString()
                  : "Project"}
              </span>
            </div>
            <div className="project-card-bottom">
              <span>Access: {ROLE_LABELS[role] || role}</span>
              <button
                className="round-arrow"
                title="Open project chat"
                onClick={() => {
                  setChatProjectId(String(p.id || p._id));
                  goTo("chat");
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filteredProjects.length && (
        <div className="panel empty-state">
          <FolderKanban size={28} />
          <h3>No projects found</h3>
          <p>Projects returned by the backend will appear here.</p>
        </div>
      )}
    </>
  );
}
