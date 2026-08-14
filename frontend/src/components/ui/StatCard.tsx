interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  color?: "accent" | "biz";
}

export default function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-[#E9DDD5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(33,31,32,0.06)] relative overflow-hidden group hover:border-[#7A1F3D] transition-all">
      <p className="text-xs uppercase tracking-widest text-[#756D6F] font-bold">{label}</p>
      <p
        className={`text-3xl font-display font-bold mt-2 ${
          accent ? "text-[#7A1F3D]" : "text-[#211F20]"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-[#756D6F] mt-1 font-medium">{hint}</p>}
    </div>
  );
}



