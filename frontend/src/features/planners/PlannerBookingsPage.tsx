import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Booking {
  id: number;
  event_name: string;
  package_title: string | null;
  status: "requested" | "accepted" | "rejected" | "cancelled" | "completed";
}

export default function PlannerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/bookings/");
      setBookings(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const respond = async (id: number, action: "accept" | "reject" | "complete") => {
    setActingOn(id);
    try {
      await apiClient.post(`/bookings/${id}/${action}/`);
      const messages = {
        accept: "Booking accepted",
        reject: "Booking rejected",
        complete: "Booking marked completed",
      };
      toast.success(messages[action]);
      loadBookings();
    } catch {
      toast.error("Could not update booking");
    } finally {
      setActingOn(null);
    }
  };

  const downloadInvoice = async (bookingId: number) => {
    try {
      const { data: payments } = await apiClient.get("/payments/", { params: { booking: bookingId } });
      const paid = (payments.results ?? payments).find((p: any) => p.status === "paid");
      if (!paid) {
        toast("No paid invoice yet for this booking.", { icon: "🧾" });
        return;
      }
      const response = await apiClient.get(`/payments/${paid.id}/invoice/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `celebro-invoice-${paid.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download invoice");
    }
  };

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

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Booking Requests</h1>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-neutral-500">No booking requests yet.</p>
      ) : (
        <div className="border rounded-xl bg-white divide-y">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{b.event_name}</p>
                <p className="text-xs text-neutral-500">{b.package_title || "No package selected"}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(b.status)}
                {b.status === "accepted" && (
                  <Link to={`/chat/${b.id}`} className="text-xs underline">
                    Chat
                  </Link>
                )}
                {(b.status === "accepted" || b.status === "completed") && (
                  <button onClick={() => downloadInvoice(b.id)} className="text-xs underline text-ink-500">
                    🧾 Invoice
                  </button>
                )}
                {b.status === "requested" && (
                  <>
                    <button
                      className="text-xs bg-black text-white rounded px-2 py-1 disabled:opacity-50"
                      disabled={actingOn === b.id}
                      onClick={() => respond(b.id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="text-xs border rounded px-2 py-1 disabled:opacity-50"
                      disabled={actingOn === b.id}
                      onClick={() => respond(b.id, "reject")}
                    >
                      Reject
                    </button>
                  </>
                )}
                {b.status === "accepted" && (
                  <button
                    className="text-xs border rounded px-2 py-1 disabled:opacity-50"
                    disabled={actingOn === b.id}
                    onClick={() => respond(b.id, "complete")}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
