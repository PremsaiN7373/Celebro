import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import MiniCalendar from "@/components/ui/MiniCalendar";

interface CelebroEvent {
  id: number;
  name: string;
  event_type: string;
  date: string;
  venue: string;
  budget: string | null;
  guest_count: number;
}

interface Booking {
  id: number;
  event_name: string;
  planner_name: string;
  package_title: string | null;
  status: string;
  advance_paid: string;
}

interface Planner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  is_verified: boolean;
}

interface Notification {
  id: number;
  message: string;
  link: string;
  read_at: string | null;
  created_at: string;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CelebratorDashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [events, setEvents] = useState<CelebroEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, bookingsRes, plannersRes, notifRes] = await Promise.all([
          apiClient.get("/events/"),
          apiClient.get("/bookings/"),
          apiClient.get("/planners/"),
          apiClient.get("/notifications/"),
        ]);
        setEvents(eventsRes.data.results ?? eventsRes.data);
        setBookings(bookingsRes.data.results ?? bookingsRes.data);
        setPlanners((plannersRes.data.results ?? plannersRes.data).slice(0, 4));
        setNotifications(notifRes.data.results.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );
  const nextEvent = upcoming[0];
  const totalBudget = events.reduce((sum, e) => sum + Number(e.budget || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);

  if (loading) return <p className="text-ink-400 text-sm">Loading your celebrations...</p>;

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl text-ink-900 dark:text-white">
          Hi {user?.username}, let's plan something wonderful
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          {events.length} celebration{events.length !== 1 ? "s" : ""} · {bookings.length} booking
          {bookings.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Countdown hero */}
      {nextEvent ? (
        <div className="card p-6 mb-6 bg-gradient-to-br from-accent-50 to-white dark:from-accent-950/20 dark:to-ink-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent-600 dark:text-accent-400 font-medium">
              Up next
            </p>
            <h2 className="font-display text-2xl text-ink-900 dark:text-white mt-1">
              {nextEvent.name}
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
              {nextEvent.venue || "Venue TBD"} · {nextEvent.date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-display text-accent-600 dark:text-accent-400">
              {daysUntil(nextEvent.date)}
            </p>
            <p className="text-xs text-ink-400">days to go</p>
            <Link
              to={`/events/${nextEvent.id}`}
              className="text-xs underline text-ink-600 dark:text-ink-300 mt-1 inline-block"
            >
              Open workspace →
            </Link>
          </div>
        </div>
      ) : (
        <div className="card p-6 mb-6 text-center">
          <p className="text-ink-500">No upcoming celebrations yet.</p>
          <Link to="/events/create" className="btn-primary inline-block mt-3">
            + Create Event
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="My Bookings" value={bookings.length} />
        <StatCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} />
        <StatCard label="Advance Paid" value={`₹${totalPaid.toLocaleString()}`} accent />
        <StatCard label="Celebrations" value={events.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          <WidgetCard title="My Bookings" action={<Link to="/marketplace" className="text-xs text-accent-600 underline">Book more</Link>}>
            {bookings.length === 0 ? (
              <EmptyState message="No bookings yet" hint="Browse planners to book your first service." />
            ) : (
              <div className="divide-y divide-ink-100 dark:divide-ink-700">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink-800 dark:text-ink-100">{b.planner_name}</p>
                      <p className="text-xs text-ink-400">{b.event_name} · {b.package_title || "Package TBD"}</p>
                    </div>
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Recommended Planners" action={<Link to="/marketplace" className="text-xs text-accent-600 underline">See all</Link>}>
            {planners.length === 0 ? (
              <EmptyState message="No planners available yet" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {planners.map((p) => (
                  <Link
                    key={p.id}
                    to={`/planners/${p.id}`}
                    className="border border-ink-100 dark:border-ink-700 rounded-xl p-3 hover:border-accent-300 transition-colors"
                  >
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">
                      {p.business_name}
                    </p>
                    <p className="text-xs text-ink-400 capitalize">{p.category.replace(/_/g, " ")}</p>
                    <p className="text-xs text-ink-400">{p.city}</p>
                  </Link>
                ))}
              </div>
            )}
          </WidgetCard>

          <div className="grid grid-cols-2 gap-5">
            <WidgetCard title="Saved Venues">
              <EmptyState message="Coming soon" hint="Save your favorite venues here." />
            </WidgetCard>
            <WidgetCard title="Wishlist">
              <EmptyState message="Coming soon" hint="Bookmark services you love." />
            </WidgetCard>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <WidgetCard title="Calendar">
            <MiniCalendar highlightDates={events.map((e) => e.date)} />
          </WidgetCard>

          <WidgetCard title="Notifications" action={<span className="text-xs text-ink-400">{notifications.filter(n => !n.read_at).length} new</span>}>
            {notifications.length === 0 ? (
              <EmptyState message="You're all caught up" />
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || "#"}
                    className={`block text-xs p-2 rounded-lg ${
                      !n.read_at ? "bg-accent-50 dark:bg-accent-950/20" : ""
                    }`}
                  >
                    <p className="text-ink-700 dark:text-ink-200">{n.message}</p>
                  </Link>
                ))}
              </div>
            )}
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
