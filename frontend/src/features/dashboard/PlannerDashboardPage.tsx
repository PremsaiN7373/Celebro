import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import MiniCalendar from "@/components/ui/MiniCalendar";
import MiniBarChart from "@/components/ui/MiniBarChart";

interface Booking {
  id: number;
  event_name: string;
  package_title: string | null;
  status: "requested" | "accepted" | "rejected" | "cancelled" | "completed";
  advance_paid: string;
}

interface Notification {
  id: number;
  message: string;
  link: string;
  read_at: string | null;
  created_at: string;
}

export default function PlannerDashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const load = async () => {
    try {
      const [bookingsRes, notifRes, blockedRes] = await Promise.all([
        apiClient.get("/bookings/"),
        apiClient.get("/notifications/"),
        apiClient.get("/planners/blocked-dates/").catch(() => ({ data: [] })),
      ]);
      setBookings(bookingsRes.data.results ?? bookingsRes.data);
      setNotifications(notifRes.data.results.slice(0, 6));
      const blocked = blockedRes.data.results ?? blockedRes.data;
      setBlockedDates(blocked.map((b: { date: string }) => b.date));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = bookings.filter((b) => b.status === "requested");
  const accepted = bookings.filter((b) => b.status === "accepted");
  const completed = bookings.filter((b) => b.status === "completed");
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);

  const statusChart = useMemo(
    () => [
      { label: "Requested", value: pending.length },
      { label: "Accepted", value: accepted.length },
      { label: "Completed", value: completed.length },
    ],
    [bookings]
  );

  const respond = async (id: number, action: "accept" | "reject") => {
    setActingOn(id);
    try {
      await apiClient.post(`/bookings/${id}/${action}/`);
      toast.success(action === "accept" ? "Booking accepted" : "Booking declined");
      load();
    } catch {
      toast.error("Could not update booking");
    } finally {
      setActingOn(null);
    }
  };

  if (loading) return <p className="text-ink-400 text-sm">Loading your dashboard...</p>;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[16px] mb-6 p-8 bg-gradient-to-br from-[#3B176D] via-[#5B21B6] to-[#8B5CF6] text-white shadow-soft"
      >
        {/* decorative glassmorphic rings/blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl z-0" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white/10 blur-2xl z-0" />
        <div className="absolute top-6 right-10 text-5xl opacity-90 animate-bounce duration-1000 z-0">💼</div>
        <div className="absolute bottom-6 right-32 text-3xl opacity-75 -rotate-12 z-0">✨</div>

        <div className="absolute inset-0 z-0">
          <img
            src="/images/proposal_hero.png"
            alt="Planner Atmosphere"
            className="w-full h-full object-cover opacity-15 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-200 font-bold">
              Planner Master Workspace
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl mt-1 text-white">
              Welcome back, {user?.username || "Master Planner"}
            </h1>
            <p className="text-sm text-purple-100 mt-2 font-medium">
              Here's what's happening with your celebration bookings today.
            </p>
          </div>
          <Link
            to="/planner-packages"
            className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-[10px] bg-white text-purple-700 hover:bg-purple-50 transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
          >
            Manage Packages
          </Link>
        </div>
      </motion.div>

      {/* Business stats — planner-specific metrics, not shown to celebrators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Bookings" value={bookings.length} color="purple" />
        <StatCard label="Pending Enquiries" value={pending.length} color="pink" />
        <StatCard label="Revenue (Advance)" value={`₹${totalRevenue.toLocaleString()}`} color="emerald" />
        <StatCard label="Completed" value={completed.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — operational widgets */}
        <div className="lg:col-span-2 space-y-5">
          <WidgetCard
            title="Booking Requests"
            action={<Link to="/planner-bookings" className="text-xs text-[#5B21B6] font-bold hover:underline">View all</Link>}
          >
            {pending.length === 0 ? (
              <EmptyState message="No pending requests" hint="New booking requests will show up here." />
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3.5 border border-softborder rounded-xl hover:bg-[#F5F3FF]/20 transition-all duration-150">
                    <div>
                      <p className="font-bold text-sm text-txtprimary">{b.event_name}</p>
                      <p className="text-xs text-txtsecondary mt-0.5 font-medium">{b.package_title || "Package TBD"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "accept")}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-3 py-1.5 hover:scale-105 active:scale-95 transition-all shadow-xs"
                      >
                        Accept
                      </button>
                      <button
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "reject")}
                        className="text-xs border border-softborder dark:border-ink-600 text-ink-600 dark:text-ink-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg px-3 py-1.5 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard
            title="Client Messages"
            action={
              <span className="text-xs text-[#5B21B6] font-semibold bg-[#F5F3FF] border border-purple-100 px-2 py-0.5 rounded-full">
                {accepted.length} active
              </span>
            }
          >
            {accepted.length === 0 ? (
              <EmptyState message="No active conversations" hint="Accepted bookings unlock chat with the client." />
            ) : (
              <div className="space-y-3">
                {accepted.slice(0, 4).map((b) => (
                  <Link
                    key={b.id}
                    to={`/chat/${b.id}`}
                    className="group flex items-center justify-between p-3.5 border border-softborder rounded-xl hover:bg-[#F5F3FF]/20 hover:border-[#5B21B6]/30 transition-all duration-150"
                  >
                    <div>
                      <p className="font-bold text-sm text-txtprimary group-hover:text-[#5B21B6] transition-colors">{b.event_name}</p>
                      <p className="text-xs text-txtsecondary mt-0.5 font-medium">{b.package_title || "Package TBD"}</p>
                    </div>
                    <span className="text-xs text-[#5B21B6] font-bold group-hover:translate-x-0.5 transition-transform">Open chat →</span>
                  </Link>
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Analytics — Bookings by Status">
            <MiniBarChart data={statusChart} color="#8B5CF6" />
          </WidgetCard>

          <div className="grid grid-cols-2 gap-5">
            <WidgetCard title="Assigned Vendors">
              <EmptyState message="Coming soon" hint="Track sub-vendors per event here." />
            </WidgetCard>
            <WidgetCard title="Event Timeline">
              <EmptyState message="Coming soon" hint="Aggregated milestones across events." />
            </WidgetCard>
          </div>
        </div>

        {/* Right — calendar + activity */}
        <div className="space-y-5">
          <WidgetCard
            title="Calendar"
            action={<Link to="/planner-availability" className="text-xs text-[#5B21B6] font-bold hover:underline">Manage</Link>}
          >
            <MiniCalendar highlightDates={[]} blockedDates={blockedDates} />
          </WidgetCard>

          <WidgetCard title="Recent Activity">
            {notifications.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="text-xs">
                    <p className="text-ink-700 dark:text-ink-200">{n.message}</p>
                    <p className="text-ink-300 dark:text-ink-600 mt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Task List">
            {pending.length === 0 ? (
              <EmptyState message="Nothing needs your attention" />
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                    <span className="text-ink-600 dark:text-ink-300">
                      Respond to {b.event_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
