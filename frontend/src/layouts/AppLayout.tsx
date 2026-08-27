import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import NotificationBell from "../features/notifications/NotificationBell";
import Avatar from "../components/ui/Avatar";
import { initPushNotifications } from "../lib/push-notifications";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../app/store";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    initPushNotifications();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (location.pathname.startsWith("/guests")) {
      navigate(`/guests?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/events")) return "My Events & Celebrations";
    if (path.startsWith("/marketplace")) return "Planner Marketplace";
    if (path.startsWith("/bookings") || path.startsWith("/planner-bookings")) return "Bookings & Contracts";
    if (path.startsWith("/account") || path.startsWith("/settings") || path.startsWith("/planner-profile")) return "Account Settings";
    if (path.startsWith("/admin")) return "Admin Control Center";
    if (path.startsWith("/referrals")) return "Referrals & Rewards";
    return "Event Workspace";
  };

  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "User";

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] font-sans">
      <Sidebar collapsed={!sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#3B176D]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {!sidebarOpen && (
        <div
          onMouseEnter={() => setSidebarOpen(true)}
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-0 bottom-0 w-2 hover:w-3.5 bg-gradient-to-r from-[#5B21B6]/10 to-transparent cursor-pointer z-40 transition-all duration-200 group flex items-center justify-center"
          title="Hover to expand sidebar"
        >
          <div className="hidden group-hover:flex w-1 h-12 rounded-full bg-[#5B21B6]/40" />
        </div>
      )}

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
        {/* Global Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E9E4F5] shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#17142A] text-2xl p-1 hover:bg-[#F5F3FF] rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <h1 className="font-display text-xl font-bold text-[#17142A] tracking-tight hidden sm:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, planners, guests..."
                className="w-full bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px] pl-9 pr-4 py-2 text-xs text-[#17142A] placeholder:text-[#6B6780] outline-none focus:border-[#5B21B6]"
              />
              <span className="absolute left-3 top-2.5 text-xs text-[#6B6780]">🔍</span>
            </form>

            <NotificationBell />

            <div className="h-6 w-px bg-[#E9E4F5] hidden sm:block" />

            <div className="relative">
              {menuOpen && (
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left bg-none border-none p-0 focus:outline-none relative z-50"
              >
                <Avatar name={displayName} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-[#17142A] truncate leading-tight">{displayName}</p>
                  <p className="text-[10px] text-[#5B21B6] font-semibold capitalize leading-tight">{user?.role || "Celebrator"}</p>
                </div>
                <span className="text-[10px] text-[#6B6780] ml-1 transition-transform duration-200" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E9E4F5] rounded-[12px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[#17142A] hover:bg-[#F5F3FF] hover:text-[#5B21B6] transition-colors"
                  >
                    ⚙️ Account Settings
                  </Link>
                  <div className="h-px bg-[#E9E4F5] my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      dispatch(logout());
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#C94B63] hover:bg-[#FFF1F2] transition-colors"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
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
