import Brand from "./Brand.jsx";
import Notice from "./Notice.jsx";
import { API_BASE_URL } from "../services/api.js";

export default function AuthPage({
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
  busy,
  error,
  success,
  setError,
  setSuccess,
  submitAuth,
  requestPasswordReset,
  submitPasswordReset,
}) {
  if (authMode === "forgot" || authMode === "reset") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <Brand small />
          <div className="auth-intro">
            <h1>
              {authMode === "forgot"
                ? "Reset your password"
                : "Choose a new password"}
            </h1>
            <p>
              {authMode === "forgot"
                ? "We will send reset instructions if the account exists."
                : "Use the secure token from your reset link."}
            </p>
          </div>
          <Notice message={error} />
          <Notice message={success} type="success" />
          <form
            onSubmit={
              authMode === "forgot" ? requestPasswordReset : submitPasswordReset
            }
          >
            {authMode === "forgot" ? (
              <label className="form-label">
                Account email
                <input
                  required
                  type="email"
                  value={auth.email}
                  onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>
            ) : (
              <>
                <label className="form-label">
                  Reset token
                  <input
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token"
                  />
                </label>
                <label className="form-label">
                  New password
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>
                <label className="form-label">
                  Confirm new password
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Enter it again"
                  />
                </label>
              </>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? "Please wait…"
                : authMode === "forgot"
                  ? "Send reset instructions"
                  : "Reset password"}
            </button>
          </form>
          <div className="auth-switch">
            <button
              onClick={() => {
                setAuthMode("login");
                setError("");
                setSuccess("");
              }}
            >
              Back to sign in
            </button>
          </div>
          <p
            className="small-note muted"
            style={{ textAlign: "center", marginTop: 14 }}
          >
            API: {API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Brand small />
        <div className="auth-intro">
          <h1>
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p>Sign in to your DevConnect workspace.</p>
        </div>
        <Notice message={error} />
        <Notice message={success} type="success" />
        <form onSubmit={submitAuth}>
          {authMode === "register" && (
            <label className="form-label">
              Full name
              <input
                required
                autoComplete="name"
                value={auth.name}
                onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
          )}
          <label className="form-label">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={auth.email}
              onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label className="form-label">
            Password
            <input
              required
              type="password"
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
              placeholder="Enter password"
              minLength={authMode === "register" ? 8 : undefined}
            />
          </label>
          <button className="button" disabled={busy}>
            {busy
              ? "Please wait…"
              : authMode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        {authMode === "login" && (
          <div className="auth-switch">
            <button
              onClick={() => {
                setAuthMode("forgot");
                setError("");
                setSuccess("");
              }}
            >
              Forgot password?
            </button>
          </div>
        )}
        <div className="auth-switch">
          {authMode === "login"
            ? "New to DevConnect?"
            : "Already have an account?"}
          <button
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setError("");
              setSuccess("");
            }}
          >
            {authMode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>
        <p
          className="small-note muted"
          style={{ textAlign: "center", marginTop: 14 }}
        >
          API: {API_BASE_URL}
        </p>
      </div>
    </div>
  );
}
