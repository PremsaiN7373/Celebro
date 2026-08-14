import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";
import Avatar from "@/components/ui/Avatar";

export default function AccountPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink-900 dark:text-white mb-6">Your Account</h1>

      <WidgetCard title="Profile">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={user?.username ?? "?"} size="lg" />
          <div>
            <p className="font-medium text-ink-900 dark:text-white">{user?.username}</p>
            <p className="text-xs text-ink-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="User ID" value={`#${user?.id}`} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Phone" value={user?.phone_number || "—"} />
        </div>
        <p className="text-xs text-ink-400 mt-5">
          Editing account details isn't connected yet — this view is read-only for now.
        </p>
      </WidgetCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-ink-100 dark:border-ink-700 last:border-0">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-800 dark:text-ink-100 font-medium">{value}</span>
    </div>
  );
}
