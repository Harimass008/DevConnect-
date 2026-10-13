import { useEffect, useState } from "react";
import { api, clearSession, getToken } from "../services/api.js";
import { userFrom, errText } from "../utils.js";

export default function useAuth({
  setBusy,
  setError,
  setSuccess,
  setProfile,
  setPage,
}) {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(
    new URLSearchParams(window.location.search).get("token")
      ? "reset"
      : "login",
  );
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [resetToken, setResetToken] = useState(
    new URLSearchParams(window.location.search).get("token") || "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    api
      .me()
      .then((data) => {
        if (!active) return;
        const current = userFrom(data);
        setUser(current);
        setProfile({ name: current?.name || "", email: current?.email || "" });
      })
      .catch(() => {
        clearSession();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const unauthorized = () => {
      setUser(null);
    };
    window.addEventListener("devconnect:unauthorized", unauthorized);
    return () => {
      active = false;
      window.removeEventListener("devconnect:unauthorized", unauthorized);
    };
  }, [setProfile]);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const data =
        authMode === "login"
          ? await api.login({
              email: auth.email.trim(),
              password: auth.password,
            })
          : await api.register({
              name: auth.name.trim(),
              email: auth.email.trim(),
              password: auth.password,
            });
      let current = userFrom(data);
      if (!current?.role && getToken()) current = userFrom(await api.me());
      if (!current?.role)
        throw new Error(
          "Backend response must include the authenticated user role. Add role to /auth/login and /auth/me responses.",
        );
      setUser(current);
      setProfile({ name: current.name || "", email: current.email || "" });
      setPage("overview");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.forgotPassword({ email: auth.email.trim() });
      setSuccess(
        "If the account exists, password-reset instructions have been sent. Check your email.",
      );
      setAuthMode("login");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordReset(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (newPassword !== confirmNewPassword)
        throw new Error("New password and confirmation do not match.");
      await api.resetPassword({
        token: resetToken.trim(),
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });
      setSuccess("Password reset complete. Sign in with your new password.");
      setNewPassword("");
      setConfirmNewPassword("");
      setAuthMode("login");
      window.history.replaceState({}, "", window.location.pathname);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(payload) {
    return api.changePassword(payload);
  }

  async function logout() {
    setBusy(true);
    try {
      await api.logout();
    } catch {
    } finally {
      clearSession();
      setUser(null);
      setBusy(false);
    }
  }

  const authProps = {
    authMode,
    setAuthMode,
    auth,
    setAuth,
    resetToken,
    setResetToken,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    setError,
    setSuccess,
    submitAuth,
    requestPasswordReset,
    submitPasswordReset,
  };
  return { user, setUser, loading, authProps, logout, changePassword };
}
