import { Menu, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../services/api.js";
import { ROLE_LABELS } from "../config/roles.js";
import Notice from "./Notice.jsx";
import Sidebar from "./Sidebar.jsx";
import OverviewPage from "../pages/OverviewPage.jsx";
import ProjectsPage from "../pages/ProjectsPage.jsx";
import ReviewPage from "../pages/ReviewPage.jsx";
import ChatPage from "../pages/ChatPage.jsx";
import UsersPage from "../pages/UsersPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

const PAGE_COMPONENTS = {
  overview: OverviewPage,
  projects: ProjectsPage,
  review: ReviewPage,
  chat: ChatPage,
  users: UsersPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
};

export default function AuthenticatedApp({ controller: c }) {
  const Page = PAGE_COMPONENTS[c.page] || OverviewPage;
  return (
    <div className="app-shell">
      {c.mobileOpen && (
        <button
          aria-label="Close menu"
          className="mobile-overlay"
          onClick={() => c.setMobileOpen(false)}
        />
      )}
      <Sidebar
        mobileOpen={c.mobileOpen}
        role={c.role}
        visibleNav={c.visibleNav}
        page={c.page}
        goTo={c.pageProps.goTo}
        logout={c.logout}
        busy={c.busy}
        user={c.user}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => c.setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumbs">
              Workspace <span>/</span>
              <b>{c.pageTitle}</b>
            </div>
          </div>
          <div className="topbar-right">
            <span className="api-status">
              <i /> API connected
            </span>
            <button
              className="icon-button"
              aria-label="Refresh data"
              onClick={c.refreshData}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>
        <section className="page-content">
          <Notice message={c.error} />
          <Notice message={c.success} type="success" />
          <Page {...c.pageProps} />
        </section>
        <footer className="footer">
          <span>© {new Date().getFullYear()} DevConnect</span>
          <span>
            <i className="online-dot" /> Connected to {API_BASE_URL}
          </span>
          <span>Signed in as {ROLE_LABELS[c.role] || c.role}</span>
        </footer>
      </main>
    </div>
  );
}
