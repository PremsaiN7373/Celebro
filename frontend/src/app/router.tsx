import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import LandingPage from "../features/landing/LandingPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardRouter from "../features/dashboard/DashboardRouter";
import CelebratorDashboardPage from "../features/dashboard/CelebratorDashboardPage";
import SettingsPage from "../features/settings/SettingsPage";
import ReferralsPage from "../features/settings/ReferralsPage";
import AccountPage from "../features/settings/AccountPage";
import CreateEventPage from "../features/events/CreateEventPage";
import EventWorkspacePage from "../features/events/EventWorkspacePage";
import MarketplacePage from "../features/marketplace/MarketplacePage";
import PlannerProfilePage from "../features/planners/PlannerProfilePage";
import PlannerDetailPage from "../features/planners/PlannerDetailPage";
import PlannerPackagesPage from "../features/planners/PlannerPackagesPage";
import PlannerAvailabilityPage from "../features/planners/PlannerAvailabilityPage";
import PlannerPortfolioPage from "../features/planners/PlannerPortfolioPage";
import PlannerEarningsPage from "../features/planners/PlannerEarningsPage";
import PlannerBookingsPage from "../features/planners/PlannerBookingsPage";
import BookingsPage from "../features/bookings/BookingsPage";
import GuestsPage from "../features/guests/GuestsPage";
import ChatPage from "../features/chat/ChatPage";
import PaymentsPage from "../features/payments/PaymentsPage";
import AdminPage from "../features/admin/AdminPage";
import PublicInvitePage from "../features/invitations/PublicInvitePage";
import ComparePage from "../features/marketplace/ComparePage";
import ExperiencesPage from "../features/landing/pages/ExperiencesPage";
import HowItWorksPage from "../features/landing/pages/HowItWorksPage";
import LookbookPage from "../features/landing/pages/LookbookPage";
import ProtectedRoute from "./ProtectedRoute";


export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    ),
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/landing", element: <LandingPage /> },
      { path: "/celebrations", element: <Navigate to="/experiences" replace /> },
      { path: "/experiences", element: <ExperiencesPage /> },
      { path: "/how-it-works", element: <HowItWorksPage /> },
      { path: "/lookbook", element: <LookbookPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/invite/:uuid", element: <PublicInvitePage /> },

      {
        path: "/app",
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardRouter /> },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <DashboardRouter /> },
          { path: "my-celebrations", element: <CelebratorDashboardPage /> },
          { path: "settings", element: <Navigate to="/account" replace /> },
          { path: "referrals", element: <ReferralsPage /> },
          { path: "account", element: <AccountPage /> },
          { path: "events/create", element: <CreateEventPage /> },
          { path: "events/:id", element: <EventWorkspacePage /> },
          { path: "marketplace", element: <MarketplacePage /> },
          { path: "compare", element: <ComparePage /> },
          { path: "planner-profile", element: <PlannerProfilePage /> },
          { path: "planner-packages", element: <PlannerPackagesPage /> },
          { path: "planner-availability", element: <PlannerAvailabilityPage /> },
          { path: "planner-portfolio", element: <PlannerPortfolioPage /> },
          { path: "planner-earnings", element: <PlannerEarningsPage /> },
          { path: "planner-bookings", element: <PlannerBookingsPage /> },
          { path: "planners/:id", element: <PlannerDetailPage /> },
          { path: "bookings", element: <BookingsPage /> },
          { path: "guests", element: <GuestsPage /> },
          { path: "chat/:bookingId", element: <ChatPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "admin", element: <AdminPage /> },
        ],
      },
    ],
  },
]);


