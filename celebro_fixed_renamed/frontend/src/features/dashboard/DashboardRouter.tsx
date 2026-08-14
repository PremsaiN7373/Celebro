import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import PlannerDashboardPage from "./PlannerDashboardPage";
import CelebratorDashboardPage from "./CelebratorDashboardPage";

export default function DashboardRouter() {
  const user = useSelector((s: RootState) => s.auth.user);

  if (user?.role === "planner") return <PlannerDashboardPage />;
  return <CelebratorDashboardPage />;
}
