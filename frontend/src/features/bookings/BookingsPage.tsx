import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface BookingItem {
  id: number;
  event_name: string;
  planner_name: string;
  package_title: string | null;
  status: "requested" | "accepted" | "rejected" | "cancelled" | "completed";
  created_at: string;
  event_id: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await apiClient.get("/bookings/");
        setBookings(data.results ?? data);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status: BookingItem["status"]) => {
    switch (status) {
      case "accepted":
        return <span className="badge-success">✓ Confirmed</span>;
      case "requested":
        return <span className="badge-warning">⏳ Pending</span>;
      case "completed":
        return <span className="badge-purple">★ Completed</span>;
      case "rejected":
      case "cancelled":
        return <span className="badge-error">✕ Cancelled</span>;
      default:
        return <span className="badge-purple">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">
          Bookings & Contracts
        </h1>
        <p className="text-[#6B6780] text-sm mt-1 font-medium">
          Manage your planner contracts, milestone statuses, and direct communications.
        </p>
      </div>

      {loading ? (
        <p className="text-[#6B6780] text-sm font-medium">Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-12 text-center shadow-[0_4px_20px_rgba(91,33,182,0.06)] space-y-4">
          <p className="font-display text-xl font-bold text-[#17142A]">No active bookings yet.</p>
          <p className="text-sm text-[#6B6780] max-w-md mx-auto font-medium">
            Explore verified master planners for your upcoming celebration and send booking requests.
          </p>
          <Link to="/marketplace" className="btn-primary inline-block text-xs font-semibold">
            Explore Planners →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-[#E9E4F5] rounded-[16px] p-6 shadow-[0_4px_20px_rgba(91,33,182,0.06)] flex flex-col justify-between hover:border-[#5B21B6] transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                    {b.event_name || "Celebration Booking"}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h3 className="font-display text-2xl font-bold text-[#17142A] mt-2">
                  {b.planner_name || "Verified Master Planner"}
                </h3>
                <p className="text-xs text-[#6B6780] mt-1 font-medium">
                  Package: <span className="font-semibold text-[#17142A]">{b.package_title || "Custom Event Package"}</span>
                </p>

                <p className="text-[11px] text-[#6B6780] mt-3 font-medium">
                  Requested on {new Date(b.created_at || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E9E4F5] flex items-center justify-between">
                <Link
                  to={`/chat/${b.id}`}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  💬 Message
                </Link>
                {b.event_id && (
                  <Link
                    to={`/events/${b.event_id}`}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Manage Event →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
