import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Event {
  id: number;
  name: string;
  event_type: string;
  description: string;
  date: string;
  time: string | null;
  venue: string;
  budget: string | null;
  guest_count: number;
  theme: string;
  notes: string;
  is_owner: boolean;
}

interface Guest {
  id: number;
  name: string;
  contact: string;
  is_vip: boolean;
  rsvp_status: "pending" | "confirmed" | "declined";
}

interface Booking {
  id: number;
  planner_name: string;
  package_title: string | null;
  status: "requested" | "accepted" | "rejected" | "cancelled" | "completed";
}

interface BudgetItem {
  id: number;
  category: string;
  planned_amount: string;
  actual_amount: string;
}

interface TimelineItem {
  id: number;
  label: string;
  scheduled_at: string | null;
  status: "pending" | "in_progress" | "done";
  order: number;
}

interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

const TABS = [
  "Overview", "Guests", "Invite", "Bookings", "Budget", "Timeline", "Chat", "Gallery",
] as const;
type Tab = (typeof TABS)[number];

function CollaboratorsSection({ eventId, isOwner }: { eventId: string; isOwner: boolean }) {
  const [collaborators, setCollaborators] = useState<{ id: number; email: string; username: string }[]>([]);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await apiClient.get(`/events/${eventId}/collaborators/`);
      setCollaborators(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiClient.post(`/events/${eventId}/collaborators/`, { email });
      setEmail("");
      toast.success("Co-organizer added");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not add co-organizer");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="bg-noir-card border border-white/12 rounded-3xl p-6 shadow-xl max-w-xl mt-6">
      <p className="font-cinematic text-lg font-bold text-white mb-1">Co-Organizers</p>
      <p className="text-xs text-[#A8A1B5] mb-4">
        Co-organizers can manage guest lists and budget parameters alongside you.
      </p>
      {isOwner && (
        <form onSubmit={invite} className="flex gap-3 mb-4">
          <input
            className="input-field flex-1"
            type="email"
            placeholder="Collaborator's Celebro email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            className="btn-primary text-xs shrink-0"
            disabled={inviting}
            type="submit"
          >
            {inviting ? "Adding..." : "+ Add"}
          </button>
        </form>
      )}
      {loading ? (
        <p className="text-xs text-white/50">Loading co-organizers...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-xs text-white/50">No co-organizers added yet.</p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((c) => (
            <div key={c.id} className="text-xs text-white bg-white/[0.04] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
              <span className="font-semibold">{c.username}</span>
              <span className="text-champagne-400">{c.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeatherWidget({ date, venue }: { date: string; venue: string }) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!venue) {
      setStatus("unavailable");
      return;
    }
    const load = async () => {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(venue)}&count=1`
        );
        const geo = await geoRes.json();
        const place = geo?.results?.[0];
        if (!place) {
          setStatus("unavailable");
          return;
        }

        const daysOut = Math.ceil(
          (new Date(date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
        );
        if (daysOut < 0 || daysOut > 15) {
          setStatus("unavailable");
          return;
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${date}&end_date=${date}`
        );
        const weatherData = await weatherRes.json();
        const temp = weatherData?.daily?.temperature_2m_max?.[0];
        const code = weatherData?.daily?.weathercode?.[0];
        if (temp === undefined) {
          setStatus("unavailable");
          return;
        }
        setWeather({ temp, code });
        setStatus("ready");
      } catch {
        setStatus("unavailable");
      }
    };
    load();
  }, [date, venue]);

  const weatherEmoji = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  };

  if (status === "unavailable") return null;

  return (
    <div className="bg-noir-card border border-white/12 rounded-3xl p-6 shadow-xl max-w-xl mt-6">
      <p className="font-cinematic text-lg font-bold text-white mb-1">Venue Weather Forecast</p>
      {status === "loading" ? (
        <p className="text-xs text-white/50">Retrieving forecast...</p>
      ) : (
        <p className="text-sm font-medium text-txtsecondary">
          {weatherEmoji(weather!.code)} {Math.round(weather!.temp)}°C expected in {venue}
        </p>
      )}
    </div>
  );
}

