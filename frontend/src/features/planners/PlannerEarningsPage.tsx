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
    <div className="max-w-6xl w-full space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#120e2e] text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8B4FE]">Financial Dashboard</span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Earnings & Revenue</h2>
          <p className="text-xs text-[#C084FC] font-medium leading-relaxed mt-1">
            Monitor your payout contracts, track completed event invoices, and review platforms commission deductions transparently.
          </p>
        </div>
      </div>

      {/* Financial Stats Column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E9E4F5] rounded-[20px] p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-[#6B6780] uppercase tracking-wider font-extrabold">Total Earned</p>
          <p className="text-3xl font-extrabold text-[#17142A] mt-3">₹{Number(earnings.total_earned).toLocaleString()}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">💰</div>
        </div>
        <div className="bg-white border border-[#E9E4F5] rounded-[20px] p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-purple-600 uppercase tracking-wider font-extrabold">Platform Commission</p>
          <p className="text-3xl font-extrabold text-[#5B21B6] mt-3">₹{Number(earnings.total_commission).toLocaleString()}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">🏛️</div>
        </div>
        <div className="bg-[#F0FDF4] border border-green-200 rounded-[20px] p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <p className="text-xs text-green-700 uppercase tracking-wider font-extrabold">Net to You</p>
          <p className="text-3xl font-extrabold text-green-800 mt-3">₹{Number(earnings.total_net).toLocaleString()}</p>
          <div className="absolute -bottom-3 -right-3 text-5xl opacity-5 pointer-events-none select-none">💸</div>
        </div>
      </div>

      {/* Grid splits for chart and breakdown list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <WidgetCard title="Monthly Net Earnings">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[#E9E4F5] rounded-[16px] bg-[#FCFAFF]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FAF8FF] to-[#F5F3FF] border border-[#E9E4F5] flex items-center justify-center text-3xl shadow-3xs mb-4">
                  📈
                </div>
                <p className="text-sm font-bold text-[#17142A]">No paid bookings yet</p>
                <p className="text-xs text-[#6B6780] mt-1 max-w-[280px] leading-relaxed font-medium">
                  Your revenue growth will chart here once clients successfully secure bookings and pay package advances.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl">
                <MiniBarChart data={chartData} color="#8B5CF6" />
              </div>
            )}
          </WidgetCard>
        </div>

        <div className="lg:col-span-5">
          <WidgetCard title="Ledger & Breakdown">
            {earnings.monthly.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-[#E9E4F5] rounded-[16px] bg-[#FCFAFF]">
                <p className="text-sm font-bold text-[#17142A]">No payouts recorded</p>
                <p className="text-xs text-[#6B6780] mt-1 max-w-[200px] leading-relaxed font-medium">
                  Monthly payment ledgers will generate on payouts.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {earnings.monthly.map((m) => (
                  <div key={m.month} className="flex items-center justify-between p-3.5 bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl hover:bg-white transition-all shadow-3xs">
                    <div>
                      <p className="text-sm font-bold text-[#17142A]">{m.month}</p>
                      <p className="text-[10px] text-[#6B6780] font-bold uppercase tracking-wider mt-0.5">{m.payment_count} Payment{m.payment_count !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="font-extrabold text-[#5B21B6] text-base">₹{Number(m.net).toLocaleString()}</span>
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
