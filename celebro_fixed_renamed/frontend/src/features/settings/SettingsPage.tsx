import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTheme } from "../../app/ThemeProvider";
import { logout } from "../auth/authSlice";
import WidgetCard from "@/components/ui/WidgetCard";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink-900 dark:text-white mb-6">Settings</h1>

      <WidgetCard title="Appearance" className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-700 dark:text-ink-200">Theme</p>
            <p className="text-xs text-ink-400">Choose light or dark mode.</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary">
            {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
          </button>
        </div>
      </WidgetCard>

      <WidgetCard title="Account">
        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Log out of Celebro
        </button>
      </WidgetCard>
    </div>
  );
}
