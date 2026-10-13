import { ChevronRight, ShieldCheck, LogOut } from "lucide-react";
import Brand from "./Brand.jsx";
import { ROLE_LABELS } from "../config/roles.js";
import { initials } from "../utils.js";

export default function Sidebar({
  mobileOpen,
  role,
  visibleNav,
  page,
  goTo,
  logout,
  busy,
  user,
}) {
  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <Brand />
      <div className="workspace-switch">
        <span className="workspace-icon">D</span>
        <span>
          <b>DevConnect Workspace</b>
          <small>{ROLE_LABELS[role] || ROLE_LABELS.viewer}</small>
        </span>
        <ChevronRight size={14} />
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${page === item.id ? "active" : ""}`}
            onClick={() => goTo(item.id)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="usage-card">
        <div className="usage-icon">
          <ShieldCheck size={19} />
        </div>
        <b>Role-based access</b>
        <span>
          Your menu is tailored to your assigned role. The backend must enforce
          every permission too.
        </span>
      </div>
      <div className="bottom-nav">
        <button
          className="nav-link logout-link"
          onClick={logout}
          disabled={busy}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <div className="user-profile">
        <span className="avatar">{initials(user.name || user.email)}</span>
        <span>
          <b>{user.name || "User"}</b>
          <small>{user.email}</small>
        </span>
        <span className="badge info">{role.replaceAll("_", " ")}</span>
      </div>
    </aside>
  );
}
