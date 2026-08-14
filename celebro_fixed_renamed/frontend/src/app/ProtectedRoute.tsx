import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./store";
import { apiClient } from "@/lib/api-client";
import { setUser, logout } from "../features/auth/authSlice";

/**
 * Redirects to /login when there's no access token. If a token exists but
 * the Redux store is empty (e.g. after a page refresh, since Redux state
 * isn't persisted), re-fetches the user's profile — this is what keeps
 * role-based views (Planner vs Celebrator dashboards) working after reload
 * instead of silently falling back to a default.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const hasToken = !!localStorage.getItem("access_token");
  const [checking, setChecking] = useState(hasToken && !isAuthenticated);

  useEffect(() => {
    if (hasToken && !isAuthenticated) {
      apiClient
        .get("/auth/me/")
        .then(({ data }) => dispatch(setUser(data)))
        .catch(() => dispatch(logout()))
        .finally(() => setChecking(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-900">
        <p className="text-sm text-ink-400">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
