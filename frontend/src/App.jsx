import { Navigate, Route, Routes } from "react-router-dom";
import useDevConnectController from "./hooks/useDevConnectController.js";
import AuthPage from "./components/AuthPage.jsx";
import AuthenticatedApp from "./components/AuthenticatedApp.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function LoadingScreen() {
  return (
    <div className="auth-screen">
      <div className="loading-card">Checking your session…</div>
    </div>
  );
}

export default function App() {
  const controller = useDevConnectController();
  const protectedPage = (permission) => (
    <ProtectedRoute controller={controller} permission={permission}>
      <AuthenticatedApp controller={controller} />
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          controller.loading ? (
            <LoadingScreen />
          ) : controller.user ? (
            <Navigate to="/overview" replace />
          ) : (
            <AuthPage {...controller.authProps} />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={controller.user ? "/overview" : "/login"} replace />
        }
      />
      <Route path="/overview" element={protectedPage("dashboard.read")} />
      <Route path="/projects" element={protectedPage("projects.read")} />
      <Route path="/ai-review" element={protectedPage("reviews.create")} />
      <Route path="/chat" element={protectedPage("chat.read")} />
      <Route path="/users" element={protectedPage("users.read")} />
      <Route
        path="/notifications"
        element={protectedPage("notifications.read")}
      />
      <Route path="/profile" element={protectedPage("settings.manage")} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route
        path="*"
        element={
          <Navigate to={controller.user ? "/overview" : "/login"} replace />
        }
      />
    </Routes>
  );
}
