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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink-900 dark:text-white mb-1">Availability</h1>
      <p className="text-sm text-ink-500 mb-6">
        Click a date to mark it unavailable — customers will see this before booking you.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <WidgetCard title="Calendar">
          {loading ? (
            <p className="text-sm text-ink-400">Loading...</p>
          ) : (
            <MiniCalendar
              highlightDates={[]}
              blockedDates={blockedDates.map((b) => b.date)}
              onDateClick={handleDateClick}
              highlightColor="bg-biz-500"
            />
          )}
          {busyDate && <p className="text-xs text-ink-400 mt-2">Updating...</p>}
        </WidgetCard>

        <WidgetCard title="Blocked Dates">
          {blockedDates.length === 0 ? (
            <EmptyState message="No dates blocked yet" hint="Click any date on the calendar to block it." />
          ) : (
            <div className="space-y-2">
              {blockedDates.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700 dark:text-ink-200">
                    {new Date(b.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => removeDate(b.id)}
                    className="text-xs text-red-500 hover:underline"
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
  );
}
