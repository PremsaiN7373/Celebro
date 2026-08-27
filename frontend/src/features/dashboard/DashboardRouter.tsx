import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../app/store";
import PlannerDashboardPage from "./PlannerDashboardPage";
import CelebratorDashboardPage from "./CelebratorDashboardPage";

export default function DashboardRouter() {
  const user = useSelector((s: RootState) => s.auth.user);

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "planner") return <PlannerDashboardPage />;
  return <CelebratorDashboardPage />;
}
