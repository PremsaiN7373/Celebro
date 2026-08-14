import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";
import Avatar from "@/components/ui/Avatar";

export default function AccountPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#211F20]">Account Details</h1>
        <p className="text-sm text-[#756D6F] mt-1 font-medium">Manage your profile credentials and account information.</p>
      </div>

      <WidgetCard title="Account Profile">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.username ?? "?"} size="lg" />
          <div>
            <p className="font-display text-xl font-bold text-[#211F20]">{user?.username}</p>
            <p className="text-xs text-[#7A1F3D] font-bold uppercase tracking-wider mt-0.5">{user?.role || "Celebrator"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Row label="User ID" value={`#${user?.id}`} />
          <Row label="Email Address" value={user?.email ?? "—"} />
          <Row label="Phone Number" value={user?.phone_number || "—"} />
        </div>
      </WidgetCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E9DDD5] last:border-0 text-sm">
      <span className="text-[#756D6F] font-medium">{label}</span>
      <span className="text-[#211F20] font-bold">{value}</span>
    </div>
  );
}



