import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Stats {
  total_users: number;
  total_customers: number;
  total_planners: number;
  verified_planners: number;
  pending_verifications: number;
  total_events: number;
  total_bookings: number;
  bookings_by_status: { status: string; count: number }[];
  total_revenue: string;
  new_users_last_30_days: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

interface AdminPlanner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  owner_email: string;
  is_verified: boolean;
  created_at: string;
}

type View = "stats" | "users" | "planners";

export default function AdminPage() {
  const [view, setView] = useState<View>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [planners, setPlanners] = useState<AdminPlanner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const { data } = await apiClient.get("/admin-panel/stats/");
    setStats(data);
  };
  const loadUsers = async () => {
    const { data } = await apiClient.get("/admin-panel/users/");
    setUsers(data.results ?? data);
  };
  const loadPlanners = async () => {
    const { data } = await apiClient.get("/admin-panel/planners/");
    setPlanners(data.results ?? data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), loadUsers(), loadPlanners()]).finally(() => setLoading(false));
  }, []);

  const toggleUserActive = async (id: number) => {
    try {
      await apiClient.post(`/admin-panel/users/${id}/toggle-active/`);
      toast.success("Updated");
      loadUsers();
    } catch {
      toast.error("Could not update user");
    }
  };

  const toggleVerify = async (id: number, verified: boolean) => {
    try {
      await apiClient.post(`/admin-panel/planners/${id}/${verified ? "unverify" : "verify"}/`);
      toast.success(verified ? "Verification revoked" : "Planner verified");
      loadPlanners();
      loadStats();
    } catch {
      toast.error("Could not update planner");
    }
  };

  if (loading) return <p className="text-neutral-500">Loading admin panel...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>

      <div className="flex gap-1 border-b mb-6">
        {(["stats", "users", "planners"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px ${
              view === v ? "border-black font-medium" : "border-transparent text-neutral-500"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "stats" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          <StatCard label="Total Users" value={stats.total_users} />
          <StatCard label="Customers" value={stats.total_customers} />
          <StatCard label="Planners" value={stats.total_planners} />
          <StatCard label="Verified Planners" value={stats.verified_planners} />
          <StatCard label="Pending Verification" value={stats.pending_verifications} />
          <StatCard label="Total Events" value={stats.total_events} />
          <StatCard label="Total Bookings" value={stats.total_bookings} />
          <StatCard label="Total Revenue" value={`₹${stats.total_revenue}`} />
          <StatCard label="New Users (30d)" value={stats.new_users_last_30_days} />
          {stats.bookings_by_status.map((b) => (
            <StatCard key={b.status} label={`Bookings: ${b.status}`} value={b.count} />
          ))}
        </div>
      )}

      {view === "users" && (
        <div className="border rounded-xl bg-white divide-y max-w-2xl">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{u.username} ({u.email})</p>
                <p className="text-xs text-neutral-500 capitalize">{u.role}</p>
              </div>
              <button
                className={`text-xs rounded px-3 py-1 ${
                  u.is_active ? "border text-red-600" : "bg-black text-white"
                }`}
                onClick={() => toggleUserActive(u.id)}
              >
                {u.is_active ? "Suspend" : "Reactivate"}
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "planners" && (
        <div className="border rounded-xl bg-white divide-y max-w-2xl">
          {planners.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{p.business_name}</p>
                <p className="text-xs text-neutral-500">{p.owner_email} · {p.city}</p>
              </div>
              <button
                className={`text-xs rounded px-3 py-1 ${
                  p.is_verified ? "border text-red-600" : "bg-black text-white"
                }`}
                onClick={() => toggleVerify(p.id, p.is_verified)}
              >
                {p.is_verified ? "Revoke" : "Verify"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-xl p-3 bg-white">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
