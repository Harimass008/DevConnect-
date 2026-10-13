import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api.js";
import { NAV, ROLE_LABELS, ROLE_PERMISSIONS } from "../config/roles.js";
import { errText } from "../utils.js";
import useAuth from "./useAuth.js";
import useProjects from "./useProjects.js";
import useUsers from "./useUsers.js";
import useReview from "./useReview.js";
import useChat from "./useChat.js";
import useNotifications from "./useNotifications.js";
import useProfile from "./useProfile.js";

const PAGE_BY_PATH = {
  "/overview": "overview",
  "/projects": "projects",
  "/ai-review": "review",
  "/chat": "chat",
  "/users": "users",
  "/notifications": "notifications",
  "/profile": "settings",
  "/settings": "settings",
};
const PATH_BY_PAGE = {
  overview: "/overview",
  projects: "/projects",
  review: "/ai-review",
  chat: "/chat",
  users: "/users",
  notifications: "/notifications",
  settings: "/profile",
};

export default function useDevConnectController() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = PAGE_BY_PATH[location.pathname] || "overview";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "" });

  const goTo = useCallback(
    (id) => {
      navigate(PATH_BY_PAGE[id] || "/overview");
      setMobileOpen(false);
      setError("");
      setSuccess("");
    },
    [navigate],
  );

  const authState = useAuth({
    setBusy,
    setError,
    setSuccess,
    setProfile,
    setPage: goTo,
  });
  const { user, setUser, loading, authProps, changePassword } = authState;
  const role = String(user?.role || user?.userRole || "viewer")
    .toLowerCase()
    .replace(/[ -]/g, "_");
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  const can = (permission) => permissions.includes(permission);
  const visibleNav = NAV.filter((item) => can(item.permission));

  const projectsState = useProjects({ setBusy, setError, setSuccess });
  const usersState = useUsers({ role, can, setBusy, setError, setSuccess });
  const reviewState = useReview({ setBusy, setError });
  const chatState = useChat({ setBusy, setError });
  const notificationsState = useNotifications({
    setBusy,
    setError,
    setSuccess,
  });
  const profileState = useProfile({
    profile,
    setProfile,
    setUser,
    setBusy,
    setError,
    setSuccess,
  });

  const refreshData = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      await projectsState.loadProjects();
      if (can("users.read")) await usersState.loadUsers();
    } catch (e) {
      setError(errText(e));
    }
    // Role is provided by the authenticated backend response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectsState.loadProjects, usersState.loadUsers, role]);

  useEffect(() => {
    if (user) refreshData();
  }, [user, refreshData]);
  useEffect(() => {
    if (user && page === "users" && can("users.read"))
      usersState.loadUsers().catch((e) => setError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user, role]);
  useEffect(() => {
    if (user && page === "chat" && chatState.chatProjectId)
      chatState
        .loadMessages(chatState.chatProjectId)
        .catch((e) => setError(errText(e)));
  }, [user, page, chatState.chatProjectId, chatState.loadMessages]);
  useEffect(() => {
    if (user && page === "notifications")
      notificationsState
        .loadNotificationPrefs()
        .catch((e) => setError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  async function logout() {
    await authState.logout();
    projectsState.setProjects([]);
    usersState.setUsers([]);
    goTo("overview");
  }

  const pageTitle = NAV.find((item) => item.id === page)?.label || "Overview";
  const pageProps = {
    user,
    role,
    can,
    ...projectsState,
    ...usersState,
    ...reviewState,
    ...chatState,
    ...notificationsState,
    ...profileState,
    busy,
    refreshData,
    goTo,
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
    setPage: goTo,
    setBusy,
  };
  const completeAuthProps = { ...authProps, busy, error, success };

  return {
    loading,
    user,
    role,
    can,
    visibleNav,
    page,
    pageTitle,
    mobileOpen,
    setMobileOpen,
    logout,
    busy,
    refreshData,
    error,
    success,
    pageProps,
    authProps: completeAuthProps,
    apiBaseUrl: API_BASE_URL,
    roleLabel: ROLE_LABELS[role] || role,
  };
}
