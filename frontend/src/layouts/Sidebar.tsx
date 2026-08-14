import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useTheme } from "../app/ThemeProvider";
import Avatar from "../components/ui/Avatar";

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



export default function Sidebar({
  collapsed,
  onCloseMobile,
}: {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isPlanner = user?.role === "planner";
  const navItems = isPlanner ? PLANNER_NAV : CELEBRATOR_NAV;
  const showAdminLink = user?.role === "admin";

  const activeNavClass = isPlanner
    ? "bg-biz-700 text-white font-medium"
    : "bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-medium";
  const roleBadgeClass = isPlanner
    ? "bg-biz-100 text-biz-700 dark:bg-biz-900/40 dark:text-biz-300"
    : "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300";

  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "there";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-ink-800 border-r border-ink-100 dark:border-ink-700 flex flex-col transition-transform duration-200 ${
        collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      }`}
    >
      <div className="px-5 py-5 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl text-ink-900 dark:text-white">
          Celebro
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden text-ink-400">
            ✕
          </button>
        )}
      </div>

      {/* Profile card — stays visible while navigating */}
      <div className="mx-4 mb-5 p-4 rounded-2xl bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-ink-400 truncate">@{user?.username}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-ink-500 dark:text-ink-400">
          <p className="truncate">ID #{user?.id}</p>
          <p className="truncate">{user?.email}</p>
          {user?.phone_number && <p className="truncate">{user.phone_number}</p>}
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleBadgeClass}`}>
            {user?.role}
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          <Link
            to={user?.role === "planner" ? "/planner-profile" : "/account"}
            className={`flex-1 text-center text-xs font-medium px-2 py-1.5 rounded-lg text-white hover:opacity-90 ${
              isPlanner ? "bg-biz-700" : "bg-ink-900 dark:bg-white dark:text-ink-900"
            }`}
          >
            Edit Profile
          </Link>
          <Link
            to="/settings"
            className="flex-1 text-center text-xs font-medium px-2 py-1.5 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            Settings
          </Link>
        </div>
        <Link
          to="/referrals"
          className="block text-center text-xs mt-2 text-accent-600 dark:text-accent-400 underline"
        >
          🎁 Invite friends
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? activeNavClass
                  : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        {showAdminLink && (
          <Link
            to="/admin"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              location.pathname === "/admin"
                ? activeNavClass
                : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700"
            }`}
          >
            <span>🛠️</span>
            Admin
          </Link>
        )}
      </nav>

      {/* Footer: theme toggle + logout */}
      <div className="px-3 py-4 border-t border-ink-100 dark:border-ink-700 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700"
        >
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <span>🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
