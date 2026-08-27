import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const PLANNER_NAV: NavItem[] = [
  { to: "/landing", label: "Luxury Showcase", icon: "✨" },
  { to: "/dashboard", label: "Overview", icon: "📊" },
  { to: "/planner-bookings", label: "Booking Requests", icon: "📥" },
  { to: "/planner-packages", label: "My Packages", icon: "📦" },
  { to: "/planner-availability", label: "Availability", icon: "📅" },
  { to: "/planner-portfolio", label: "Portfolio", icon: "🖼️" },
  { to: "/planner-earnings", label: "Earnings", icon: "💰" },
  { to: "/planner-profile", label: "Business Profile", icon: "🏢" },
];

const CELEBRATOR_NAV: NavItem[] = [
  { to: "/landing", label: "Luxury Showcase", icon: "✨" },
  { to: "/dashboard", label: "My Celebrations", icon: "🎉" },
  { to: "/events/create", label: "Create Event", icon: "➕" },
  { to: "/marketplace", label: "Find Planners", icon: "🔍" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/landing", label: "Luxury Showcase", icon: "✨" },
  { to: "/admin?view=stats", label: "Overview Stats", icon: "📊" },
  { to: "/admin?view=users", label: "User Management", icon: "👥" },
  { to: "/admin?view=planners", label: "Planner Verification", icon: "🏢" },
  { to: "/admin?view=disputes", label: "Disputes & Refunds", icon: "⚖️" },
  { to: "/admin?view=celebrations", label: "Celebration Catalog", icon: "🎉" },
  { to: "/admin?view=experiences", label: "Experiences Catalog", icon: "✨" },
  { to: "/admin?view=howitworks", label: "How It Works", icon: "📋" },
  { to: "/admin?view=lookbook", label: "Lookbook Gallery", icon: "🖼️" },
  { to: "/account", label: "Account Settings", icon: "⚙️" },
];

export default function Sidebar({
  collapsed,
  onCloseMobile,
}: {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}) {
  const location = useLocation();
  const user = useSelector((s: RootState) => s.auth.user);

  const isPlanner = user?.role === "planner";
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV : (isPlanner ? PLANNER_NAV : CELEBRATOR_NAV);
  const showAdminLink = false;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-[#FCFCFE] to-[#F8F6FE] border-r border-[#E9E4F5] flex flex-col transition-transform duration-300 ${
        collapsed ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="px-6 py-5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-all duration-200">
          <img src="/images/celebro_logo.png" alt="Celebro" className="h-8 w-auto object-contain" />
          <span className="font-display text-lg font-extrabold tracking-tight bg-gradient-to-r from-purple-800 to-indigo-800 bg-clip-text text-transparent">
            Celebro
          </span>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="text-[#6B6780] p-1 hover:bg-[#F5F3FF] rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.to.includes("?")
            ? (location.pathname + location.search === item.to || (item.to === "/admin?view=stats" && location.pathname === "/admin" && !location.search))
            : location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-[#F3EEFF] to-[#FAF8FF] text-[#5B21B6] border-l-[3.5px] border-[#5B21B6] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  : "text-[#6B6780] hover:bg-[#F5F3FF]/40 hover:text-[#5B21B6] hover:translate-x-1"
              }`}
            >
              <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-sm transition-all duration-300 ${
                active
                  ? "bg-[#5B21B6] text-white shadow-sm"
                  : "bg-[#F5F3FF] text-[#5B21B6] border border-[#E9E4F5]/50 group-hover:bg-[#EDE9FE]"
              }`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        {showAdminLink && (
          <Link
            to="/admin"
            onClick={onCloseMobile}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-300 ${
              location.pathname === "/admin"
                ? "bg-gradient-to-r from-[#F3EEFF] to-[#FAF8FF] text-[#5B21B6] border-l-[3.5px] border-[#5B21B6] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                : "text-[#6B6780] hover:bg-[#F5F3FF]/40 hover:text-[#5B21B6] hover:translate-x-1"
            }`}
          >
            <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-sm transition-all duration-300 ${
              location.pathname === "/admin"
                ? "bg-[#5B21B6] text-white shadow-sm"
                : "bg-[#F5F3FF] text-[#5B21B6] border border-[#E9E4F5]/50 group-hover:bg-[#EDE9FE]"
            }`}>
              🛠️
            </span>
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
