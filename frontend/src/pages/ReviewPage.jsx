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

export default function ReviewPage(props) {
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
          <div className="eyebrow">SECURITY TOOLING</div>
          <h1>AI Code Review</h1>
          <p>
            AI code review powered by OpenRouter free models. Your API key stays
            on the backend.
          </p>
        </div>
      </div>
      <div className="review-layout">
        <form className="panel editor-panel" onSubmit={runReview}>
          <div className="editor-toolbar">
            <b>Code input</b>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {[
                "JavaScript",
                "TypeScript",
                "Python",
                "Java",
                "Go",
                "C#",
                "PHP",
                "SQL",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="code-editor">
            <div className="line-numbers">
              {Array.from(
                { length: Math.max(1, code.split("\n").length) },
                (_, i) => (
                  <span key={i}>{i + 1}</span>
                ),
              )}
            </div>
            <textarea
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code to review…"
              spellCheck="false"
            />
          </div>
          <div className="review-action">
            <span>
              OpenRouter free model · processed through your backend API.
            </span>
            <Button disabled={busy || !code.trim()}>
              <ScanSearch size={14} />
              {busy ? "Reviewing…" : "Run code review"}
            </Button>
          </div>
        </form>
        <div className="panel findings-panel">
          <div className="findings-header">
            <div>
              <div className="eyebrow">ANALYSIS RESULTS</div>
              <h2>Findings</h2>
            </div>
            <ShieldCheck size={21} />
          </div>
          {reviewResult ? (
            <>
              <p className="muted">
                {reviewResult.summary || "Review completed."}
              </p>
              {reviewResult.model && (
                <div className="finding-file">
                  Provider: {reviewResult.provider || "OpenRouter"} · Model:{" "}
                  {reviewResult.model}
                </div>
              )}
              {(reviewResult.findings || reviewResult.data?.findings || []).map(
                (f, i) => (
                  <div className="finding-card" key={i}>
                    <div className="finding-title">
                      <b>{f.title || f.message || "Finding"}</b>
                      <span className="badge danger">
                        {f.severity || "Info"}
                      </span>
                    </div>
                    <div className="finding-file">
                      {f.file || "Submitted code"}
                      {f.line ? ` · Line ${f.line}` : ""}
                    </div>
                    <p>{f.detail || f.description || ""}</p>
                    {f.suggestion && (
                      <p>
                        <b>Suggestion:</b> {f.suggestion}
                      </p>
                    )}
                  </div>
                ),
              )}
            </>
          ) : (
            <div className="review-empty">
              <span className="review-empty-icon">
                <ShieldCheck size={23} />
              </span>
              <h3>Ready to review</h3>
              <p>
                Run an analysis to display findings returned by your backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
