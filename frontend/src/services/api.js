const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const TOKEN_KEY = "devconnect_access_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};
export const clearSession = () => setToken(null);

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach backend at ${API_BASE_URL}. Check that your backend is running and CORS is enabled.`,
    );
  }
  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
  }
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      window.dispatchEvent(new CustomEvent("devconnect:unauthorized"));
    }
    throw new Error(
      data?.message || data?.error || `Request failed (${response.status})`,
    );
  }
  return data;
}
const json = (value) => JSON.stringify(value);

export const api = {
  async register(payload) {
    const data = await request("/auth/register", {
      method: "POST",
      body: json(payload),
    });
    if (data?.token || data?.accessToken)
      setToken(data.token || data.accessToken);
    return data;
  },
  async login(payload) {
    const data = await request("/auth/login", {
      method: "POST",
      body: json(payload),
    });
    if (data?.token || data?.accessToken)
      setToken(data.token || data.accessToken);
    return data;
  },
  me: () => request("/auth/me"),
  forgotPassword: (payload) =>
    request("/auth/forgot-password", { method: "POST", body: json(payload) }),
  resetPassword: (payload) =>
    request("/auth/reset-password", { method: "POST", body: json(payload) }),
  changePassword: (payload) =>
    request("/auth/change-password", { method: "POST", body: json(payload) }),
  notificationPreferences: () => request("/notifications/preferences"),
  updateNotificationPreferences: (payload) =>
    request("/notifications/preferences", {
      method: "PATCH",
      body: json(payload),
    }),
  sendPhoneOtp: (payload) =>
    request("/notifications/phone/send-otp", {
      method: "POST",
      body: json(payload),
    }),
  verifyPhoneOtp: (payload) =>
    request("/notifications/phone/verify-otp", {
      method: "POST",
      body: json(payload),
    }),
  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  },
  projects: () => request("/projects"),
  project: (id) => request(`/projects/${encodeURIComponent(id)}`),
  createProject: (payload) =>
    request("/projects", { method: "POST", body: json(payload) }),
  review: (payload) =>
    request("/reviews", { method: "POST", body: json(payload) }),
  messages: (projectId) =>
    request(`/projects/${encodeURIComponent(projectId)}/messages`),
  sendMessage: (projectId, text) =>
    request(`/projects/${encodeURIComponent(projectId)}/messages`, {
      method: "POST",
      body: json({ text }),
    }),
  updateProfile: (payload) =>
    request("/auth/me", { method: "PATCH", body: json(payload) }),
  adminUsers: () => request("/admin/users"),
  updateUserRole: (id, role) =>
    request(`/admin/users/${encodeURIComponent(id)}/role`, {
      method: "PATCH",
      body: json({ role }),
    }),
  adminStats: () => request("/admin/stats"),
};
export { API_BASE_URL };
