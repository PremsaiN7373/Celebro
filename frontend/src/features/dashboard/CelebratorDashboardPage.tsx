import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";
import MiniCalendar from "@/components/ui/MiniCalendar";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

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

interface SavedPlannerEntry {
  id: number;
  planner: Planner;
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
  const [savedPlanners, setSavedPlanners] = useState<SavedPlannerEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, bookingsRes, plannersRes, savedRes, notifRes] = await Promise.all([
          apiClient.get("/events/"),
          apiClient.get("/bookings/"),
          apiClient.get("/planners/"),
          apiClient.get("/planners/saved/"),
          apiClient.get("/notifications/"),
        ]);
        setEvents(eventsRes.data.results ?? eventsRes.data);
        setBookings(bookingsRes.data.results ?? bookingsRes.data);
        setPlanners((plannersRes.data.results ?? plannersRes.data).slice(0, 4));
        setSavedPlanners(savedRes.data.results ?? savedRes.data);
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
    <div className="space-y-6">
      {/* Welcome hero — warm, decorative, festive identity */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#3B176D] via-[#5B21B6] to-[#8B5CF6] text-white shadow-soft"
      >
        {/* decorative glassmorphic rings/blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-6 right-10 text-5xl opacity-90 animate-bounce duration-1000">🎉</div>
        <div className="absolute bottom-6 right-32 text-3xl opacity-75 -rotate-12">🎈</div>
        <div className="absolute top-16 right-40 text-2xl opacity-60 rotate-12">✨</div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-200 font-bold relative">
          Celebrator Dashboard
        </p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1 relative font-bold text-white">
          Hi {user?.username}, let's plan something wonderful
        </h1>
        <p className="text-sm text-purple-100 mt-2 relative font-medium">
          {events.length} celebration{events.length !== 1 ? "s" : ""} · {bookings.length} booking
          {bookings.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Countdown hero */}
      {nextEvent ? (
        <div className="bg-gradient-to-br from-[#F5F3FF] via-[#F5F3FF]/30 to-white border border-softborder rounded-[16px] p-6 flex items-center justify-between flex-wrap gap-4 shadow-soft">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#5B21B6] font-bold">
              Up next
            </p>
            <h2 className="font-display text-2xl text-txtprimary mt-1 font-bold">
              {nextEvent.name}
            </h2>
            <p className="text-xs text-txtsecondary mt-1 font-medium">
              📍 {nextEvent.venue || "Venue TBD"} · 📅 {nextEvent.date}
            </p>
          </div>
          <div className="text-right flex items-center gap-4 bg-white/80 border border-softborder rounded-2xl px-5 py-3 shadow-xs">
            <div>
              <p className="text-4xl font-display text-[#5B21B6] font-bold">
                {daysUntil(nextEvent.date)}
              </p>
              <p className="text-[10px] uppercase font-bold text-txtsecondary tracking-wider">days to go</p>
            </div>
            <Link
              to={`/events/${nextEvent.id}`}
              className="btn-primary text-xs font-semibold px-4 py-2.5 rounded-[10px] flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Open workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-softborder rounded-[16px] p-8 text-center shadow-soft">
          <p className="text-txtsecondary font-medium">No upcoming celebrations yet.</p>
          <Link to="/events/create" className="btn-primary inline-flex items-center gap-1.5 mt-4 px-6 py-3 rounded-[10px] shadow-md hover:scale-105 transition-all font-semibold">
            <span>+ Create Event</span>
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="My Bookings" value={bookings.length} color="purple" />
        <StatCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} color="pink" />
        <StatCard label="Advance Paid" value={`₹${totalPaid.toLocaleString()}`} color="amber" />
        <StatCard label="Celebrations" value={events.length} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          <WidgetCard title="My Bookings" action={<Link to="/marketplace" className="text-xs text-[#5B21B6] font-bold hover:underline">Book more</Link>}>
            {bookings.length === 0 ? (
              <EmptyState message="No bookings yet" hint="Browse planners to book your first service." />
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => {
                  const statusColors =
                    b.status.toLowerCase() === "requested"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : b.status.toLowerCase() === "confirmed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : b.status.toLowerCase() === "cancelled"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-[#F5F3FF] text-[#5B21B6] border-[#E9E4F5]";

                  return (
                    <div key={b.id} className="flex items-center justify-between p-3.5 border border-softborder rounded-xl hover:bg-[#F5F3FF]/20 transition-all duration-150">
                      <div>
                        <p className="font-bold text-sm text-txtprimary flex items-center gap-1.5">
                          <span>👑</span> {b.planner_name}
                        </p>
                        <p className="text-xs text-txtsecondary mt-0.5 font-medium">
                          {b.event_name} · {b.package_title || "Package TBD"}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColors}`}>
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Recommended Planners" action={<Link to="/marketplace" className="text-xs text-[#5B21B6] font-bold hover:underline">See all</Link>}>
            {planners.length === 0 ? (
              <EmptyState message="No planners available yet" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {planners.map((p) => (
                  <Link
                    key={p.id}
                    to={`/planners/${p.id}`}
                    className="group bg-[#FCFAFF] border border-softborder rounded-xl p-4 hover:border-[#5B21B6]/30 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5F3FF] text-[#5B21B6] border border-purple-100 px-2 py-0.5 rounded-full inline-block">
                          {p.category.replace(/_/g, " ")}
                        </span>
                        {p.is_verified && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            ✨ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-txtprimary group-hover:text-[#5B21B6] transition-colors mt-2 truncate">
                        {p.business_name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-txtsecondary mt-3 border-t border-softborder/40 pt-2 font-medium">
                      <span>📍 {p.city}</span>
                      <span className="text-[#5B21B6] font-semibold text-[11px] group-hover:underline">View Portfolio →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </WidgetCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <WidgetCard title="Saved Venues">
              <EmptyState message="Coming soon" hint="Save your favorite venues here." />
            </WidgetCard>
            <WidgetCard
              title="Wishlist"
              action={savedPlanners.length > 0 && (
                <Link to="/marketplace" className="text-xs text-[#5B21B6] font-bold hover:underline">
                  Browse more
                </Link>
              )}
            >
              {savedPlanners.length === 0 ? (
                <EmptyState message="Nothing saved yet" hint="Tap the ♡ on any planner to save them here." />
              ) : (
                <div className="space-y-3">
                  {savedPlanners.slice(0, 4).map((s) => (
                    <Link
                      key={s.id}
                      to={`/planners/${s.planner.id}`}
                      className="flex items-center justify-between p-2.5 border border-softborder hover:border-[#5B21B6]/30 hover:bg-[#F5F3FF]/20 rounded-xl transition-all"
                    >
                      <span className="text-xs text-txtprimary font-bold truncate">
                        {s.planner.business_name}
                      </span>
                      <span className="text-[11px] font-semibold text-txtsecondary bg-white px-2 py-0.5 rounded-md border border-softborder shrink-0 ml-2">
                        📍 {s.planner.city}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </WidgetCard>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <WidgetCard title="Calendar">
            <MiniCalendar highlightDates={events.map((e) => e.date)} />
          </WidgetCard>

          <WidgetCard title="Notifications" action={<span className="text-xs text-txtsecondary font-semibold bg-[#F5F3FF] border border-purple-100 text-[#5B21B6] px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read_at).length} new</span>}>
            {notifications.length === 0 ? (
              <EmptyState message="You're all caught up" />
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || "#"}
                    className={`block text-xs p-3 rounded-xl border border-transparent transition-all hover:bg-[#F5F3FF]/10 ${
                      !n.read_at
                        ? "bg-[#F5F3FF] border-purple-100 text-[#5B21B6] font-semibold shadow-xs"
                        : "bg-[#FCFAFF] border-softborder text-txtsecondary"
                    }`}
                  >
                    <p className="leading-relaxed">{n.message}</p>
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
