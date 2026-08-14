import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import NotificationBell from "../features/notifications/NotificationBell";
import Avatar from "../components/ui/Avatar";
import { initPushNotifications } from "../lib/push-notifications";
import type { RootState } from "../app/store";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    initPushNotifications();
  }, []);

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/events")) return "My Events & Celebrations";
    if (path.startsWith("/marketplace")) return "Planner Marketplace";
    if (path.startsWith("/bookings") || path.startsWith("/planner-bookings")) return "Bookings & Contracts";
    if (path.startsWith("/settings")) return "Settings & Security";
    if (path.startsWith("/account") || path.startsWith("/planner-profile")) return "Account Profile";
    if (path.startsWith("/admin")) return "Admin Control Center";
    if (path.startsWith("/referrals")) return "Referrals & Rewards";
    return "Event Workspace";
  };

  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "User";

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] font-sans">
      <Sidebar collapsed={!mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#3B176D]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        {/* Global Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E9E4F5] shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-[#17142A] text-2xl p-1 lg:hidden"
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <h1 className="font-display text-xl font-bold text-[#17142A] tracking-tight hidden sm:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-72">
              <input
                type="text"
                placeholder="Search events, planners, guests..."
                className="w-full bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px] pl-9 pr-4 py-2 text-xs text-[#17142A] placeholder:text-[#6B6780] outline-none focus:border-[#5B21B6]"
              />
              <span className="absolute left-3 top-2.5 text-xs text-[#6B6780]">🔍</span>
            </div>

            <NotificationBell />

            <div className="h-6 w-px bg-[#E9E4F5] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <Avatar name={displayName} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#17142A] truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-[#5B21B6] font-semibold capitalize leading-tight">{user?.role || "Celebrator"}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




