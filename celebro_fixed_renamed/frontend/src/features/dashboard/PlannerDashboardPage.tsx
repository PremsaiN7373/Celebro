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
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const load = async () => {
    try {
      const [bookingsRes, notifRes] = await Promise.all([
        apiClient.get("/bookings/"),
        apiClient.get("/notifications/"),
      ]);
      setBookings(bookingsRes.data.results ?? bookingsRes.data);
      setNotifications(notifRes.data.results.slice(0, 6));
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink-900 dark:text-white">
              Welcome back, {user?.username}
            </h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
              Here's what's happening with your business today.
            </p>
          </div>
          <Link to="/planner-packages" className="btn-secondary">
            Manage Packages
          </Link>
        </div>
      </motion.div>

      {/* Business stats — planner-specific metrics, not shown to celebrators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Pending Enquiries" value={pending.length} accent />
        <StatCard label="Revenue (Advance)" value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard label="Completed" value={completed.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — operational widgets */}
        <div className="lg:col-span-2 space-y-5">
          <WidgetCard
            title="Booking Requests"
            action={<Link to="/planner-bookings" className="text-xs text-accent-600 underline">View all</Link>}
          >
            {pending.length === 0 ? (
              <EmptyState message="No pending requests" hint="New booking requests will show up here." />
            ) : (
              <div className="divide-y divide-ink-100 dark:divide-ink-700">
                {pending.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{b.event_name}</p>
                      <p className="text-xs text-ink-400">{b.package_title || "Package TBD"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "accept")}
                        className="text-xs bg-ink-900 dark:bg-white text-white dark:text-ink-900 rounded-lg px-2.5 py-1"
                      >
                        Accept
                      </button>
                      <button
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "reject")}
                        className="text-xs border border-ink-200 dark:border-ink-600 rounded-lg px-2.5 py-1"
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
            action={<span className="text-xs text-ink-400">{accepted.length} active</span>}
          >
            {accepted.length === 0 ? (
              <EmptyState message="No active conversations" hint="Accepted bookings unlock chat with the client." />
            ) : (
              <div className="divide-y divide-ink-100 dark:divide-ink-700">
                {accepted.slice(0, 4).map((b) => (
                  <Link
                    key={b.id}
                    to={`/chat/${b.id}`}
                    className="flex items-center justify-between py-2.5 hover:opacity-70"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{b.event_name}</p>
                      <p className="text-xs text-ink-400">{b.package_title || "Package TBD"}</p>
                    </div>
                    <span className="text-xs text-accent-600">Open chat →</span>
                  </Link>
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Analytics — Bookings by Status">
            <MiniBarChart data={statusChart} />
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
          <WidgetCard title="Calendar">
            <MiniCalendar highlightDates={[]} />
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
