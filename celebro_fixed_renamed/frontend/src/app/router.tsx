import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardRouter from "../features/dashboard/DashboardRouter";
import SettingsPage from "../features/settings/SettingsPage";
import AccountPage from "../features/settings/AccountPage";
import CreateEventPage from "../features/events/CreateEventPage";
import EventWorkspacePage from "../features/events/EventWorkspacePage";
import MarketplacePage from "../features/marketplace/MarketplacePage";
import PlannerProfilePage from "../features/planners/PlannerProfilePage";
import PlannerDetailPage from "../features/planners/PlannerDetailPage";
import PlannerPackagesPage from "../features/planners/PlannerPackagesPage";
import PlannerBookingsPage from "../features/planners/PlannerBookingsPage";
import BookingsPage from "../features/bookings/BookingsPage";
import GuestsPage from "../features/guests/GuestsPage";
import ChatPage from "../features/chat/ChatPage";
import PaymentsPage from "../features/payments/PaymentsPage";
import AdminPage from "../features/admin/AdminPage";
import PublicInvitePage from "../features/invitations/PublicInvitePage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/invite/:uuid", element: <PublicInvitePage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardRouter /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "events/create", element: <CreateEventPage /> },
      { path: "events/:id", element: <EventWorkspacePage /> },
      { path: "marketplace", element: <MarketplacePage /> },
      { path: "planner-profile", element: <PlannerProfilePage /> },
      { path: "planner-packages", element: <PlannerPackagesPage /> },
      { path: "planner-bookings", element: <PlannerBookingsPage /> },
      { path: "planners/:id", element: <PlannerDetailPage /> },
      { path: "bookings", element: <BookingsPage /> },
      { path: "guests", element: <GuestsPage /> },
      { path: "chat/:bookingId", element: <ChatPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "admin", element: <AdminPage /> },
    ],
  },
]);
