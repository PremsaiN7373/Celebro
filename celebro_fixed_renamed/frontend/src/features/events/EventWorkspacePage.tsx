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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const rsvpBadge = (status: Guest["rsvp_status"]) => {
    const styles = {
      pending: "bg-neutral-100 text-neutral-600",
      confirmed: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          placeholder="Guest name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          placeholder="Phone or email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <label className="flex items-center gap-1 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={isVip}
            onChange={(e) => setIsVip(e.target.checked)}
          />
          VIP
        </label>
        <button
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "Add guest"}
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading guests...</p>
      ) : guests.length === 0 ? (
        <p className="text-neutral-500">No guests added yet.</p>
      ) : (
        <div className="border rounded-xl bg-white divide-y">
          {guests.map((g) => (
            <div key={g.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {g.name} {g.is_vip && <span className="text-xs text-amber-600 ml-1">★ VIP</span>}
                </p>
                {g.contact && <p className="text-xs text-neutral-500">{g.contact}</p>}
              </div>
              <div className="flex items-center gap-2">
                {rsvpBadge(g.rsvp_status)}
                <select
                  className="text-xs border rounded px-1 py-1"
                  value={g.rsvp_status}
                  onChange={(e) => updateRsvp(g.id, e.target.value as Guest["rsvp_status"])}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
                <button
                  className="text-xs text-red-500"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const createInvitation = async () => {
    setCreating(true);
    try {
      const { data } = await apiClient.post(`/invitations/event/${eventId}/`);
      setUuid(data.uuid);
      toast.success("Invitation link created");
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
    toast.success("Link copied");
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-md">
      {!uuid ? (
        <div>
          <p className="text-neutral-500 mb-4">
            No invitation link yet — create one to share with your guests.
          </p>
          <button
            className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            disabled={creating}
            onClick={createInvitation}
          >
            {creating ? "Creating..." : "Create invitation link"}
          </button>
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-white space-y-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Shareable link</p>
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 border rounded-lg px-3 py-2 text-xs bg-neutral-50"
                value={inviteUrl}
              />
              <button
                className="text-xs border rounded-lg px-3 py-2"
                onClick={copyLink}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-2">QR code</p>
            <img src={qrUrl} alt="Invitation QR code" className="rounded-lg border" />
          </div>
          <p className="text-xs text-neutral-400">
            Anyone with this link or QR code can view the event details and RSVP —
            no account needed. Confirmed guests show up automatically in the Guests tab.
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
      toast.success("Review submitted");
      onDone();
    } catch (err: any) {
      const detail = err?.response?.data?.booking?.[0] || "Could not submit review";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <select
        className="border rounded px-2 py-1 text-xs"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{"★".repeat(n)}</option>
        ))}
      </select>
      <input
        className="border rounded px-2 py-1 text-xs flex-1 min-w-[140px]"
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        className="text-xs bg-black text-white rounded px-3 py-1 disabled:opacity-50"
        disabled={submitting}
        onClick={submit}
      >
        {submitting ? "Submitting..." : "Submit review"}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const statusBadge = (status: Booking["status"]) => {
    const styles: Record<Booking["status"], string> = {
      requested: "bg-neutral-100 text-neutral-600",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-neutral-100 text-neutral-500",
      completed: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status]}`}>
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
        description: "Advance payment",
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

  if (loading) return <p className="text-neutral-500">Loading bookings...</p>;

  return (
    <div className="max-w-lg">
      {bookings.length === 0 ? (
        <p className="text-neutral-500">
          No bookings yet — browse planners from the Overview tab to book one.
        </p>
      ) : (
        <div className="border rounded-xl bg-white divide-y">
          {bookings.map((b) => (
            <div key={b.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{b.planner_name}</p>
                  <p className="text-xs text-neutral-500">{b.package_title || "No package selected"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(b.status)}
                  {b.status === "accepted" && (
                    <Link to={`/chat/${b.id}`} className="text-xs underline">
                      Chat
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
                <div className="flex gap-2 mt-2">
                  <input
                    className="border rounded-lg px-2 py-1 text-xs w-24"
                    type="number"
                    placeholder="₹ Amount"
                    value={amounts[b.id] || ""}
                    onChange={(e) => setAmounts({ ...amounts, [b.id]: e.target.value })}
                  />
                  <button
                    className="text-xs bg-black text-white rounded px-3 py-1 disabled:opacity-50"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("Budget item added");
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

  const totalPlanned = items.reduce((sum, i) => sum + Number(i.planned_amount), 0);
  const totalActual = items.reduce((sum, i) => sum + Number(i.actual_amount), 0);
  const remaining = totalBudget ? Number(totalBudget) - totalActual : null;

  return (
    <div className="max-w-lg">
      <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
        <div className="border rounded-xl p-3 bg-white">
          <p className="text-neutral-500">Total Budget</p>
          <p className="font-semibold">{totalBudget ? `₹${totalBudget}` : "Not set"}</p>
        </div>
        <div className="border rounded-xl p-3 bg-white">
          <p className="text-neutral-500">Spent</p>
          <p className="font-semibold">₹{totalActual.toFixed(2)}</p>
        </div>
        <div className="border rounded-xl p-3 bg-white">
          <p className="text-neutral-500">Remaining</p>
          <p className={`font-semibold ${remaining !== null && remaining < 0 ? "text-red-600" : ""}`}>
            {remaining !== null ? `₹${remaining.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[120px]"
          placeholder="Category (e.g. Catering)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 text-sm w-28"
          type="number"
          placeholder="Planned ₹"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2 text-sm w-28"
          type="number"
          placeholder="Actual ₹"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <button
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading budget...</p>
      ) : items.length === 0 ? (
        <p className="text-neutral-500">No budget items yet.</p>
      ) : (
        <div className="border rounded-xl bg-white divide-y">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{item.category}</p>
                <p className="text-xs text-neutral-500">
                  Planned ₹{item.planned_amount} · Actual ₹{item.actual_amount}
                </p>
              </div>
              <button className="text-xs text-red-500" onClick={() => removeItem(item.id)}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("Timeline item added");
      loadItems();
    } catch {
      toast.error("Could not add item");
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

  const statusStyle = (status: TimelineItem["status"]) => {
    const styles: Record<TimelineItem["status"], string> = {
      pending: "bg-neutral-100 text-neutral-600",
      in_progress: "bg-amber-100 text-amber-700",
      done: "bg-green-100 text-green-700",
    };
    return styles[status];
  };

  return (
    <div className="max-w-lg">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
          placeholder="Milestone (e.g. Cake delivered)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 text-sm"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <button
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading timeline...</p>
      ) : items.length === 0 ? (
        <p className="text-neutral-500">No timeline items yet.</p>
      ) : (
        <div className="border-l-2 border-neutral-200 ml-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="pl-4 relative">
              <span className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-neutral-300" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.scheduled_at && (
                    <p className="text-xs text-neutral-500">
                      {new Date(item.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className={`text-xs rounded px-2 py-1 capitalize ${statusStyle(item.status)}`}
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as TimelineItem["status"])}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <button className="text-xs text-red-500" onClick={() => removeItem(item.id)}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("Photo added");
      loadPhotos();
    } catch {
      toast.error("Could not add photo — check the URL is a valid image link");
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
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          placeholder="Image URL (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "Add photo"}
        </button>
      </form>
      <p className="text-xs text-neutral-400 mb-6">
        Paste a link to an image (from Cloudinary, Imgur, etc.) — direct file uploads come later.
      </p>

      {loading ? (
        <p className="text-neutral-500">Loading photos...</p>
      ) : photos.length === 0 ? (
        <p className="text-neutral-500">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.image_url}
                alt={photo.caption || "Event photo"}
                className="w-full h-32 object-cover rounded-lg border"
              />
              {photo.caption && (
                <p className="text-xs text-neutral-500 mt-1 truncate">{photo.caption}</p>
              )}
              <button
                className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (!event) return <p className="text-neutral-500">Event not found.</p>;

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-neutral-500 underline">
        ← Back to dashboard
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-semibold">{event.name}</h1>
        <p className="text-sm text-neutral-500 capitalize">
          {event.event_type.replace("_", " ")} · {event.date}
          {event.time ? ` at ${event.time}` : ""}
        </p>
      </div>

      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === t ? "border-black font-medium" : "border-transparent text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="border rounded-xl p-4 bg-white space-y-2 text-sm max-w-lg">
          <p><span className="text-neutral-500">Venue:</span> {event.venue || "TBD"}</p>
          <p><span className="text-neutral-500">Budget:</span> {event.budget ? `₹${event.budget}` : "Not set"}</p>
          <p><span className="text-neutral-500">Guests:</span> {event.guest_count}</p>
          <p><span className="text-neutral-500">Theme:</span> {event.theme || "None"}</p>
          {event.description && (
            <p><span className="text-neutral-500">Description:</span> {event.description}</p>
          )}
          {event.notes && (
            <p><span className="text-neutral-500">Notes:</span> {event.notes}</p>
          )}
          <div className="pt-3">
            <Link
              to={`/marketplace?event=${event.id}`}
              className="inline-block bg-black text-white rounded-lg px-4 py-2 text-sm"
            >
              Browse Planners
            </Link>
          </div>
        </div>
      )}

      {tab === "Guests" && id && <GuestsTab eventId={id} />}
      {tab === "Invite" && id && <InviteTab eventId={id} />}
      {tab === "Bookings" && id && <BookingsTab eventId={id} />}
      {tab === "Budget" && id && <BudgetTab eventId={id} totalBudget={event.budget} />}
      {tab === "Timeline" && id && <TimelineTab eventId={id} />}
      {tab === "Gallery" && id && <GalleryTab eventId={id} />}

      {tab === "Chat" && (
        <p className="text-neutral-500">
          Chat is per-booking — open the <span className="font-medium">Bookings</span> tab and click
          "Chat" next to an accepted booking to message that planner.
        </p>
      )}

      {tab !== "Overview" && tab !== "Guests" && tab !== "Invite" && tab !== "Bookings" && tab !== "Budget" && tab !== "Timeline" && tab !== "Gallery" && tab !== "Chat" && (
        <p className="text-neutral-500">{tab} — built in a later phase.</p>
      )}
    </div>
  );
}
