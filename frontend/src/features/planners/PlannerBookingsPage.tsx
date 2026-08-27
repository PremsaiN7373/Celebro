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

  const pendingCount = bookings.filter((b) => b.status === "requested").length;
  const activeCount = bookings.filter((b) => b.status === "accepted").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const totalCount = bookings.length;

  const statusBadge = (status: Booking["status"]) => {
    const styles: Record<Booking["status"], { bg: string; dot: string; label: string }> = {
      requested: { bg: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500", label: "Pending Approval" },
      accepted: { bg: "bg-green-50 text-green-700 border-green-100", dot: "bg-green-500", label: "Active Booking" },
      rejected: { bg: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500", label: "Rejected" },
      cancelled: { bg: "bg-neutral-50 text-neutral-500 border-neutral-100", dot: "bg-neutral-400", label: "Cancelled" },
      completed: { bg: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-500", label: "Completed" },
    };
    const style = styles[status] || styles.requested;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${style.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {style.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#17142A]">Booking & Contracts</h1>
        <p className="text-sm text-[#6B6780] font-medium mt-1">
          Review, accept, and manage incoming client reservation requests and active event contracts.
        </p>
      </div>

      {/* Summary Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E9E4F5] rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <p className="text-xs text-[#6B6780] uppercase tracking-wider font-bold">Total Requests</p>
          <p className="text-3xl font-extrabold text-[#17142A] mt-2">{totalCount}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">📥</div>
        </div>
        <div className="bg-white border border-[#E9E4F5] rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <p className="text-xs text-blue-600 uppercase tracking-wider font-bold">Pending Approval</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">{pendingCount}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">⏳</div>
        </div>
        <div className="bg-white border border-[#E9E4F5] rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Active Bookings</p>
          <p className="text-3xl font-extrabold text-green-700 mt-2">{activeCount}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">✅</div>
        </div>
        <div className="bg-white border border-[#E9E4F5] rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold">Completed Jobs</p>
          <p className="text-3xl font-extrabold text-indigo-700 mt-2">{completedCount}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">🏆</div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <p className="text-neutral-500 font-semibold">Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-[#E9E4F5] rounded-2xl p-12 text-center shadow-2xs">
          <p className="text-[#17142A] font-bold text-lg">No booking requests yet</p>
          <p className="text-[#6B6780] text-sm mt-1">Pending client requests will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-[#E9E4F5] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-[#8B5CF6]/30 transition-all duration-300 hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8B5CF6] tracking-wider">Event Booking</span>
                  <h3 className="font-display text-lg font-bold text-[#17142A] leading-snug">{b.event_name}</h3>
                  <p className="text-xs text-[#6B6780] font-semibold flex items-center gap-1.5 mt-1">
                    <span>📦</span> {b.package_title || "Custom Package Option"}
                  </p>
                </div>
                {statusBadge(b.status)}
              </div>

              <div className="mt-6 pt-4 border-t border-[#F5F3FF] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {b.status === "accepted" && (
                    <Link
                      to={`/chat/${b.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B21B6] hover:text-[#4C1D95] bg-[#F5F3FF] hover:bg-[#EDE9FE] px-3.5 py-2 rounded-xl transition-all"
                    >
                      💬 Chat
                    </Link>
                  )}
                  {(b.status === "accepted" || b.status === "completed") && (
                    <button
                      onClick={() => downloadInvoice(b.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6780] hover:text-[#17142A] bg-white border border-[#E9E4F5] hover:bg-[#FAF9FF] px-3.5 py-2 rounded-xl transition-all shadow-3xs"
                    >
                      🧾 Invoice
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {b.status === "requested" && (
                    <>
                      <button
                        className="text-xs bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold px-4 py-2 rounded-xl shadow-xs disabled:opacity-50 transition-all hover:scale-102 active:scale-98"
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="text-xs border border-[#E9E4F5] bg-white text-[#6B6780] hover:bg-red-50 hover:text-red-600 font-bold px-4 py-2 rounded-xl shadow-3xs disabled:opacity-50 transition-all hover:scale-102 active:scale-98"
                        disabled={actingOn === b.id}
                        onClick={() => respond(b.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button
                      className="text-xs bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold px-4 py-2 rounded-xl shadow-xs disabled:opacity-50 transition-all hover:scale-102 active:scale-98"
                      disabled={actingOn === b.id}
                      onClick={() => respond(b.id, "complete")}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