function GuestsTab({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadGuests = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/guests/", { params: { event: eventId } });
      setGuests(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/guests/", {
        event: Number(eventId),
        name,
        contact,
        is_vip: isVip,
      });
      setName("");
      setContact("");
      setIsVip(false);
      toast.success("Guest added");
      loadGuests();
    } catch {
      toast.error("Could not add guest");
    } finally {
      setAdding(false);
    }
  };

  const updateRsvp = async (guestId: number, status: Guest["rsvp_status"]) => {
    try {
      await apiClient.patch(`/guests/${guestId}/`, { rsvp_status: status });
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, rsvp_status: status } : g))
      );
    } catch {
      toast.error("Could not update RSVP");
    }
  };

  const removeGuest = async (guestId: number) => {
    try {
      await apiClient.delete(`/guests/${guestId}/`);
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
    } catch {
      toast.error("Could not remove guest");
    }
  };

  const exportCsv = () => {
    if (guests.length === 0) {
      toast("No guests to export yet.", { icon: "📋" });
      return;
    }
    const header = "Name,Contact,VIP,RSVP Status\n";
    const rows = guests
      .map((g) => {
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        return [escape(g.name), escape(g.contact || ""), g.is_vip ? "Yes" : "No", g.rsvp_status].join(",");
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `guest-list-${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const rsvpBadge = (status: Guest["rsvp_status"]) => {
    const styles = {
      pending: "bg-white/10 text-[#A8A1B5]",
      confirmed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      declined: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    };
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinematic text-2xl font-bold text-white">Guest List</h3>
        <button onClick={exportCsv} className="text-xs font-semibold text-champagne-400 hover:underline">
          ⬇️ Export CSV
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-center bg-noir-card p-4 rounded-3xl border border-white/12">
        <input
          className="input-field flex-1 min-w-[160px]"
          placeholder="Guest Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input-field flex-1 min-w-[160px]"
          placeholder="Phone or Email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-white/80 font-medium px-2">
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e) => setIsVip(e.target.checked)}
            className="accent-royal-500"
          />
          ⭐ VIP
        </label>
        <button
          className="btn-primary text-xs"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "+ Add Guest"}
        </button>
      </form>

      {loading ? (
        <p className="text-white/60 text-sm">Loading guest roster...</p>
      ) : guests.length === 0 ? (
        <p className="text-white/60 text-sm">No guests added to list yet.</p>
      ) : (
        <div className="bg-noir-card border border-white/12 rounded-3xl divide-y divide-white/10 overflow-hidden shadow-xl">
          {guests.map((g) => (
            <div key={g.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-bold text-white">
                  {g.name} {g.is_vip && <span className="text-xs text-champagne-400 font-semibold ml-2">★ VIP</span>}
                </p>
                {g.contact && <p className="text-xs text-[#A8A1B5]">{g.contact}</p>}
              </div>
              <div className="flex items-center gap-3">
                {rsvpBadge(g.rsvp_status)}
                <select
                  className="text-xs bg-white/[0.06] border border-white/15 rounded-xl px-2 py-1 text-white [color-scheme:dark]"
                  value={g.rsvp_status}
                  onChange={(e) => updateRsvp(g.id, e.target.value as Guest["rsvp_status"])}
                >
                  <option value="pending" className="bg-noir-card">Pending</option>
                  <option value="confirmed" className="bg-noir-card">Confirmed</option>
                  <option value="declined" className="bg-noir-card">Declined</option>
                </select>
                <button
                  className="text-xs text-rose-400 hover:underline"
                  onClick={() => removeGuest(g.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InviteTab({ eventId }: { eventId: string }) {
  const [uuid, setUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadInvitation = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/invitations/event/${eventId}/`);
      setUuid(data.uuid);
    } catch {
      setUuid(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitation();
  }, [eventId]);

  const createInvitation = async () => {
    setCreating(true);
    try {
      const { data } = await apiClient.post(`/invitations/event/${eventId}/`);
      setUuid(data.uuid);
      toast.success("Digital invitation link generated!");
    } catch {
      toast.error("Could not create invitation");
    } finally {
      setCreating(false);
    }
  };

  const inviteUrl = uuid ? `${window.location.origin}/invite/${uuid}` : "";
  const qrUrl = uuid
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copied to clipboard");
  };

  if (loading) return <p className="text-white/60 text-sm">Loading invitation portal...</p>;

  return (
    <div className="max-w-xl space-y-6">
      {!uuid ? (
        <div className="bg-noir-card border border-white/12 rounded-3xl p-8 text-center space-y-4">
          <p className="text-white/80 font-medium">
            Generate a custom digital invitation web link and QR code to collect guest RSVPs automatically.
          </p>
          <button
            className="btn-primary"
            disabled={creating}
            onClick={createInvitation}
          >
            {creating ? "Generating..." : "✨ Generate Digital Invitation"}
          </button>
        </div>
      ) : (
        <div className="bg-noir-card border border-white/12 rounded-3xl p-7 space-y-6 shadow-xl">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-champagne-400 mb-2">Shareable Guest Link</p>
            <div className="flex gap-2">
              <input
                readOnly
                className="input-field flex-1 text-xs"
                value={inviteUrl}
              />
              <button
                className="btn-secondary text-xs"
                onClick={copyLink}
              >
                Copy
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `You're invited! 🎉 RSVP here: ${inviteUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-champagne-400 mb-3">Event QR Code</p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
              <img src={qrUrl} alt="Invitation QR code" className="w-40 h-40 rounded-xl" />
            </div>
          </div>
          <p className="text-xs text-[#A8A1B5] leading-relaxed">
            Anyone with this link or QR code can view event details and RSVP without logging in.
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ bookingId, onDone }: { bookingId: number; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/reviews/", { booking: bookingId, rating, comment });
      toast.success("Review submitted!");
      onDone();
    } catch (err: any) {
      const detail = err?.response?.data?.booking?.[0] || "Could not submit review";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/10">
      <select
        className="input-field w-24 text-xs [color-scheme:dark]"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n} className="bg-noir-card">{"★".repeat(n)}</option>
        ))}
      </select>
      <input
        className="input-field flex-1 text-xs"
        placeholder="Leave a comment for this planner..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        className="btn-primary text-xs"
        disabled={submitting}
        onClick={submit}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BookingsTab({ eventId }: { eventId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOn, setPayingOn] = useState<number | null>(null);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  const loadBookings = async () => {
    try {
      const { data } = await apiClient.get("/bookings/", { params: { event: eventId } });
      setBookings(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [eventId]);

  const statusBadge = (status: Booking["status"]) => {
    const styles: Record<Booking["status"], string> = {
      requested: "bg-white/10 text-white/70",
      accepted: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      rejected: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
      cancelled: "bg-white/5 text-white/40",
      completed: "bg-royal-500/20 text-royal-300 border border-royal-400/30",
    };
    return (
      <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const handlePay = async (bookingId: number) => {
    const amount = amounts[bookingId];
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter an amount to pay");
      return;
    }
    setPayingOn(bookingId);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway");
        return;
      }

      const { data: order } = await apiClient.post("/payments/create-order/", {
        booking: bookingId,
        amount,
      });

      const rzp = new (window as any).Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: "Celebro",
        description: "Advance Payment",
        handler: async (response: any) => {
          try {
            await apiClient.post("/payments/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            loadBookings();
          } catch {
            toast.error("Payment verification failed");
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Could not start payment";
      toast.error(detail);
    } finally {
      setPayingOn(null);
    }
  };

  if (loading) return <p className="text-white/60 text-sm">Loading bookings...</p>;

  return (
    <div className="max-w-2xl space-y-4">
      {bookings.length === 0 ? (
        <p className="text-white/60 text-sm">
          No bookings active for this event yet — browse planners from the Overview tab.
        </p>
      ) : (
        <div className="bg-noir-card border border-white/12 rounded-3xl divide-y divide-white/10 shadow-xl overflow-hidden">
          {bookings.map((b) => (
            <div key={b.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-cinematic text-lg font-bold text-white">{b.planner_name}</p>
                  <p className="text-xs text-[#A8A1B5] mt-0.5">{b.package_title || "Custom Package"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(b.status)}
                  {b.status === "accepted" && (
                    <Link to={`/chat/${b.id}`} className="btn-secondary text-xs">
                      💬 Chat
                    </Link>
                  )}
                </div>
              </div>
              {b.status === "completed" && !reviewedIds.has(b.id) && (
                <ReviewForm
                  bookingId={b.id}
                  onDone={() => setReviewedIds((prev) => new Set(prev).add(b.id))}
                />
              )}
              {b.status === "accepted" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                  <input
                    className="input-field max-w-[140px] text-xs"
                    type="number"
                    placeholder="₹ Amount"
                    value={amounts[b.id] || ""}
                    onChange={(e) => setAmounts({ ...amounts, [b.id]: e.target.value })}
                  />
                  <button
                    className="btn-primary text-xs"
                    disabled={payingOn === b.id}
                    onClick={() => handlePay(b.id)}
                  >
                    {payingOn === b.id ? "Processing..." : "Pay Advance"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetTab({ eventId, totalBudget }: { eventId: string; totalBudget: string | null }) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [adding, setAdding] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/budget/", { params: { event: eventId } });
      setItems(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/budget/", {
        event: Number(eventId),
        category,
        planned_amount: Number(planned) || 0,
        actual_amount: Number(actual) || 0,
      });
      setCategory("");
      setPlanned("");
      setActual("");
      toast.success("Budget entry added");
      loadItems();
    } catch {
      toast.error("Could not add budget item");
    } finally {
      setAdding(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await apiClient.delete(`/budget/${id}/`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Could not remove item");
    }
  };

  const totalActual = items.reduce((sum, i) => sum + Number(i.actual_amount), 0);
  const remaining = totalBudget ? Number(totalBudget) - totalActual : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-noir-card border border-white/12 rounded-3xl p-5 shadow-xl">
          <p className="text-xs uppercase tracking-wider text-champagne-400 font-semibold">Total Target</p>
          <p className="font-cinematic text-2xl font-bold text-white mt-1">{totalBudget ? `₹${Number(totalBudget).toLocaleString()}` : "Not set"}</p>
        </div>
        <div className="bg-noir-card border border-white/12 rounded-3xl p-5 shadow-xl">
          <p className="text-xs uppercase tracking-wider text-champagne-400 font-semibold">Spent</p>
          <p className="font-cinematic text-2xl font-bold text-white mt-1">₹{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-noir-card border border-white/12 rounded-3xl p-5 shadow-xl">
          <p className="text-xs uppercase tracking-wider text-champagne-400 font-semibold">Remaining</p>
          <p className={`font-cinematic text-2xl font-bold mt-1 ${remaining !== null && remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {remaining !== null ? `₹${remaining.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-center bg-noir-card p-4 rounded-3xl border border-white/12">
        <input
          className="input-field flex-1 min-w-[140px]"
          placeholder="Category (e.g. Venue Decor)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          className="input-field w-32"
          type="number"
          placeholder="Planned ₹"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
        />
        <input
          className="input-field w-32"
          type="number"
          placeholder="Actual ₹"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <button
          className="btn-primary text-xs"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "+ Add Entry"}
        </button>
      </form>

      {loading ? (
        <p className="text-white/60 text-sm">Loading budget parameters...</p>
      ) : items.length === 0 ? (
        <p className="text-white/60 text-sm">No budget entries created yet.</p>
      ) : (
        <div className="bg-noir-card border border-white/12 rounded-3xl divide-y divide-white/10 shadow-xl overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-bold text-white">{item.category}</p>
                <p className="text-xs text-[#A8A1B5]">
                  Planned: ₹{Number(item.planned_amount).toLocaleString()} • Actual: ₹{Number(item.actual_amount).toLocaleString()}
                </p>
              </div>
              <button className="text-xs text-rose-400 hover:underline" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineTab({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [adding, setAdding] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/timeline/", { params: { event: eventId } });
      setItems(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/timeline/", {
        event: Number(eventId),
        label,
        scheduled_at: scheduledAt || null,
        order: items.length,
      });
      setLabel("");
      setScheduledAt("");
      toast.success("Timeline milestone added");
      loadItems();
    } catch {
      toast.error("Could not add milestone");
    } finally {
      setAdding(false);
    }
  };

  const updateStatus = async (id: number, status: TimelineItem["status"]) => {
    try {
      await apiClient.patch(`/timeline/${id}/`, { status });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      toast.error("Could not update status");
    }
  };

  const removeItem = async (id: number) => {
    try {
      await apiClient.delete(`/timeline/${id}/`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Could not remove item");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-center bg-noir-card p-4 rounded-3xl border border-white/12">
        <input
          className="input-field flex-1 min-w-[180px]"
          placeholder="Milestone (e.g. Balloon Decor Setup)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <input
          className="input-field w-48 [color-scheme:dark]"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <button
          className="btn-primary text-xs"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "+ Add Milestone"}
        </button>
      </form>

      {loading ? (
        <p className="text-white/60 text-sm">Loading timeline...</p>
      ) : items.length === 0 ? (
        <p className="text-white/60 text-sm">No timeline milestones added yet.</p>
      ) : (
        <div className="border-l-2 border-royal-500/40 ml-3 space-y-6 pl-6 py-2">
          {items.map((item) => (
            <div key={item.id} className="relative bg-noir-card border border-white/12 rounded-3xl p-5 shadow-xl">
              <span className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-gradient-to-r from-royal-500 to-celebrate-500 border-2 border-noir" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-base">{item.label}</p>
                  {item.scheduled_at && (
                    <p className="text-xs text-[#A8A1B5] mt-0.5">
                      📅 {new Date(item.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="text-xs bg-white/[0.06] border border-white/15 rounded-xl px-3 py-1.5 text-white [color-scheme:dark]"
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as TimelineItem["status"])}
                  >
                    <option value="pending" className="bg-noir-card">Pending</option>
                    <option value="in_progress" className="bg-noir-card">In Progress</option>
                    <option value="done" className="bg-noir-card">Done</option>
                  </select>
                  <button className="text-xs text-rose-400 hover:underline" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryTab({ eventId }: { eventId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [adding, setAdding] = useState(false);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/events/photos/", { params: { event: eventId } });
      setPhotos(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/events/photos/", {
        event: Number(eventId),
        image_url: imageUrl,
        caption,
      });
      setImageUrl("");
      setCaption("");
      toast.success("Photo added to gallery");
      loadPhotos();
    } catch {
      toast.error("Could not add photo — enter a valid image URL");
    } finally {
      setAdding(false);
    }
  };

  const removePhoto = async (id: number) => {
    try {
      await apiClient.delete(`/events/photos/${id}/`);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Could not remove photo");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-center bg-noir-card p-4 rounded-3xl border border-white/12">
        <input
          className="input-field flex-1 min-w-[200px]"
          placeholder="Image URL (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <input
          className="input-field flex-1 min-w-[140px]"
          placeholder="Caption (Optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button
          className="btn-primary text-xs"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "+ Add Photo"}
        </button>
      </form>

      {loading ? (
        <p className="text-white/60 text-sm">Loading event lookbook...</p>
      ) : photos.length === 0 ? (
        <p className="text-white/60 text-sm">No photos uploaded to this event yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-white/12 bg-noir-card">
              <img
                src={photo.image_url}
                alt={photo.caption || "Event photo"}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.caption && (
                <p className="text-xs text-white/80 p-2 font-medium truncate bg-noir/80 backdrop-blur-sm">{photo.caption}</p>
              )}
              <button
                className="absolute top-2 right-2 bg-rose-500/80 text-white text-xs font-semibold rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(photo.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatTab({ eventId }: { eventId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data } = await apiClient.get("/bookings/", { params: { event: eventId } });
        setBookings(data.results ?? data);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [eventId]);

  if (loading) return <p className="text-white/60 text-sm">Loading chat sessions...</p>;

  const activeBookings = bookings.filter(b => b.status === "accepted");

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-noir-card border border-white/12 rounded-3xl p-6 shadow-xl">
        <h3 className="font-cinematic text-lg font-bold text-white mb-2">Event Chat Sessions</h3>
        <p className="text-xs text-[#A8A1B5] mb-5">Select an accepted booking to start planning details with your planner.</p>

        {activeBookings.length === 0 ? (
          <p className="text-sm text-white/70">
            No active chat sessions. Chat becomes available once a planner accepts your booking request.
          </p>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3.5 border border-white/10 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all duration-150">
                <div>
                  <p className="font-bold text-sm text-white">💬 {b.planner_name}</p>
                  <p className="text-xs text-[#A8A1B5] mt-0.5">{b.package_title || "Custom Package"}</p>
                </div>
                <Link
                  to={`/chat/${b.id}`}
                  className="btn-primary text-xs font-semibold px-4 py-2 rounded-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  Open Chat ➔
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export default function EventWorkspacePage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get(`/events/${id}/`);
        setEvent(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="text-white/60 text-sm">Loading workspace...</p>;
  if (!event) return <p className="text-white/60 text-sm">Event not found.</p>;

  return (
    <div className="space-y-8 pb-16">
      <Link to="/dashboard" className="text-xs font-semibold text-[#5B21B6] hover:underline inline-block">
        ← Back to Dashboard
      </Link>

      <div className="bg-gradient-to-br from-[#3B176D] via-[#5B21B6] to-[#8B5CF6] text-white rounded-3xl p-8 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl pointer-events-none" />
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200 block mb-1">
          {event.event_type.replace("_", " ")} Workspace
        </span>
        <h1 className="font-cinematic text-4xl sm:text-5xl font-bold text-white">{event.name}</h1>
        <p className="text-sm text-purple-100 mt-2">
          📅 {event.date} {event.time ? `at ${event.time}` : ""} • 📍 {event.venue || "Private Venue TBD"}
        </p>
      </div>

      <div className="event-workspace-page space-y-8">
        {/* Tabs Row */}
      <div className="flex gap-2 border-b border-white/12 pb-3 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              tab === t
                ? "bg-gradient-to-r from-royal-500 to-celebrate-500 text-white shadow-lg shadow-royal-500/25"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="bg-noir-card border border-white/12 rounded-3xl p-7 space-y-4 text-sm max-w-xl shadow-xl">
          <p><span className="text-[#A8A1B5] font-semibold">Venue:</span> <span className="text-white font-bold">{event.venue || "TBD"}</span></p>
          <p><span className="text-[#A8A1B5] font-semibold">Budget:</span> <span className="text-white font-bold">{event.budget ? `₹${Number(event.budget).toLocaleString()}` : "Flexible"}</span></p>
          <p><span className="text-[#A8A1B5] font-semibold">Guest Count:</span> <span className="text-white font-bold">{event.guest_count}</span></p>
          <p><span className="text-[#A8A1B5] font-semibold">Decor Theme:</span> <span className="text-white font-bold">{event.theme || "Custom"}</span></p>
          {event.description && (
            <p><span className="text-[#A8A1B5] font-semibold">Description:</span> <span className="text-white/90">{event.description}</span></p>
          )}
          <div className="pt-4 flex gap-3">
            <Link
              to={`/marketplace?event=${event.id}`}
              className="btn-primary text-xs"
            >
              Browse Planners for this Event ➔
            </Link>
          </div>
        </div>
      )}

      {tab === "Overview" && id && (
        <>
          <WeatherWidget date={event.date} venue={event.venue} />
          <CollaboratorsSection eventId={id} isOwner={event.is_owner} />
        </>
      )}

      {tab === "Guests" && id && <GuestsTab eventId={id} />}
      {tab === "Invite" && id && <InviteTab eventId={id} />}
      {tab === "Bookings" && id && <BookingsTab eventId={id} />}
      {tab === "Budget" && id && <BudgetTab eventId={id} totalBudget={event.budget} />}
      {tab === "Timeline" && id && <TimelineTab eventId={id} />}
      {tab === "Chat" && id && <ChatTab eventId={id} />}
      {tab === "Gallery" && id && <GalleryTab eventId={id} />}
      </div>
    </div>
  );
}

