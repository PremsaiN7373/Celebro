import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import MiniCalendar from "@/components/ui/MiniCalendar";
import WidgetCard from "@/components/ui/WidgetCard";
import EmptyState from "@/components/ui/EmptyState";

interface BlockedDate {
  id: number;
  date: string;
  reason: string;
}

export default function PlannerAvailabilityPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/planners/blocked-dates/");
      setBlockedDates(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDateClick = async (dateKey: string) => {
    const existing = blockedDates.find((b) => b.date === dateKey);
    setBusyDate(dateKey);
    try {
      if (existing) {
        await apiClient.delete(`/planners/blocked-dates/${existing.id}/`);
        toast.success("Date marked available again");
      } else {
        await apiClient.post("/planners/blocked-dates/", { date: dateKey });
        toast.success("Date blocked");
      }
      load();
    } catch {
      toast.error("Could not update that date");
    } finally {
      setBusyDate(null);
    }
  };

  const removeDate = async (id: number) => {
    try {
      await apiClient.delete(`/planners/blocked-dates/${id}/`);
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Could not remove that date");
    }
  };

  return (
    <div className="max-w-5xl w-full space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#120e2e] text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8B4FE]">Luxury Workspace</span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Establish Your Availability</h2>
          <p className="text-xs text-[#C084FC] font-medium leading-relaxed mt-1">
            Toggle dates off-duty to avoid scheduling conflicts during vacations, holiday seasons, or private celebrations. Clients will see date conflicts resolved instantly before sending contracts.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 relative z-10">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Blocked</p>
            <p className="text-xl font-extrabold mt-1">{blockedDates.length} Days</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Status</p>
            <p className="text-xl font-extrabold text-green-400 mt-1">Online</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar Card */}
        <div className="md:col-span-5">
          <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-txtprimary tracking-tight">Interactive Calendar</h3>
            </div>
            <div className="p-1 bg-[#FCFAFF] rounded-xl border border-[#E9E4F5] [&>div]:border-0 [&>div]:p-0 [&>div]:shadow-none">
              {loading ? (
                <p className="text-sm text-ink-400 font-semibold p-4">Loading calendar data...</p>
              ) : (
                <MiniCalendar
                  highlightDates={[]}
                  blockedDates={blockedDates.map((b) => b.date)}
                  onDateClick={handleDateClick}
                  highlightColor="bg-purple-600"
                />
              )}
            </div>
            {busyDate && (
              <p className="text-xs font-bold text-purple-600 animate-pulse mt-3 flex items-center gap-1.5 bg-purple-50 p-2 rounded-lg border border-purple-100/50">
                <span>🔄</span> Syncing date: {busyDate}...
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Blocked Dates list */}
        <div className="md:col-span-7">
          <WidgetCard title="Blocked Dates List">
            {blockedDates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-[#E9E4F5] rounded-[16px] bg-[#FCFAFF]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FAF8FF] to-[#F5F3FF] border border-[#E9E4F5] flex items-center justify-center text-3xl shadow-3xs mb-4">
                  🏝️
                </div>
                <p className="text-sm font-bold text-[#17142A]">Fully Available</p>
                <p className="text-xs text-[#6B6780] mt-1 max-w-[280px] leading-relaxed font-medium">
                  No dates are blocked yet. You are fully available to receive bookings on all days! Click any date on the calendar to mark it busy.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blockedDates.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3.5 border border-[#E9E4F5] hover:border-red-200 hover:bg-[#FFF5F5]/30 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">📅</span>
                      <span className="font-bold text-[#17142A] text-sm truncate">
                        {new Date(b.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDate(b.id)}
                      className="text-xs font-bold text-[#C94B63] hover:text-red-600 bg-[#FFF5F5] border border-[#FEE2E2] px-3 py-1.5 rounded-lg transition-all hover:scale-102 active:scale-98 shadow-3xs shrink-0"
                    >
                      Unblock
                    </button>
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
