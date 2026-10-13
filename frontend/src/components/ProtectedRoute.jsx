import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ controller, permission, children }) {
  const location = useLocation();

  if (controller.loading) {
    return (
      <div className="auth-screen">
        <div className="loading-card">Checking your session…</div>
      </div>
    );
  }

  if (!controller.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !controller.can(permission)) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Access denied</h1>
          <p>Your account role does not have permission to open this page.</p>
          <button
            className="button"
            onClick={() => controller.pageProps.goTo("overview")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
