import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import MiniBarChart from "@/components/ui/MiniBarChart";
import StatCard from "@/components/ui/StatCard";
import WidgetCard from "@/components/ui/WidgetCard";
import EmptyState from "@/components/ui/EmptyState";

interface MonthlyEarning {
  month: string;
  total: string;
  commission: string;
  net: string;
  payment_count: number;
}

interface Earnings {
  monthly: MonthlyEarning[];
  total_earned: string;
  total_commission: string;
  total_net: string;
}

export default function PlannerEarningsPage() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get("/payments/earnings/");
        setEarnings(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-ink-400 text-sm">Loading earnings...</p>;
  if (!earnings) return <p className="text-ink-400 text-sm">Could not load earnings.</p>;

  const chartData = earnings.monthly.map((m) => ({
    label: m.month.slice(2), // "26-08" instead of "2026-08" to fit the chart
    value: Math.round(Number(m.net)),
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink-900 dark:text-white mb-1">Earnings</h1>
      <p className="text-sm text-ink-500 mb-6">
        Revenue from paid bookings, after Celebro's platform commission.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Earned" value={`₹${Number(earnings.total_earned).toLocaleString()}`} />
        <StatCard label="Platform Commission" value={`₹${Number(earnings.total_commission).toLocaleString()}`} />
        <StatCard label="Net to You" value={`₹${Number(earnings.total_net).toLocaleString()}`} accent color="biz" />
      </div>

      <WidgetCard title="Monthly Net Earnings">
        {chartData.length === 0 ? (
          <EmptyState message="No paid bookings yet" hint="Earnings appear here once a customer pays an advance." />
        ) : (
          <MiniBarChart data={chartData} color="#4a63ec" />
        )}
      </WidgetCard>

      {earnings.monthly.length > 0 && (
        <WidgetCard title="Breakdown by Month" className="mt-5">
          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {earnings.monthly.map((m) => (
              <div key={m.month} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-600 dark:text-ink-300">{m.month}</span>
                <span className="text-ink-400 text-xs">{m.payment_count} payment{m.payment_count !== 1 ? "s" : ""}</span>
                <span className="font-medium text-ink-800 dark:text-ink-100">₹{m.net}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}
