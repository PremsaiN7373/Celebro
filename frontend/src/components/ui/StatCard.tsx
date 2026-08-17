interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  color?: "purple" | "pink" | "amber" | "emerald" | "biz" | "accent";
}

const COLORS = {
  purple: {
    bg: "bg-gradient-to-br from-purple-50 via-purple-50/50 to-white",
    border: "border-purple-100 hover:border-purple-300",
    text: "text-purple-900",
    label: "text-purple-600/80",
  },
  accent: {
    bg: "bg-gradient-to-br from-purple-50 via-purple-50/50 to-white",
    border: "border-purple-100 hover:border-purple-300",
    text: "text-purple-900",
    label: "text-purple-600/80",
  },
  pink: {
    bg: "bg-gradient-to-br from-fuchsia-50 via-fuchsia-50/50 to-white",
    border: "border-fuchsia-100 hover:border-fuchsia-300",
    text: "text-fuchsia-900",
    label: "text-fuchsia-600/80",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 via-amber-50/50 to-white",
    border: "border-amber-100 hover:border-amber-300",
    text: "text-amber-900",
    label: "text-amber-600/80",
  },
  biz: {
    bg: "bg-gradient-to-br from-amber-50 via-amber-50/50 to-white",
    border: "border-amber-100 hover:border-amber-300",
    text: "text-amber-900",
    label: "text-amber-600/80",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white",
    border: "border-emerald-100 hover:border-emerald-300",
    text: "text-emerald-900",
    label: "text-emerald-600/80",
  },
};

export default function StatCard({ label, value, hint, accent, color = "purple" }: StatCardProps) {
  const scheme = COLORS[color];
  return (
    <div className={`border rounded-[16px] p-5 shadow-[0_4px_20px_rgba(91,33,182,0.03)] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${scheme.bg} ${scheme.border}`}>
      <p className={`text-[10px] uppercase tracking-wider font-bold ${scheme.label}`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-display font-bold mt-2 ${scheme.text}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-[#756D6F] mt-1 font-medium">{hint}</p>}
    </div>
  );
}
