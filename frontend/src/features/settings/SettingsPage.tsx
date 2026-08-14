import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useState } from "react";
import { logout, setUser } from "../auth/authSlice";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const [toggling, setToggling] = useState(false);

  const toggle2FA = async () => {
    setToggling(true);
    try {
      await apiClient.post("/auth/toggle-2fa/");
      const me = await apiClient.get("/auth/me/");
      dispatch(setUser(me.data));
      toast.success(
        me.data.two_factor_enabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      );
    } catch {
      toast.error("Could not update this setting");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#17142A]">Settings & Security</h1>
        <p className="text-sm text-[#6B6780] mt-1 font-medium">Manage your security preferences and active sessions.</p>
      </div>

      <WidgetCard title="Security & Authentication">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#17142A]">Two-Factor Authentication (2FA)</p>
            <p className="text-xs text-[#6B6780] mt-1 max-w-sm font-medium">
              {user?.two_factor_enabled
                ? "Enabled — an email verification code is sent upon each login attempt."
                : "Off — protect your account with an email code during login."}
            </p>
          </div>
          <button onClick={toggle2FA} disabled={toggling} className="btn-secondary text-xs shrink-0 font-semibold">
            {user?.two_factor_enabled ? "Turn Off" : "Turn On"}
          </button>
        </div>
      </WidgetCard>

      <WidgetCard title="Session Control">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#17142A]">Active Session</span>
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="text-xs font-bold text-[#C94B63] hover:underline"
          >
            Log Out of Celebro
          </button>
        </div>
      </WidgetCard>
    </div>
  );
}




