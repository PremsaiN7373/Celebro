interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-400 dark:text-ink-500">{label}</p>
      <p
        className={`text-2xl font-display mt-1 ${
          accent ? "text-accent-600 dark:text-accent-400" : "text-ink-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{hint}</p>}
    </div>
  );
}
